import status from "http-status";
import { ZodError } from "zod";
import type { TErrorResponse, TErrorSources } from "../interfaces/zodError";

export const handleZodError = (err: ZodError): TErrorResponse => {
  const errorSources: TErrorSources[] = err.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "",
    message: issue.message,
  }));

  return {
    success: false,
    statusCode: status.BAD_REQUEST as number,
    message: "Zod validation error",
    errorSource: errorSources,
  };
};
