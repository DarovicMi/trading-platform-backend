import { Request, Response } from "express";
import { TransactionService } from "../services/TransactionService";

export class TransactionController {
  static async buyCrypto(req: Request, res: Response) {
    const { userId, amount, coinId } = req.body.transaction;

    try {
      const transaction = await TransactionService.buyCrypto(
        userId,
        coinId,
        amount
      );
      res
        .status(200)
        .json({ message: "Crypto bought successfully", transaction });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async sellCrypto(req: Request, res: Response) {
    const { userId, amount, coinId } = req.body.transaction;

    try {
      const transaction = await TransactionService.sellCrypto(
        userId,
        coinId,
        amount
      );
      res
        .status(200)
        .json({ message: "Crypto sold successfully", transaction });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getUserCoinBalance(req: Request, res: Response) {
    const { userId, coinId } = req.body;

    try {
      const coinBalance = await TransactionService.getUserCoinBalance(
        parseInt(userId),
        parseInt(coinId)
      );
      res.status(200).json({ coinBalance });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getPortfolio(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const portfolio = await TransactionService.getPortfolio(parseInt(userId));
      res.status(200).json(portfolio);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  static async getTransactionReport(req: Request, res: Response) {
    const { userId } = req.params;

    try {
      const transactions = await TransactionService.getTransactionReport(
        parseInt(userId)
      );
      res.status(200).json(transactions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }
}
