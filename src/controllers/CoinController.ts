import { Request, Response } from "express";
import { CoinService } from "../services/CoinService";
import { ServerErrorMessage } from "../constants/server/ServerErrorMessage";
import { CoinFetchError } from "../errors/coin/CoinFetchError";
import { CoinInformationalMessage } from "../constants/coin/CoinInformationalMessage";
import { CoinErrorMessage } from "../constants/coin/CoinErrorMessage";
import { CoinNotFoundError } from "../errors/coin/CoinNotFoundError";
import { MarketDataFetchError } from "../errors/coin/MarketDataFetchError";
import { InvalidFormatError } from "../errors/coin/InvalidFormatError";

export class CoinController {
  private coinService: CoinService;

  constructor(coinService: CoinService) {
    this.coinService = coinService;
  }

  async getAllCoins(req: Request, res: Response) {
    try {
      const coins = await this.coinService.getAllCoins();
      return res.json(coins);
    } catch (error) {
      return res.status(500).send({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async fetchAndStoreCoinData(req: Request, res: Response) {
    try {
      await this.coinService.fetchAndStoreCoinData();

      return res.status(201).send({
        message: CoinInformationalMessage.FETCHED_SUCCESSFULLY,
      });
    } catch (error) {
      if (error instanceof CoinFetchError) {
        return res.status(400).send({ message: error.message });
      } else {
        return res
          .status(500)
          .send({ message: ServerErrorMessage.SERVER_ERROR });
      }
    }
  }

  async getMarketData(req: Request, res: Response) {
    try {
      const marketData = await this.coinService.getMarketData();
      return res.json(marketData);
    } catch (error) {
      return res.status(500).send({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async getMarketDataByCoinId(req: Request, res: Response) {
    try {
      const coinId = parseInt(req.params.id, 10);
      if (isNaN(coinId)) {
        return res
          .status(400)
          .send({ message: CoinErrorMessage.INVALID_FORMAT });
      }

      const marketData = await this.coinService.getMarketDataByCoinId(coinId);
      if (marketData.length === 0) {
        return res
          .status(404)
          .json({ message: CoinInformationalMessage.EMPTY_MARKET_DATA });
      }
      return res.status(200).json(marketData);
    } catch (error) {
      if (error instanceof CoinNotFoundError) {
        return res.status(404).send({ message: error.message });
      }
      return res.status(500).send({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }

  async fetchAndStoreMarketData(req: Request, res: Response) {
    try {
      const coinId = req.query.coinId as string;
      const days = req.query.days as string;
      if (!coinId && !days) {
        return res
          .status(404)
          .json({ message: CoinErrorMessage.COIN_NOT_FOUND });
      }
      await this.coinService.fetchAndStoreMarketData(coinId, days);
      return res
        .status(201)
        .json({ message: CoinInformationalMessage.FETCHED_SUCCESSFULLY });
    } catch (error) {
      if (error instanceof CoinNotFoundError) {
        return res.status(404).send({ message: error.message });
      } else if (error instanceof MarketDataFetchError) {
        return res.status(400).send({ message: error.message });
      } else if (error instanceof InvalidFormatError) {
        return res.status(400).send({ message: error.message });
      }
      return res.status(500).send({ message: ServerErrorMessage.SERVER_ERROR });
    }
  }
}
