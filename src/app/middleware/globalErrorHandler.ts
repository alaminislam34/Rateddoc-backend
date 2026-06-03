import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { MulterError } from "multer";
import status from "http-status";
import { envVars } from "../../config/env";
import type { TErrorSources } from "../interfaces/zodError";
import { handleZodError } from "../errHelpers/zodErrorHandler";
import AppError from "../errHelpers/AppError";

export const globalErrorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.error("Global Error Handler:", err);
  }

  let errorSource: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR as number;
  let message = "An unexpected error occurred";
  let code = "INTERNAL_ERROR";
  const stack = err instanceof Error ? err.stack : undefined;

  if (err instanceof ZodError) {
    const simplified = handleZodError(err);
    statusCode = simplified.statusCode;
    message = simplified.message;
    code = "VALIDATION_ERROR";
    errorSource = [...simplified.errorSource];
  } else if (err instanceof MulterError) {
    statusCode = status.BAD_REQUEST as number;
    code = "UPLOAD_ERROR";
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum limit is 5MB."
        : err.code === "LIMIT_UNEXPECTED_FILE"
          ? "Too many files or incorrect field name."
          : err.message;
    errorSource.push({ path: err.field ?? "file", message });
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code =
      statusCode === (status.UNAUTHORIZED as number) ? "UNAUTHORIZED"
      : statusCode === (status.FORBIDDEN as number) ? "FORBIDDEN"
      : statusCode === (status.NOT_FOUND as number) ? "RESOURCE_NOT_FOUND"
      : statusCode === (status.CONFLICT as number) ? "CONFLICT"
      : "APPLICATION_ERROR";
    errorSource.push({ path: err.path ?? "unknown", message: err.message });
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details: errorSource,
      debug: envVars.NODE_ENV === "development" ? err : undefined,
      stack: envVars.NODE_ENV === "development" ? stack : undefined,
    },
    meta: {
      requestId: res.locals["requestId"] as string,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    },
  });
};
