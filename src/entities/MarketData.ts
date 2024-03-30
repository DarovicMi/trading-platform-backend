import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Coin } from "./Coin";

@Entity()
export class MarketData {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Coin, (coin) => coin.marketData)
  @JoinColumn({ name: "coinId" })
  coin: Coin;

  @Column("decimal", { precision: 18, scale: 2 })
  price: number;

  @Column("bigint")
  @Index()
  timestamp: number;
}
