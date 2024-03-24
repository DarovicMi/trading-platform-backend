import { Request, Response, Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { checkJwt } from "../middleware/CheckJWT";
import { checkRole } from "../middleware/CheckRole";
import { UserRoles } from "../constants/user/UserRoles";
import { checkPermissions } from "../middleware/CheckPermission";
import { Permissions } from "../constants/permission/Permissions";

const router = Router();

const userService = new UserService();
const userController = new UserController(userService);

router.post("/signUp", (req: Request, res: Response) =>
  userController.createUser(req, res)
);
router.get(
  "/:id",
  [checkJwt, checkRole([UserRoles.ADMIN])],
  (req: Request, res: Response) => userController.getUserById(req, res)
);
router.get(
  "/",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    checkPermissions([Permissions.GET_ALL_USERS]),
  ],
  (req: Request, res: Response) => userController.getAllUsers(req, res)
);
router.put(
  "/:id/update",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN, UserRoles.USER]),
    checkPermissions([Permissions.UPDATE_CURRENT_USER]),
  ],
  (req: Request, res: Response) => userController.updateUser(req, res)
);
router.delete(
  "/:id/delete",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN, UserRoles.USER]),
    checkPermissions([Permissions.DELETE_CURRENT_USER]),
  ],
  (req: Request, res: Response) => userController.deleteUser(req, res)
);

export default router;
