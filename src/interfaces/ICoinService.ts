import { Coin } from "../entities/Coin";

export interface ICoinService {
  addOrUpdateCoins(coinsData: Partial<Coin>[]): Promise<Coin[]>;
  getAllCoins(): Promise<Coin[]>;
  fetchAndStoreCoinData(): Promise<void>;
  fetchAndStoreMarketData(coinId: string, days: string): Promise<void>;
}
