import express from "express";
import { RoleController } from "../controllers/RoleController";
import { RoleService } from "../services/RoleService";
import { checkJwt } from "../middleware/CheckJWT";
import { checkRole } from "../middleware/CheckRole";
import { UserRoles } from "../constants/user/UserRoles";

const router = express.Router();

const roleService = new RoleService();
const roleController = new RoleController(roleService);

router.post(
  "/new",
  [checkJwt, checkRole([UserRoles.ADMIN])],
  roleController.createRole
);
router.put(
  "/:id",
  [checkJwt, checkRole([UserRoles.ADMIN])],
  roleController.updateRole
);
router.delete(
  "/:id",
  [checkJwt, checkRole([UserRoles.ADMIN])],
  roleController.deleteRole
);
router.get(
  "/",
  [checkJwt, checkRole([UserRoles.ADMIN])],
  roleController.listRoles
);

export default router;
