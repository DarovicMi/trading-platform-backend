import { Request, Response, NextFunction } from "express";
import * as jwt from "jsonwebtoken";
import { ErrorMessage } from "../constants/authentication/AuthenticationErrorMessage";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_ACCESS_TOKEN_STRING = process.env.JWT_ACCESS_TOKEN_STRING as string;

export const checkJwt = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies[JWT_ACCESS_TOKEN_STRING];
  if (!token) {
    return res
      .status(401)
      .send({ message: ErrorMessage.ACCESS_TOKEN_REQUIRED });
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      return res
        .status(401)
        .send({ message: ErrorMessage.ACCESS_TOKEN_INVALID });
    }
    (req as any).user = decoded;
    next();
  });
};
