import type { NextFunction, Request, Response } from "express";
import status from "http-status";
import { envVars } from "../../config/env";
import AppError from "../errHelpers/AppError";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import type { UserRole } from "../../generated/index";

const checkAuth =
  (...authRoles: UserRole[]) =>
  async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const accessToken = req.cookies?.["accessToken"] as string | undefined;

      if (!accessToken) {
        throw new AppError(
          status.UNAUTHORIZED as number,
          "Unauthorized: Token missing",
          undefined, true, "TOKEN_MISSING", "accessToken",
        );
      }

      const verifyResult = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

      if (!verifyResult.success || !verifyResult.data) {
        throw new AppError(
          status.UNAUTHORIZED as number,
          "Unauthorized: Invalid access token",
          undefined, true, "INVALID_ACCESS_TOKEN", "accessToken",
        );
      }

      const decoded = verifyResult.data as {
        userId: string;
        role: UserRole;
        status: "ACTIVE" | "BLOCKED" | "DELETED";
        email?: string;
        name?: string;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, role: true, status: true, email: true, name: true, isDeleted: true },
      });

      if (!user || user.isDeleted) {
        throw new AppError(
          status.UNAUTHORIZED as number,
          "Unauthorized: User not found or deleted",
          undefined, true, "USER_NOT_ACTIVE", "userId",
        );
      }

      if (authRoles.length > 0 && !authRoles.includes(user.role)) {
        throw new AppError(
          status.FORBIDDEN as number,
          "Forbidden: Insufficient role",
          undefined, true, "INSUFFICIENT_ROLE", "role",
        );
      }

      req.user = {
        userId: user.id,
        role: user.role,
        status: user.status,
        email: user.email,
        name: user.name,
      };

      next();
    } catch (err) {
      next(err);
    }
  };

export default checkAuth;
