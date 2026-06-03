import type { UserRole } from "../../generated/index";

type ResourceActions = Record<string, string[]>;

export const permissions: Partial<Record<UserRole, ResourceActions>> = {
  ADMIN: {
    users:        ["read", "write", "delete"],
    dentists:     ["read", "write", "delete"],
    reviews:      ["read", "write", "delete"],
    appointments: ["read", "write", "delete"],
  },
  PROVIDER: {
    dentists:     ["read", "write"],
    reviews:      ["read"],
    appointments: ["read", "write"],
  },
  CUSTOMER: {
    dentists:     ["read"],
    reviews:      ["read", "write"],
    appointments: ["read", "write"],
  },
};
