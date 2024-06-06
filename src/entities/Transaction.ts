import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from "typeorm";
import { User } from "./User";
import { Coin } from "./Coin";

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @ManyToOne(() => Coin)
  coin: Coin;

  @Column()
  type: "BUY" | "SELL";

  @Column("decimal", { precision: 18, scale: 8 })
  amount: number;

  @Column("decimal", { precision: 18, scale: 8 })
  price: number;

  @CreateDateColumn()
  timestamp: Date;
}
