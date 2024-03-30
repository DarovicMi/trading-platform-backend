import { Request, Response, Router } from "express";
import { PasswordController } from "../controllers/PasswordController";
import { PasswordService } from "../services/PasswordService";
import { checkJwt } from "../middleware/CheckJWT";
import { checkRole } from "../middleware/CheckRole";
import { UserRoles } from "../constants/user/UserRoles";
import { checkPermissions } from "../middleware/CheckPermission";
import { Permissions } from "../constants/permission/Permissions";
import { csrfProtection } from "../middleware/CheckCSRF";
import { lessImportantRateLimiter } from "../middleware/RateLimiter";

const router = Router();
const passwordService = new PasswordService();
const passwordController = new PasswordController(passwordService);

router.post(
  "/password-reset-initiate",
  [lessImportantRateLimiter],
  (req: Request, res: Response) => passwordController.initiateReset(req, res)
);

router.post(
  "/password-reset",
  [lessImportantRateLimiter],
  (req: Request, res: Response) => passwordController.resetPassword(req, res)
);

router.post(
  "/change-password",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN, UserRoles.USER]),
    csrfProtection,
    checkPermissions([Permissions.CHANGE_PASSWORD]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) => passwordController.changePassword(req, res)
);

export default router;
