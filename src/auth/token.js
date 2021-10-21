import createHttpError from "http-errors";
import { verifyAccessJWT } from "./tools.js";
import CustomerModel from "../services/customers/schema.js";

export const JWTAuthMiddleware = async (req, res, next) => {
  if (!req.headers.authorization) {
    next(
      createHttpError(401, "Please provide credentials in Authorization header")
    );
  } else {
    try {
      const token = req.headers.authorization.replace("Bearer ", "");
      console.log(req.headers.authorization);
      console.log(token);

      const decodedToken = await verifyAccessJWT(token);
      console.log("decodedtoken", decodedToken);

      const customer = await CustomerModel.findById(decodedToken._id);

      if (customer) {
        req.customer = customer;
        next();
      } else {
        next(createHttpError(404, "Customer not found"));
      }
    } catch (error) {
      console.log(error);
      next(createHttpError(401, "Token not valid"));
    }
  }
};
