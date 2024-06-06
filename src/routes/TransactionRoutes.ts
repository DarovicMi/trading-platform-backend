import { TransactionController } from "./../controllers/TransactionController";
import { Router } from "express";

const router = Router();

router.post("/buy", TransactionController.buyCrypto);
router.post("/sell", TransactionController.sellCrypto);
router.get("/portfolio/:userId", TransactionController.getPortfolio);
router.get("/transactions/:userId", TransactionController.getTransactionReport);
router.post("/user/coin/balance", TransactionController.getUserCoinBalance);

export default router;
