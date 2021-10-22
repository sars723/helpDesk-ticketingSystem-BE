import createHttpError from "http-errors";

export const onlyAdminAllowedRoute = (req, res, next) => {
  if (req.customer.role === "admin") {
    next();
  } else createHttpError(403, "Admin only! ");
};
export const onlyAdminAndSupportTeamAllowedRoute = (req, res, next) => {
  if (req.customer.role === "admin" || req.customer.role === "support-team") {
    next();
  } else createHttpError(403, "Admin only! ");
};
