import type { UserRole, UserStatus } from "../../generated/index";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: UserRole;
        status: UserStatus;
        email?: string | null;
        name?: string | null;
      };
    }
  }
}

export {};
