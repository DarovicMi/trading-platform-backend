import { AppDataSource } from "./../config/DatabaseConfig";
import { User } from "../entities/User";
import { Coin } from "../entities/Coin";
import { Transaction } from "../entities/Transaction";

export class TransactionService {
  static async buyCrypto(userId: number, coinId: number, amount: number) {
    const userRepository = AppDataSource.getRepository(User);
    const coinRepository = AppDataSource.getRepository(Coin);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const coin = await coinRepository.findOne({ where: { id: coinId } });
    if (!coin) {
      throw new Error("Cryptocurrency not found");
    }

    const cost = parseFloat((coin.currentPrice * amount).toFixed(2));

    if (user.balance < cost) {
      throw new Error("Insufficient balance");
    }

    user.balance = parseFloat(
      (parseFloat(user.balance.toString()) - cost).toFixed(2)
    );
    const transaction = new Transaction();
    transaction.user = user;
    transaction.coin = coin;
    transaction.type = "BUY";
    transaction.amount = amount;
    transaction.price = coin.currentPrice;

    await userRepository.save(user);
    await transactionRepository.save(transaction);

    return transaction;
  }

  static async sellCrypto(userId: number, coinId: number, amount: number) {
    const userRepository = AppDataSource.getRepository(User);
    const coinRepository = AppDataSource.getRepository(Coin);
    const transactionRepository = AppDataSource.getRepository(Transaction);

    const user = await userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error("User not found");
    }

    const coin = await coinRepository.findOne({ where: { id: coinId } });
    if (!coin) {
      throw new Error("Cryptocurrency not found");
    }

    const wallet = await transactionRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "sum")
      .where("transaction.userId = :userId", { userId })
      .andWhere("transaction.coinId = :coinId", { coinId })
      .andWhere("transaction.type = 'BUY'")
      .getRawOne();

    const totalOwned = wallet.sum || 0;

    const totalSold = await transactionRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "sum")
      .where("transaction.userId = :userId", { userId })
      .andWhere("transaction.coinId = :coinId", { coinId })
      .andWhere("transaction.type = 'SELL'")
      .getRawOne();

    const totalSoldAmount = totalSold.sum || 0;

    const netOwned = totalOwned - totalSoldAmount;

    if (netOwned < amount) {
      throw new Error("Insufficient cryptocurrency balance");
    }

    const revenue = parseFloat((coin.currentPrice * amount).toFixed(2));

    user.balance = parseFloat(
      (parseFloat(user.balance.toString()) + revenue).toFixed(2)
    );
    const transaction = new Transaction();
    transaction.user = user;
    transaction.coin = coin;
    transaction.type = "SELL";
    transaction.amount = amount;
    transaction.price = coin.currentPrice;

    await userRepository.save(user);
    await transactionRepository.save(transaction);

    return transaction;
  }

  static async getPortfolio(userId: number) {
    const transactionRepository = AppDataSource.getRepository(Transaction);

    const transactions = await transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.coin", "coin")
      .where("transaction.userId = :userId", { userId })
      .getMany();

    const portfolio = transactions.reduce((acc: any, transaction: any) => {
      const { coin, type, amount } = transaction;
      const coinId = coin.id;
      if (!acc[coinId]) {
        acc[coinId] = {
          coin: coin,
          totalBought: 0,
          totalSold: 0,
        };
      }
      const amountNumber = parseFloat(amount as unknown as string);
      if (type === "BUY") {
        acc[coinId].totalBought += amountNumber;
      } else if (type === "SELL") {
        acc[coinId].totalSold += amountNumber;
      }
      return acc;
    }, {});

    const result = Object.values(portfolio).map((entry: any) => ({
      coin: entry.coin,
      balance: entry.totalBought - entry.totalSold,
    }));

    return result.filter((entry: any) => entry.balance > 0);
  }

  static async getUserCoinBalance(
    userId: number,
    coinId: number
  ): Promise<number> {
    const transactionRepository = AppDataSource.getRepository(Transaction);

    const totalBought = await transactionRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "sum")
      .where("transaction.userId = :userId", { userId })
      .andWhere("transaction.coinId = :coinId", { coinId })
      .andWhere("transaction.type = 'BUY'")
      .getRawOne();

    const totalSold = await transactionRepository
      .createQueryBuilder("transaction")
      .select("SUM(transaction.amount)", "sum")
      .where("transaction.userId = :userId", { userId })
      .andWhere("transaction.coinId = :coinId", { coinId })
      .andWhere("transaction.type = 'SELL'")
      .getRawOne();

    const totalOwned = (totalBought.sum || 0) - (totalSold.sum || 0);

    return totalOwned;
  }

  static async getTransactionReport(userId: number) {
    const transactionRepository = AppDataSource.getRepository(Transaction);

    const transactions = await transactionRepository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.coin", "coin")
      .where("transaction.userId = :userId", { userId })
      .orderBy("transaction.timestamp", "DESC")
      .getMany();

    return transactions;
  }
}
