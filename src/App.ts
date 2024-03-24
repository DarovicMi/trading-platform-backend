import "reflect-metadata";
import "dotenv/config";
import { AppDataSource } from "./config/DatabaseConfig";
import express from "express";
import { parseJsonMiddleware } from "./middleware/JSONParse";
import cookieParser from "cookie-parser";

import userRoutes from "./routes/UserRoutes";
import authRoutes from "./routes/AuthRoutes";
import roleRoutes from "./routes/RoleRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(parseJsonMiddleware);
app.use(cookieParser());

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    app.listen(PORT, () => console.log("Server running on port: ", PORT));
  } catch (error) {
    console.log("ERROR -> ", error);
  }
};

startServer();
