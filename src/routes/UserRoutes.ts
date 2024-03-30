import { Request, Response, Router } from "express";
import { UserController } from "../controllers/UserController";
import { UserService } from "../services/UserService";
import { checkJwt } from "../middleware/CheckJWT";
import { checkRole } from "../middleware/CheckRole";
import { UserRoles } from "../constants/user/UserRoles";
import { checkPermissions } from "../middleware/CheckPermission";
import { Permissions } from "../constants/permission/Permissions";
import { csrfProtection } from "../middleware/CheckCSRF";
import {
  importantRateLimiter,
  lessImportantRateLimiter,
} from "../middleware/RateLimiter";

const router = Router();

const userService = new UserService();
const userController = new UserController(userService);

router.post("/signUp", importantRateLimiter, (req: Request, res: Response) =>
  userController.createUser(req, res)
);

router.get(
  "/:id",
  [checkJwt, checkRole([UserRoles.ADMIN]), lessImportantRateLimiter],
  (req: Request, res: Response) => userController.getUserById(req, res)
);

router.get(
  "/",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    checkPermissions([Permissions.GET_ALL_USERS]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) => userController.getAllUsers(req, res)
);

router.put(
  "/:id/update",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN, UserRoles.USER]),
    csrfProtection,
    checkPermissions([Permissions.UPDATE_CURRENT_USER]),
    importantRateLimiter,
  ],
  (req: Request, res: Response) => userController.updateUser(req, res)
);

router.delete(
  "/:id/delete",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN, UserRoles.USER]),
    csrfProtection,
    checkPermissions([Permissions.DELETE_CURRENT_USER]),
    importantRateLimiter,
  ],
  (req: Request, res: Response) => userController.deleteUser(req, res)
);

export default router;
