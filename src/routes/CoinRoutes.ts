import { Request, Response, Router } from "express";
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
import { CoinService } from "../services/CoinService";
import { CoinController } from "../controllers/CoinController";

const router = Router();

const coinService = new CoinService();
const coinController = new CoinController(coinService);

router.post(
  "/add-coins",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN, UserRoles.USER]),
    csrfProtection,
    checkPermissions([Permissions.ADD_COINS]),
  ],
  (req: Request, res: Response) =>
    coinController.fetchAndStoreCoinData(req, res)
);

router.get(
  "/coins",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN, UserRoles.USER]),
    checkPermissions([Permissions.GET_ALL_COINS]),
  ],
  (req: Request, res: Response) => coinController.getAllCoins(req, res)
);

router.post(
  "/coins/add-market-data",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN, UserRoles.USER]),
    csrfProtection,
    checkPermissions([Permissions.ADD_MARKET_DATA]),
  ],
  (req: Request, res: Response) =>
    coinController.fetchAndStoreMarketData(req, res)
);

router.get(
  "/coins/market-data",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN]),
    checkPermissions([Permissions.GET_MARKET_DATA]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) => coinController.getMarketData(req, res)
);

router.get(
  "/coins/market-data/:id",
  [
    checkJwt,
    checkRole([UserRoles.ADMIN, UserRoles.USER]),
    checkPermissions([Permissions.GET_MARKET_DATA_BY_COIN]),
    lessImportantRateLimiter,
  ],
  (req: Request, res: Response) =>
    coinController.getMarketDataByCoinId(req, res)
);

router.get(
  "/coins/:coinId",
  [checkJwt, checkRole([UserRoles.ADMIN, UserRoles.USER])],
  (req: Request, res: Response) => coinController.getCoinById(req, res)
);

export default router;
