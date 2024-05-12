import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { checkJwt } from "../middleware/CheckJWT";
import { checkRole } from "../middleware/CheckRole";
import { UserRoles } from "../constants/user/UserRoles";
import { checkPermissions } from "../middleware/CheckPermission";
import { Permissions } from "../constants/permission/Permissions";
import { importantRateLimiter } from "../middleware/RateLimiter";
import { csrfProtection } from "../middleware/CheckCSRF";

const router = Router();

router.post("/login", importantRateLimiter, AuthController.login);

router.post(
  "/refresh-token",
  importantRateLimiter,
  AuthController.refreshToken
);

router.get(
  "/me",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN, UserRoles.USER]),
    checkPermissions([Permissions.GET_LOGGED_IN_USER]),
  ],
  AuthController.getCurrentLoggedInUser
);

router.post(
  "/logout",
  [checkJwt, csrfProtection, importantRateLimiter],
  AuthController.logout
);

router.get("/loggedin", [], AuthController.isUserLoggedIn);

export default router;
