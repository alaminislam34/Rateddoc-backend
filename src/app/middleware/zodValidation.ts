import type { NextFunction, Request, Response } from "express";
import { type ZodSchema } from "zod";

export const zodValidation = (zodSchema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data as string);
    }

    const result = zodSchema.safeParse(req.body);

    if (!result.success) {
      return next(result.error);
    }

    req.body = result.data;
    return next();
  };
};
