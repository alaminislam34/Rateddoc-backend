import express, { type Application, type Request, type Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { IndexRoutes } from "./app/Routes/index";
import { notFound } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { requestContext } from "./app/middleware/requestContext";
import { generalLimiter } from "./app/middleware/rateLimiter";

const app: Application = express();

app.use(cors({
  origin: [
    "http://localhost:3000",
    process.env.FRONTEND_URL ?? "",
  ],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(requestContext);
app.use(generalLimiter);

app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to API");
});

app.use("/api/v1", IndexRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
