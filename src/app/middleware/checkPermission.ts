import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import AppError from "../errHelpers/AppError";
import { permissions } from "../constants/permissions";

const checkPermission = (resource: string, action: string) => {
  return (_req: Request, _res: Response, next: NextFunction) => {
    const userRole = _req.user?.role;

    if (!userRole) {
      throw new AppError(
        status.UNAUTHORIZED as number,
        "Unauthorized: No role found",
        undefined, true, "TOKEN_MISSING",
      );
    }

    const rolePerms = permissions[userRole];
    if (!rolePerms?.[resource]?.includes(action)) {
      throw new AppError(
        status.FORBIDDEN as number,
        "Forbidden: Insufficient permissions",
        undefined, true, "INSUFFICIENT_PERMISSIONS", resource,
      );
    }

    next();
  };
};

export default checkPermission;
