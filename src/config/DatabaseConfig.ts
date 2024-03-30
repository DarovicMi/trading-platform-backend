import { DataSource } from "typeorm";
import { User } from "../entities/User";
import { Role } from "../entities/Role";
import { Permission } from "../entities/Permission";
import { Coin } from "../entities/Coin";
import { MarketData } from "../entities/MarketData";

const DB_TYPE = process.env.DB_TYPE as "mysql";
const DB_HOST = process.env.DB_HOST;
const DB_PORT = Number(process.env.DB_PORT);
const DB_USERNAME = process.env.DB_USER;
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_NAME = process.env.DB_NAME;
const DB_SYNCHRONIZE = process.env.DB_SYNCHRONIZE === "true";
const DB_LOGGING = process.env.DB_LOGGING === "true";

export const AppDataSource = new DataSource({
  type: DB_TYPE,
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_NAME,
  entities: [User, Role, Permission, Coin, MarketData],
  synchronize: DB_SYNCHRONIZE,
  logging: DB_LOGGING,
});
