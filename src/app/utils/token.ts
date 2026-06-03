import { envVars } from "../../config/env";
import type { UserRole, UserStatus } from "../../generated/index";
import { jwtUtils } from "./jwt";

interface TokenPayload {
  userId: string;
  role: UserRole;
  status: UserStatus;
  email?: string | null;
  name?: string | null;
}

const createAccessToken = (payload: TokenPayload) => {
  return jwtUtils.createToken(
    { ...payload },
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN as `${number}${"d" | "h" | "m" | "s"}` },
  );
};

const createRefreshToken = (payload: TokenPayload) => {
  return jwtUtils.createToken(
    { ...payload },
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN as `${number}${"d" | "h" | "m" | "s"}` },
  );
};

export const tokenUtils = { createAccessToken, createRefreshToken };
