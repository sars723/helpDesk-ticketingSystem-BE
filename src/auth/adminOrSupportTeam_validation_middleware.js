import createHttpError from "http-errors";

export const onlyAdminAllowedRoute = (req, res, next) => {
  /* console.log("role", req.user.role); */
  if (req.user.role === "admin") {
    next();
  } else next(createHttpError(403, "Admin only! "));
};
export const onlyAdminAndSupportTeamAllowedRoute = (req, res, next) => {
  /*  console.log("role", req.user); */
  if (req.user.role === "admin" || req.user.role === "support-team") {
    next();
  } else next(createHttpError(403, "Admin and support-team only! "));
};
