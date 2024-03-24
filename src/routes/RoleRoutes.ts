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

const router = express.Router();

const roleService = new RoleService();
const roleController = new RoleController(roleService);

router.post(
  "/new",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    checkPermissions([Permissions.CREATE_ROLE]),
    csrfProtection,
  ],
  (req: Request, res: Response) => roleController.createRole(req, res)
);
router.put(
  "/:id",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    checkPermissions([Permissions.UPDATE_ROLE]),
    csrfProtection,
  ],
  (req: Request, res: Response) => roleController.updateRole(req, res)
);
router.delete(
  "/:id",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    checkPermissions([Permissions.DELETE_ROLE]),
    csrfProtection,
  ],
  (req: Request, res: Response) => roleController.deleteRole(req, res)
);
router.get(
  "/",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    checkPermissions([Permissions.GET_ROLES]),
  ],
  (req: Request, res: Response) => roleController.listRoles(req, res)
);

export default router;
