import type { Response } from "express";

interface ResponseData<T> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: Record<string, unknown>;
}

export const sendResponse = <T>(res: Response, resData: ResponseData<T>) => {
  const { success, message, data, statusCode, meta } = resData;
  const requestId = res.locals["requestId"] as string | undefined;

  res.status(statusCode).json({
    success,
    message,
    data,
    meta: {
      requestId,
      ...(meta ?? {}),
    },
  });
};
