import createHttpError from "http-errors";
import { verifyAccessJWT } from "./tools.js";
import UserModel from "../services/users/schema.js";

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

      const user = await UserModel.findById(decodedToken._id);

      if (user) {
        req.user = user;
        next();
      } else {
        next(createHttpError(404, "User not found"));
      }
    } catch (error) {
      console.log(error);
      next(createHttpError(401, "Token not valid"));
    }
  }
};
