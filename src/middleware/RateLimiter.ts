import rateLimiter from "express-rate-limit";
import { AuthenticationErrorMessage } from "../constants/authentication/AuthenticationErrorMessage";

const IMPORTANT_COOLDOWN = process.env.IMPORTANT_RATE_LIMITER_COOLDOWN;
const IMPORTANT_MAX_ATTEMPTS = process.env.IMPORTANT_RATE_LIMITER_MAX_ATTEMPTS;

const LESS_IMPORTANT_COOLDOWN =
  process.env.LESS_IMPORTANT_RATE_LIMITER_COOLDOWN; // 60 minutes
const LESS_IMPORTANT_MAX_ATTEMPTS =
  process.env.LESS_IMPORTANT_RATE_LIMITER_MAX_ATTEMPTS;

export const importantRateLimiter = rateLimiter({
  windowMs: Number(IMPORTANT_COOLDOWN),
  limit: Number(IMPORTANT_MAX_ATTEMPTS),
  message: { message: AuthenticationErrorMessage.TOO_MANY_LOGIN_ATTEMPTS },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});

export const lessImportantRateLimiter = rateLimiter({
  windowMs: Number(LESS_IMPORTANT_COOLDOWN),
  limit: Number(LESS_IMPORTANT_MAX_ATTEMPTS),
  message: { message: AuthenticationErrorMessage.TOO_MANY_LOGIN_ATTEMPTS },
  standardHeaders: "draft-7",
  legacyHeaders: false,
});
