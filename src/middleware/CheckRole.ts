import { Request, Response, NextFunction } from "express";
import { UserRoles } from "../constants/user/UserRoles";
import { RoleAuthorizationErrorMessage } from "../constants/role/RoleAuthorizationErrorMessage ";

export const checkRole = (roles: UserRoles[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    console.log(req.user);

    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).send(RoleAuthorizationErrorMessage.ACCESS_DENIED);
    }

    next();
  };
};
