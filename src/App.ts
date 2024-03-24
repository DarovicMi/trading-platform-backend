import "reflect-metadata";
import "dotenv/config";
import { AppDataSource } from "./config/DatabaseConfig";
import express from "express";
import { parseJsonMiddleware } from "./middleware/JSONParse";
import cookieParser from "cookie-parser";
import { csrfErrorHandler, csrfProtection } from "./middleware/CheckCSRF";

import userRoutes from "./routes/UserRoutes";
import authRoutes from "./routes/AuthRoutes";
import roleRoutes from "./routes/RoleRoutes";
import permissionRoutes from "./routes/PermissionRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(parseJsonMiddleware);
app.use(cookieParser());
app.use(csrfProtection);

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/permissions", permissionRoutes);
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
