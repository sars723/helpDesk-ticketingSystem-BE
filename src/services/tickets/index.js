import express from "express";
import createHttpError from "http-errors";
import { onlyAdminAndSupportTeamAllowedRoute } from "../../auth/adminOrSupportTeam_validation_middleware.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import TicketModel from "./schema.js";

const ticketRouter = express.Router();

//admin and support-team can get all ticket
ticketRouter.get("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const tickets = await TicketModel.find().populate("sender");
    res.send(tickets);
  } catch (error) {
    next(error);
  }
});

ticketRouter.post("/", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const { email } = req.body;
    const ticket = new TicketModel(req.body);
    await ticket.save();
    res.status(201).send(ticket);
  } catch (error) {
    next(error);
  }
});
//admin and support-team can get single ticket
ticketRouter.get("/:ticketId", JWTAuthMiddleware, async (req, res, next) => {
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
});

// admin and support-team can edit a specific ticket
ticketRouter.put(
  "/:ticketId",
  onlyAdminAndSupportTeamAllowedRoute,
  JWTAuthMiddleware,
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
  onlyAdminAndSupportTeamAllowedRoute,
  JWTAuthMiddleware,
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
