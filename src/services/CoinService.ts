import { AppDataSource } from "../config/DatabaseConfig";
import { Coin } from "../entities/Coin";
import { CoinFetchError } from "../errors/coin/CoinFetchError";
import { CoinErrorMessage } from "../constants/coin/CoinErrorMessage";
import { ICoinService } from "../interfaces/ICoinService";
import { MarketData } from "../entities/MarketData";
import { CoinNotFoundError } from "../errors/coin/CoinNotFoundError";
import { MarketDataFetchError } from "../errors/coin/MarketDataFetchError";
import { InvalidFormatError } from "../errors/coin/InvalidFormatError";
import { DeepPartial } from "typeorm";
import { MoreThan } from "typeorm";
export class CoinService implements ICoinService {
  private coinRepository = AppDataSource.getRepository(Coin);
  private marketDataRepository = AppDataSource.getRepository(MarketData);

  async addOrUpdateCoins(coinsData: Partial<Coin>[]): Promise<Coin[]> {
    const savedCoins: Coin[] = [];

    await this.coinRepository.manager.transaction(
      async (transactionalEntityManager) => {
        for (const coinData of coinsData) {
          const existingCoin = await transactionalEntityManager.findOne(Coin, {
            where: { coinId: coinData.coinId },
          });

          let coin: Coin;
          if (existingCoin) {
            coin = transactionalEntityManager.merge(
              Coin,
              existingCoin,
              coinData as DeepPartial<Coin>
            );
          } else {
            coin = transactionalEntityManager.create(Coin, coinData);
          }
          const savedCoin = await transactionalEntityManager.save(coin);
          savedCoins.push(savedCoin);
        }
      }
    );
    return savedCoins;
  }

  async getAllCoins(): Promise<Coin[]> {
    return this.coinRepository.find();
  }

  async processAndStoreCoinData(): Promise<void> {
    const fetchedCoins = await this.fetchCoinDataFromAPI();
    const formattedCoins = fetchedCoins.map((coin) => ({
      coinId: coin.id,
      symbol: coin.symbol,
      name: coin.name,
      image: coin.image,
      currentPrice: coin.current_price,
      marketCap: coin.market_cap,
      marketCapRank: coin.market_cap_rank,
      fullyDilutedValuation: coin.fully_diluted_valuation,
      totalVolume: coin.total_volume,
      high24h: coin.high_24h,
      low24h: coin.low_24h,
      priceChange24h: coin.price_change_24h,
      priceChangePercentage24h: coin.price_change_percentage_24h,
      circulatingSupply: coin.circulating_supply,
      totalSupply: coin.total_supply,
      maxSupply: coin.max_supply,
      ath: coin.ath,
      athDate: new Date(coin.ath_date),
      atl: coin.atl,
      atlDate: new Date(coin.atl_date),
      lastUpdated: new Date(coin.last_updated),
    }));
    await this.addOrUpdateCoins(formattedCoins);
  }

  private async fetchCoinDataFromAPI(): Promise<any[]> {
    const API_KEY = process.env.COINGECKO_API_KEY as string;
    const API = process.env.COINGECKO_API as string;
    const VS_CURRENCY = process.env.VS_CURRENCY as string;
    const url = new URL(`${API}/coins/markets`);
    url.searchParams.append("vs_currency", VS_CURRENCY);
    try {
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Accept: "application/json",
          x_cg_demo_api_k: API_KEY,
        },
      });

      if (!response.ok) {
        throw new CoinFetchError(
          `${CoinErrorMessage.FAILED_TO_FETCH}: ${response.statusText}`
        );
      }

      const data: Coin[] = (await response.json()) as Coin[];
      return data;
    } catch (error) {
      return [];
    }
  }

  async fetchAndStoreMarketData(coinId: string, days: string): Promise<void> {
    if (!/^(?:[1-7]|7)$/.test(days)) {
      throw new InvalidFormatError(CoinErrorMessage.INVALID_FORMAT);
    }

    const marketDataResponse = await this.fetchMarketChartData(coinId, days);
    const coin = await this.coinRepository.findOneBy({ coinId });
    if (!coin) {
      throw new CoinNotFoundError(CoinErrorMessage.COIN_NOT_FOUND);
    }

    const existingTimestamps = new Set(
      (
        await this.marketDataRepository.find({
          where: {
            coin,
            timestamp: MoreThan(
              Date.now() - parseInt(days) * 24 * 60 * 60 * 1000
            ),
          },
          select: ["timestamp"],
        })
      ).map((data) => +data.timestamp)
    );

    await AppDataSource.transaction(async (transactionalEntityManager) => {
      for (const [timestamp, price] of marketDataResponse.prices) {
        const timestampAsNumber = +timestamp;
        if (existingTimestamps.has(timestampAsNumber)) {
          await transactionalEntityManager.update(
            MarketData,
            { coin, timestamp: timestampAsNumber },
            { price }
          );
        } else {
          await transactionalEntityManager.insert(MarketData, {
            coin,
            price,
            timestamp: timestampAsNumber,
          });
        }
      }
    });
  }

  private async fetchMarketChartData(
    coinId: string,
    days: string
  ): Promise<any> {
    const API = process.env.COINGECKO_API as string;
    const API_KEY = process.env.COINGECKO_API_KEY as string;
    const VS_CURRENCY = process.env.VS_CURRENCY as string;

    const url = new URL(`${API}/coins/${coinId}/market_chart`);
    url.searchParams.append("vs_currency", VS_CURRENCY);
    url.searchParams.append("days", days);

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: { x_cg_demo_api_k: API_KEY },
    });

    if (!response.ok)
      throw new MarketDataFetchError(CoinErrorMessage.MARKET_DATA_FETCH_ERROR);

    return response.json();
  }

  async getMarketData(): Promise<MarketData[]> {
    return this.marketDataRepository.find();
  }

  async getMarketDataByCoinId(coinId: number) {
    const coinExists = await this.coinRepository.findOneBy({ id: coinId });

    if (!coinExists) {
      throw new CoinNotFoundError(CoinErrorMessage.COIN_NOT_FOUND);
    }

    const marketData = await this.marketDataRepository.findBy({
      coin: { id: coinId },
    });
    return marketData;
  }

  async getCoinById(coinId: string): Promise<Coin> {
    if (!coinId) {
      throw new CoinNotFoundError(CoinErrorMessage.COIN_NOT_FOUND);
    }

    const coin = await this.coinRepository.findOneBy({ coinId });
    if (!coin) {
      throw new CoinNotFoundError(CoinErrorMessage.COIN_NOT_FOUND);
    }
    return coin;
  }
}
