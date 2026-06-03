import jwt, { type JwtPayload, type SignOptions } from "jsonwebtoken";

const createToken = (
  payload: JwtPayload,
  secret: string,
  options: SignOptions,
) => {
  return jwt.sign(payload, secret, options);
};

const verifyToken = (
  token: string,
  secret: string,
): { success: boolean; data?: JwtPayload; message?: string; error?: unknown } => {
  try {
    const decoded = jwt.verify(token, secret);
    return { success: true, data: decoded as JwtPayload };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error",
      error,
    };
  }
};

const decodedToken = (token: string) => jwt.decode(token) as JwtPayload;

export const jwtUtils = { createToken, verifyToken, decodedToken };
