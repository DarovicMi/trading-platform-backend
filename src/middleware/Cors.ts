export const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:4200"],
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204,
};
