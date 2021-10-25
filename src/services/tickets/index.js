import express from "express";
import createHttpError from "http-errors";
import {
  onlyAdminAllowedRoute,
  onlyAdminAndSupportTeamAllowedRoute,
} from "../../auth/adminOrSupportTeam_validation_middleware.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import TicketModel from "./schema.js";
import CustomerModel from "../users/schema.js";
import MessageModel from "../messages/schema.js";
import customerRouter from "../users/index.js";

const ticketRouter = express.Router();

//admin can get all ticket
ticketRouter.get(
  "/",
  JWTAuthMiddleware,
  onlyAdminAllowedRoute,
  async (req, res, next) => {
    try {
      const tickets = await TicketModel.find().populate("messageHistory");
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
    console.log(sender);
    const user = await CustomerModel.findOne({ email: sender });
    console.log(user);
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
      next(error);
    }
  }
);

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
ticketRouter.put(
  "/replay/:ticketId",

  JWTAuthMiddleware,
  /* onlyAdminAndSupportTeamAllowedRoute, */
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
      next(error);
    }
  }
);
// admin and support-team can edit a specific ticket
/* ticketRouter.put(
  "/:ticketId",

  JWTAuthMiddleware,
  onlyAdminAndSupportTeamAllowedRoute,
  async (req, res, next) => {
    const ticketId = req.params.ticketId;
    const { messageHistory } = req.body;

    try {
      if (messageHistory) {
        const sender = await CustomerModel.findOne({
          email: messageHistory.sender,
        });
        console.log("sender", sender.email);
        if (sender) {
          const recipient = await CustomerModel.findOne({
            email: messageHistory.recipient,
          });
          console.log("recipient", recipient.email);
          if (recipient) {
            const updatedTicket = await TicketModel.findOneAndUpdate(ticketId, {
              $set: req.body,
              messageHistory: {
                ...messageHistory,
                sender: sender._id.toString(),
                recipient: recipient._id.toString(),
              },
            });
            console.log("updatedTicket", updatedTicket);
            if (updatedTicket) {
              res.status(200).send(updatedTicket);
            } else {
              next(
                createHttpError(404, `Ticket with id: ${ticketId} not found`)
              );
            }
          }
        } else {
          next(createHttpError(404, "sender email not found"));
        }
      } else {
        const updatedTicket = await TicketModel.findByIdAndUpdate(
          ticketId,
          { $set: req.body },
          { new: true }
        );
        if (updatedTicket) {
          res.status(200).send(updatedTicket);
        } else {
          next(createHttpError(404, `Ticket with id: ${ticketId} not found`));
        }
      }
    } catch (error) {
      next(error);
    }
  }
); */
//admin and support-team can close a ticket

ticketRouter.put(
  "/close-ticket/:ticketId",

  JWTAuthMiddleware,
  onlyAdminAndSupportTeamAllowedRoute,
  async (req, res, next) => {
    const ticketId = req.params.ticketId;
    const { status } = req.body;
    try {
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

export default ticketRouter;
