import express from "express";
import UserModel from "./schema.js";
import createHttpError, { HttpError } from "http-errors";
import { generateAccessToken } from "../../auth/tools.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import TicketModel from "../tickets/schema.js";
import {
  onlyAdminAllowedRoute,
  onlyAdminAndSupportTeamAllowedRoute,
} from "../../auth/adminOrSupportTeam_validation_middleware.js";

const userRouter = express.Router();

// user can get all his tikets
userRouter.get("/me/tickets", JWTAuthMiddleware, async (req, res, next) => {
  try {
    console.log(req.user);
    const tickets = await TicketModel.find({ sender: req.user._id });
    console.log(req.user._id);
    res.send(tickets);
  } catch (error) {
    next(error);
  }
});
userRouter.get(
  "/me/tickets/assigned",
  JWTAuthMiddleware,
  async (req, res, next) => {
    console.log(req.user._id.toString());
    const userId = req.user._id;
    try {
      const createdOrAssignedTickets = await TicketModel.find({
        assignedTo: userId,
      });
      console.log(createdOrAssignedTickets);
      if (createdOrAssignedTickets) {
        res.status(200).send(createdOrAssignedTickets);
      } else {
        res.send("no ticket");
      }
    } catch (error) {
      next(error);
    }
  }
);

// user can update his own  tikets
userRouter.put(
  "/me/tickets/:ticketId",
  JWTAuthMiddleware,
  async (req, res, next) => {
    const ticketId = req.params.ticketId;
    try {
      const tickets = await TicketModel.findByIdAndUpdate(
        { sender: req.user._id, _id: ticketId },
        { $set: req.body },
        { new: true }
      );
      res.send(tickets);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//admin and support-team can get all users
userRouter.get(
  "/",

  JWTAuthMiddleware,
  onlyAdminAndSupportTeamAllowedRoute,
  async (req, res, next) => {
    try {
      const users = await UserModel.find();
      res.send(users);
    } catch (error) {
      next(error);
    }
  }
);
// can any register
userRouter.post("/register", async (req, res, next) => {
  try {
    const users = new UserModel(req.body);
    const { _id } = await users.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

//user can see his own profile
userRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  const userId = req.params.userId;
  try {
    const user = await UserModel.findById(userId);
    if (user) {
      res.status(200).send(user);
    } else {
      next(createHttpError(404, `user with id:${userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

//admin and support-team can get single user
userRouter.get(
  "/:userId",

  JWTAuthMiddleware,
  onlyAdminAndSupportTeamAllowedRoute,
  async (req, res, next) => {
    const userId = req.params.userId;
    try {
      const user = await UserModel.findById(userId);
      if (user) {
        res.status(200).send(user);
      } else {
        next(createHttpError(404, `user with id:${userId} not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

//user updates his own profile
userRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const updateduser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: req.body },
      { new: true }
    );
    if (updateduser) {
      res.send(updateduser);
    } else {
      next(createHttpError(404, `user with id${userId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

//admin and support-team updates user profile
userRouter.put(
  "/:userId",

  JWTAuthMiddleware,
  onlyAdminAndSupportTeamAllowedRoute,
  async (req, res, next) => {
    try {
      const userId = req.params.userId;
      const updateduser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: req.body },
        { new: true }
      );
      if (updateduser) {
        res.send(updateduser);
      } else {
        next(createHttpError(404, `user with id${userId} not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

//admin and support-team delete a cusomer
userRouter.delete(
  "/:userId",

  JWTAuthMiddleware,
  onlyAdminAndSupportTeamAllowedRoute,
  async (req, res, next) => {
    const userId = req.params.userId;
    try {
      const user = await UserModel.findByIdAndDelete(userId);
      if (user) {
        res.send("deleted");
      } else {
        next(createHttpError(404, `user with id${userId}not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

userRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await UserModel.checkCredentials(email, password);
    console.log("userr", user);
    if (user) {
      const accessToken = await generateAccessToken(user);

      res.send({ accessToken });
    } else {
      next(createHttpError(404, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});
export default userRouter;
