import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { prisma } from "./prisma";
import { envVars } from "../../config/env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: envVars.BETTER_AUTH_SECRET,
  baseURL: envVars.BETTER_AUTH_URL,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    emailOTP({
      sendVerificationOTP: async (_params) => {
        // TODO: wire up sendMail() from lib/mailer
      },
    }),
  ],
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "CUSTOMER" },
      status: { type: "string", defaultValue: "ACTIVE" },
      isDeleted: { type: "boolean", defaultValue: false },
      needPasswordReset: { type: "boolean", defaultValue: false },
      rememberMe: { type: "boolean", defaultValue: false },
    },
  },
  trustedOrigins: [
    "http://localhost:3000",
    "http://localhost:5000",
    envVars.FRONTEND_URL,
  ],
});
