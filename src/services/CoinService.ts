import { AppDataSource } from "../config/DatabaseConfig";
import { Coin } from "../entities/Coin";
import { CoinFetchError } from "../errors/coin/CoinFetchError";
import { CoinErrorMessage } from "../constants/coin/CoinErrorMessage";
import { ICoinService } from "../interfaces/ICoinService";
import { MarketData } from "../entities/MarketData";
import { CoinNotFoundError } from "../errors/coin/CoinNotFoundError";
import { MarketDataFetchError } from "../errors/coin/MarketDataFetchError";
import { InvalidFormatError } from "../errors/coin/InvalidFormatError";
import { LessThan } from "typeorm";

export class CoinService implements ICoinService {
  private coinRepository = AppDataSource.getRepository(Coin);
  private marketDataRepository = AppDataSource.getRepository(MarketData);

  async addCoins(coinsData: Partial<Coin>[]): Promise<Coin[]> {
    return this.coinRepository.save(coinsData);
  }

  async getAllCoins(): Promise<Coin[]> {
    return this.coinRepository.find();
  }

  async fetchAndStoreCoinData(): Promise<void> {
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
    await this.addCoins(formattedCoins);
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

      const data: Coin[] = (await response.json()) as any[];
      return data;
    } catch (error) {
      return [];
    }
  }

  async fetchAndStoreMarketData(coinId: string, days: string): Promise<void> {
    const daysRegex = /^(?:[0-7]|7)$/;
    if (!daysRegex.test(days)) {
      throw new InvalidFormatError(CoinErrorMessage.INVALID_FORMAT);
    }

    const marketDataResponse = await this.fetchMarketChartData(coinId, days);
    const coin = await this.coinRepository.findOne({
      where: { coinId: coinId },
    });

    if (!coin) {
      throw new CoinNotFoundError(CoinErrorMessage.COIN_NOT_FOUND);
    }

    const latestTimestamp = Math.max(
      ...marketDataResponse.prices.map((entry: any) => entry[0])
    );

    await this.marketDataRepository.delete({
      coin: coin,
      timestamp: LessThan(latestTimestamp),
    });

    const prices = marketDataResponse.prices;

    const marketDataEntities = prices.map((priceEntry: any) => {
      return {
        coin: coin,
        price: priceEntry[1],
        timestamp: priceEntry[0],
      };
    });

    await this.marketDataRepository.save(marketDataEntities);
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
}
