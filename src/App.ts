import "reflect-metadata";
import "dotenv/config";

import { AppDataSource } from "./config/DatabaseConfig";
import { parseJsonMiddleware } from "./middleware/JSONParse";
import { csrfErrorHandler, csrfProtection } from "./middleware/CheckCSRF";

import express from "express";
import cookieParser from "cookie-parser";
import userRoutes from "./routes/UserRoutes";
import authRoutes from "./routes/AuthRoutes";
import coinRoutes from "./routes/CoinRoutes";
import roleRoutes from "./routes/RoleRoutes";
import emailRoutes from "./routes/EmailRoutes";
import passwordRoutes from "./routes/PasswordRoutes";
import permissionRoutes from "./routes/PermissionRoutes";
import cors from "cors";
import { corsOptions } from "./middleware/Cors";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(parseJsonMiddleware);
app.use(cookieParser());

app.use("/api/email", emailRoutes);
app.use("/api/", passwordRoutes);
app.use("/api/users", userRoutes);
app.use(csrfProtection);
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/market", coinRoutes);

app.use(csrfErrorHandler);

app.get("/api/csrf-token", (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

const startServer = async () => {
  try {
    await AppDataSource.initialize();
    app.listen(PORT, () => console.log("Server running on port: ", PORT));
  } catch (error) {
    console.log("ERROR -> ", error);
  }
};

startServer();
