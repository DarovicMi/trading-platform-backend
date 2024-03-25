import express from "express";
import { RoleController } from "../controllers/RoleController";
import { RoleService } from "../services/RoleService";
import { checkJwt } from "../middleware/CheckJWT";
import { checkRole } from "../middleware/CheckRole";
import { UserRoles } from "../constants/user/UserRoles";
import { Request, Response } from "express";
import { checkPermissions } from "../middleware/CheckPermission";
import { Permissions } from "../constants/permission/Permissions";
import { csrfProtection } from "../middleware/CheckCSRF";
import { lessImportantRateLimiter } from "../middleware/RateLimiter";

const router = express.Router();

const roleService = new RoleService();
const roleController = new RoleController(roleService);

router.post(
  "/new",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    csrfProtection,
    checkPermissions([Permissions.CREATE_ROLE]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) => roleController.createRole(req, res)
);
router.put(
  "/:id",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    csrfProtection,
    checkPermissions([Permissions.UPDATE_ROLE]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) => roleController.updateRole(req, res)
);
router.delete(
  "/:id",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    csrfProtection,
    checkPermissions([Permissions.DELETE_ROLE]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) => roleController.deleteRole(req, res)
);
router.get(
  "/",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    checkPermissions([Permissions.GET_ROLES]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) => roleController.listRoles(req, res)
);

export default router;
