import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";
import { MarketData } from "./MarketData";
import { OneToMany } from "typeorm";
@Entity()
export class Coin {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  coinId: string;

  @Column()
  symbol: string;

  @Column()
  name: string;

  @Column()
  image: string;

  @Column("decimal", { precision: 18, scale: 2 })
  currentPrice: number;

  @Column("bigint")
  marketCap: number;

  @Column()
  marketCapRank: number;

  @Column("decimal", { precision: 18, scale: 2, nullable: true })
  fullyDilutedValuation: number | null;

  @Column("bigint")
  totalVolume: number;

  @Column("decimal", { precision: 18, scale: 2 })
  high24h: number;

  @Column("decimal", { precision: 18, scale: 2 })
  low24h: number;

  @Column("decimal", { precision: 18, scale: 2 })
  priceChange24h: number;

  @Column("decimal", { precision: 10, scale: 2 })
  priceChangePercentage24h: number;

  @Column("bigint")
  circulatingSupply: number;

  @Column("bigint", { nullable: true })
  totalSupply: number | null;

  @Column("bigint", { nullable: true })
  maxSupply: number | null;

  @Column("decimal", { precision: 18, scale: 2, nullable: true })
  ath: number | null;

  @Column("timestamp", { nullable: true })
  athDate: Date | null;

  @Column("decimal", { precision: 18, scale: 2, nullable: true })
  atl: number | null;

  @Column("timestamp", { nullable: true })
  atlDate: Date | null;

  @Column("timestamp")
  lastUpdated: Date;

  @OneToMany(() => MarketData, (marketData) => marketData.coin)
  marketData: MarketData[];
}
