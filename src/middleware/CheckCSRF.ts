import csurf from "csurf";
import { Request, Response, NextFunction } from "express";
import { AuthenticationErrorMessage } from "../constants/authentication/AuthenticationErrorMessage";

export const csrfProtection = csurf({
  cookie: true,
});

export function csrfErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (err.code !== "EBADCSRFTOKEN") return next(err);
  res
    .status(403)
    .send({ message: AuthenticationErrorMessage.CSRF_TOKEN_NOT_FOUND });
}
