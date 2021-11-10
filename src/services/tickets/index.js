import express from "express";
import createHttpError from "http-errors";
import {
  onlyAdminAllowedRoute,
  onlyAdminAndSupportTeamAllowedRoute,
} from "../../auth/adminOrSupportTeam_validation_middleware.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import TicketModel from "./schema.js";
import CustomerModel from "../users/schema.js";

//pdf
import pdf from "html-pdf";
import { pdfTemplate } from "../../utils/pdfTemplate.js";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ticketRouter = express.Router();

//admin can get all ticket
ticketRouter.get(
  "/",
  JWTAuthMiddleware,
  onlyAdminAllowedRoute,
  async (req, res, next) => {
    try {
      const tickets = await TicketModel.find()
        .populate("sender")
        .populate("assignedTo")
        .populate("messageHistory");

      res.send(tickets);
    } catch (error) {
      next(error);
    }
  }
);

//all can send a ticket
ticketRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { sender } = req.body;
    console.log("sender email", sender);
    const user = await CustomerModel.findOne({ email: sender });
    console.log("sender email user", user);
    const ticket = new TicketModel({
      ...req.body,
      sender: user._id.toString(),
    });
    const newTicket = await ticket.save();
    res.status(201).send(newTicket);
  } catch (error) {
    next(error);
  }
});

//admin and support-team can get single ticket
ticketRouter.get(
  "/:ticketId",
  JWTAuthMiddleware,
  onlyAdminAndSupportTeamAllowedRoute,
  async (req, res, next) => {
    const ticketId = req.params.ticketId;
    try {
      const ticket = await TicketModel.findById(ticketId).populate("sender");
      if (ticket) {
        res.status(200).send(ticket);
      } else {
        next(createHttpError(404, `Ticket with id: ${ticketId} not found`));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
//support-team and Admin edit a ticket
ticketRouter.put(
  "/:ticketId",
  JWTAuthMiddleware,
  onlyAdminAndSupportTeamAllowedRoute,
  async (req, res, next) => {
    const ticketId = req.params.ticketId;
    try {
      const updatedTicket = await TicketModel.findByIdAndUpdate(
        ticketId,
        { $set: req.body },
        { new: true }
      );
      if (updatedTicket) {
        res.status(200).send(updatedTicket);
      } else {
        next(createHttpError(404, "ticket not found"));
      }
    } catch (error) {
      next(error);
    }
  }
);
//support-team and Admin assign
ticketRouter.put(
  "/assign/:ticketId",
  JWTAuthMiddleware,
  onlyAdminAndSupportTeamAllowedRoute,
  async (req, res, next) => {
    const ticketId = req.params.ticketId;
    try {
      const updatedTicket = await TicketModel.findByIdAndUpdate(ticketId, {
        new: true,
      });
      if (updatedTicket) {
        res.status(200).send(updatedTicket);
      } else {
        next(createHttpError(404, "ticket not found"));
      }
    } catch (error) {
      next(error);
    }
  }
);
ticketRouter.put(
  "/reply/:ticketId",

  JWTAuthMiddleware,

  async (req, res, next) => {
    const ticketId = req.params.ticketId;
    const { messageHistory } = req.body;

    try {
      const updatedTicket = await TicketModel.findByIdAndUpdate(
        ticketId,
        {
          $push: {
            messageHistory: [...messageHistory],
          },
        },

        { new: true }
      );
      if (updatedTicket) {
        res.status(200).send(updatedTicket);
      } else {
        next(createHttpError(404, `Ticket with id: ${ticketId} not found`));
      }
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//admin and support-team can close a ticket

ticketRouter.put(
  "/close-ticket/:ticketId",

  JWTAuthMiddleware,
  onlyAdminAndSupportTeamAllowedRoute,
  async (req, res, next) => {
    const ticketId = req.params.ticketId;
    const { status } = req.body;
    try {
      const ticketStatus = await TicketModel.findById(ticketId);
      if (ticketStatus.status === "new" || ticketStatus.status === "assigned") {
        const closedTicket = await TicketModel.findByIdAndUpdate(
          ticketId,
          { status: "closed" },
          { new: true }
        );
        if (closedTicket) {
          res.status(200).send(closedTicket);
        } else {
          next(createHttpError(404, `Ticket with id: ${ticketId} not found`));
        }
      } else {
        const closedTicket = await TicketModel.findByIdAndUpdate(
          ticketId,
          { status: "new" },
          { new: true }
        );
        if (closedTicket) {
          res.status(200).send(closedTicket);
        } else {
          next(createHttpError(404, `Ticket with id: ${ticketId} not found`));
        }
      }
    } catch (error) {
      next(error);
    }
  }
);

//admin and support-team can delete a ticket
ticketRouter.delete(
  "/:ticketId",

  JWTAuthMiddleware,
  onlyAdminAndSupportTeamAllowedRoute,
  async (req, res, next) => {
    const ticketId = req.params.ticketId;
    try {
      const deletedTicket = await TicketModel.findByIdAndDelete(ticketId);
      if (deletedTicket) {
        res.status(200).send("delted");
      } else {
        next(createHttpError(404, `Ticket with id: ${ticketId} not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

//admin and support-team can delete a message
ticketRouter.delete(
  "/message/:messageId",

  JWTAuthMiddleware,
  onlyAdminAndSupportTeamAllowedRoute,
  async (req, res, next) => {
    const messageId = req.params.messageId;
    try {
      const deletedMessage = await TicketModel.updateMany(
        {},
        { $pull: { messageHistory: { _id: messageId } } }
      );
      if (deletedMessage) {
        res.status(200).send("delted");
      } else {
        next(createHttpError(404, `Message with id: ${messageId} not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

//pdf generation
ticketRouter.post("/create-pdf", (req, res, next) => {
  try {
    pdf
      .create(pdfTemplate(req.body), {})
      .toFile(`${__dirname}/result.pdf`, (err) => {
        if (err) {
          res.send(Promise.reject());
        }
        res.send(Promise.resolve());
      });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//send the generated pdf to client
ticketRouter.get("/get-pdf", (req, res) => {
  console.log(process.cwd(), "process.cwd");
  res.sendFile(`${__dirname}/result.pdf`);
});
export default ticketRouter;
