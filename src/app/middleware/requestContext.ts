import type { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers["x-request-id"]?.toString() ?? randomUUID();
  res.locals["requestId"] = requestId;
  res.setHeader("x-request-id", requestId);
  next();
};
