import { Request, Response, NextFunction } from "express";
import { PermissionsManager } from "../utils/PermissionsManager";
import { ServerErrorMessage } from "../constants/server/ServerErrorMessage";
import { PermissionErrorMessage } from "../constants/permission/PermissionErrorMessage";

export const checkPermissions = (requiredPermissions: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const userRoleName = req.user?.role;

    try {
      const userPermissions =
        await PermissionsManager.getPermissionsBasedOnRole(userRoleName);

      const hasPermission = requiredPermissions.every((permission) =>
        userPermissions.includes(permission)
      );

      if (!hasPermission) {
        return res
          .status(403)
          .json({ message: PermissionErrorMessage.INSUFFICIENT_PERMISSIONS });
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: ServerErrorMessage.SERVER_ERROR });
    }
  };
};
