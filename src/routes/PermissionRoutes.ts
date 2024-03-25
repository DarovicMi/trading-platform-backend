import express from "express";
import { PermissionService } from "../services/PermissionService";
import { PermissionController } from "../controllers/PermissionController";
import { checkJwt } from "../middleware/CheckJWT";
import { checkRole } from "../middleware/CheckRole";
import { UserRoles } from "../constants/user/UserRoles";
import { Request, Response } from "express";
import { checkPermissions } from "../middleware/CheckPermission";
import { Permissions } from "../constants/permission/Permissions";
import { csrfProtection } from "../middleware/CheckCSRF";
import { lessImportantRateLimiter } from "../middleware/RateLimiter";

const router = express.Router();
const permissionService = new PermissionService();
const permissionController = new PermissionController(permissionService);

router.post(
  "/",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    csrfProtection,
    checkPermissions([Permissions.CREATE_PERMISSION]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) =>
    permissionController.createPermission(req, res)
);
router.get(
  "/",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    checkPermissions([Permissions.GET_PERMISSIONS]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) =>
    permissionController.getAllPermissions(req, res)
);
router.get(
  "/:id",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    checkPermissions([Permissions.GET_PERMISSION]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) =>
    permissionController.getPermissionById(req, res)
);
router.put(
  "/:id",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    csrfProtection,
    checkPermissions([Permissions.UPDATE_PERMISSION]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) =>
    permissionController.updatePermission(req, res)
);
router.delete(
  "/:id",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    csrfProtection,
    checkPermissions([Permissions.DELETE_PERMISSION]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) =>
    permissionController.deletePermission(req, res)
);

export default router;
