import express from "express";
import CustomerModel from "./schema.js";
import createHttpError, { HttpError } from "http-errors";
import { generateAccessToken } from "../../auth/tools.js";
import { JWTAuthMiddleware } from "../../auth/token.js";
import TicketModel from "../tickets/schema.js";
import {
  onlyAdminAllowedRoute,
  onlyAdminAndSupportTeamAllowedRoute,
} from "../../auth/adminOrSupportTeam_validation_middleware.js";

const customerRouter = express.Router();

// user can get all his tikets
customerRouter.get("/me/tickets", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const tickets = await TicketModel.find({ sender: req.customer._id });
    res.send(tickets);
  } catch (error) {
    next(error);
  }
});

//admin and support-team can get all customers
customerRouter.get(
  "/",
  onlyAdminAndSupportTeamAllowedRoute,
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const customers = await CustomerModel.find();
      res.send(customers);
    } catch (error) {
      next(error);
    }
  }
);
// can any register
customerRouter.post("/register", async (req, res, next) => {
  try {
    const customers = new CustomerModel(req.body);
    const { _id } = await customers.save();
    res.status(201).send(_id);
  } catch (error) {
    next(error);
  }
});

//user can see his own profile
customerRouter.get("/me", JWTAuthMiddleware, async (req, res, next) => {
  const customerId = req.params.customerId;
  try {
    const customer = await CustomerModel.findById(customerId);
    if (customer) {
      res.status(200).send(customer);
    } else {
      next(createHttpError(404, `customer with id:${customerId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

//admin and support-team can get single customer
customerRouter.get(
  "/:customerId",
  onlyAdminAndSupportTeamAllowedRoute,
  JWTAuthMiddleware,
  async (req, res, next) => {
    const customerId = req.params.customerId;
    try {
      const customer = await CustomerModel.findById(customerId);
      if (customer) {
        res.status(200).send(customer);
      } else {
        next(createHttpError(404, `customer with id:${customerId} not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

//customer updates his own profile
customerRouter.put("/me", JWTAuthMiddleware, async (req, res, next) => {
  try {
    const customerId = req.customer._id;
    const updatedCustomer = await CustomerModel.findByIdAndUpdate(
      customerId,
      { $set: req.body },
      { new: true }
    );
    if (updatedCustomer) {
      res.send(updatedCustomer);
    } else {
      next(createHttpError(404, `customer with id${customerId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

//admin and support-team updates customer profile
customerRouter.put(
  "/:customerId",
  onlyAdminAndSupportTeamAllowedRoute,
  JWTAuthMiddleware,
  async (req, res, next) => {
    try {
      const customerId = req.params.customerId;
      const updatedCustomer = await CustomerModel.findByIdAndUpdate(
        customerId,
        { $set: req.body },
        { new: true }
      );
      if (updatedCustomer) {
        res.send(updatedCustomer);
      } else {
        next(createHttpError(404, `customer with id${customerId} not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

//admin and support-team delete a cusomer
customerRouter.delete(
  "/:customerId",
  onlyAdminAndSupportTeamAllowedRoute,
  JWTAuthMiddleware,
  async (req, res, next) => {
    const customerId = req.params.customerId;
    try {
      const customer = await CustomerModel.findByIdAndDelete(customerId);
      if (customer) {
        res.send("deleted");
      } else {
        next(createHttpError(404, `customer with id${customerId}not found`));
      }
    } catch (error) {
      next(error);
    }
  }
);

customerRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const customer = await CustomerModel.checkCredentials(email, password);

    if (customer) {
      const accessToken = await generateAccessToken(customer);

      res.send({ accessToken });
    } else {
      next(createHttpError(404, "Credentials are not ok!"));
    }
  } catch (error) {
    next(error);
  }
});
export default customerRouter;
