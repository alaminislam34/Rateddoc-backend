# Express + TypeScript + PostgreSQL + Prisma + Better Auth — Full Backend Setup Document

## Context
এই document টি `foodvally-backend` project এর exact structure অনুযায়ী তৈরি। প্রতিবার নতুন backend project setup করার সময় এই document follow করলে same architecture পাওয়া যাবে। শেষে Claude Prompt দেওয়া আছে যেটা দিয়ে Claude কে বললেই সে এই setup করে দেবে।

---

## Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 20+ | Runtime |
| TypeScript | ^5.9.3 | Language |
| Express | ^5.2.1 | Web framework |
| Prisma | ^7.4.1 | ORM |
| PostgreSQL | — | Database |
| Better Auth | ^1.4.18 | Authentication |
| Zod | ^4.3.6 | Validation |
| Cloudinary | ^2.9.0 | Image storage |
| Multer | ^2.1.1 | File upload |
| JWT | ^9.0.3 | Token management |
| Nodemailer | ^8.0.5 | Email service |
| express-rate-limit | ^8.3.2 | Rate limiting |
| pnpm | 10.28.0 | Package manager |

---

## Final Directory Structure

```
project-root/
├── src/
│   ├── app.ts                          # Express app setup
│   ├── server.ts                       # Bootstrap entry point
│   ├── config/
│   │   ├── env.ts                      # Env var loading & validation
│   │   ├── cloudinary.ts               # Cloudinary SDK config
│   │   └── multer.config.ts            # Multer storage config
│   └── app/
│       ├── Routes/
│       │   └── index.ts                # All module routes aggregated
│       ├── middleware/
│       │   ├── checkAuth.ts            # JWT auth + role check
│       │   ├── checkPermission.ts      # Permission-based access
│       │   ├── globalErrorHandler.ts   # Central error handler
│       │   ├── rateLimiter.ts          # Rate limiting (general/auth/otp)
│       │   ├── requestContext.ts       # UUID request ID injection
│       │   ├── zodValidation.ts        # Zod schema validation middleware
│       │   └── notFound.ts             # 404 handler
│       ├── errHelpers/
│       │   ├── AppError.ts             # Custom error class
│       │   └── zodErrorHandler.ts      # Zod error formatter
│       ├── interfaces/
│       │   └── zodError.ts             # TErrorSources, TErrorResponse types
│       ├── types/
│       │   └── express.d.ts            # Express Request type extension
│       ├── lib/
│       │   ├── prisma.ts               # Prisma client singleton
│       │   ├── auth.ts                 # Better Auth configuration
│       │   └── mailer.ts               # Nodemailer SMTP setup
│       ├── utils/
│       │   ├── jwt.ts                  # JWT create/verify/decode
│       │   └── token.ts                # Access/refresh token helpers
│       ├── shared/
│       │   ├── catchAsync.ts           # Async error wrapper
│       │   └── sendResponse.ts         # Standardized response
│       ├── constants/
│       │   └── permissions.ts          # Role-permission mapping
│       └── module/
│           └── [feature]/              # Each feature module:
│               ├── [feature].routes.ts
│               ├── [feature].controller.ts
│               ├── [feature].service.ts
│               ├── [feature].validation.ts
│               └── [feature].interface.ts
├── prisma/
│   ├── schema/
│   │   ├── schema.prisma               # Generator + datasource config
│   │   ├── enums.prisma                # All enums
│   │   ├── auth.prisma                 # User, Session, Account, Verification
│   │   └── [model].prisma              # Per-model schema files
│   └── migrations/                     # Auto-generated migration history
├── package.json
├── tsconfig.json
└── .env / .env.example
```

> **Prisma generated client location:** `src/generated/` (output = `../../src/generated` in schema.prisma)

---

## Step 1 — package.json

```json
{
  "name": "backend",
  "version": "1.0.0",
  "type": "module",
  "packageManager": "pnpm@10.28.0",
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc -p .",
    "dev": "tsx watch src/server.ts",
    "migrate": "prisma migrate dev",
    "generate": "prisma generate",
    "push": "prisma db push",
    "studio": "prisma studio",
    "reset": "prisma migrate reset",
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && prisma migrate deploy && tsc -p ."
  },
  "dependencies": {
    "@prisma/adapter-pg": "^7.4.1",
    "@prisma/client": "^7.4.1",
    "@types/express-rate-limit": "^6.0.2",
    "@types/nodemailer": "^8.0.0",
    "better-auth": "^1.4.18",
    "cloudinary": "^2.9.0",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.6",
    "date-fns": "^4.1.0",
    "dotenv": "^17.3.1",
    "express": "^5.2.1",
    "express-rate-limit": "^8.3.2",
    "http-status": "^2.1.0",
    "jsonwebtoken": "^9.0.3",
    "multer": "^2.1.1",
    "multer-storage-cloudinary": "^4.0.0",
    "nodemailer": "^8.0.5",
    "pg": "^8.18.0",
    "tsup": "^8.5.1",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@eslint/js": "^10.0.1",
    "@types/cookie-parser": "^1.4.10",
    "@types/cors": "^2.8.19",
    "@types/express": "^5.0.6",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/multer": "^2.1.0",
    "@types/node": "^25.3.0",
    "@types/pg": "^8.16.0",
    "eslint": "^10.0.1",
    "prisma": "^7.4.1",
    "tsx": "^4.21.0",
    "typescript": "^5.9.3",
    "typescript-eslint": "^8.56.0"
  }
}
```

---

## Step 2 — tsconfig.json

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "rootDir": "./",
    "outDir": "./dist",
    "moduleResolution": "bundler",
    "target": "ES2023",
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*", "prisma.config.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Step 3 — .env.example

```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:5000

FRONTEND_URL=http://localhost:3000

ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRES_IN=1d
REFRESH_TOKEN_EXPIRES_IN=7d

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

EMAIL_SENDER_SMTP_HOST=smtp.gmail.com
EMAIL_SENDER_SMTP_PORT=465
EMAIL_SENDER_SMTP_USER=your_email@gmail.com
EMAIL_SENDER_SMTP_PASS=your_app_password
EMAIL_SENDER_SMTP_FROM=your_email@gmail.com

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

## Step 4 — Prisma Schema Setup

### `prisma/schema/schema.prisma` — Generator + Datasource

```prisma
generator client {
  provider = "prisma-client"
  output   = "../../src/generated"
}

datasource db {
  provider = "postgresql"
}
```

> **গুরুত্বপূর্ণ:** `output = "../../src/generated"` — Prisma client `src/generated/` এ generate হবে। Import করতে হবে `../../generated/client` থেকে।

### `prisma/schema/enums.prisma`

```prisma
enum UserRole {
  CUSTOMER
  PROVIDER
  ADMIN
}

enum UserStatus {
  ACTIVE
  BLOCKED
  DELETED
}
```

### `prisma/schema/auth.prisma` — Better Auth required models

```prisma
model User {
  id                String    @id @default(uuid())
  name              String
  email             String    @unique
  emailVerified     Boolean   @default(false)
  image             String?
  role              UserRole  @default(CUSTOMER)
  status            UserStatus @default(ACTIVE)
  isDeleted         Boolean   @default(false)
  deletedAt         DateTime?
  needPasswordReset Boolean   @default(false)
  rememberMe        Boolean   @default(false)
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
  sessions          Session[]
  accounts          Account[]
}

model Session {
  id        String   @id
  expiresAt DateTime
  token     String   @unique
  ipAddress String?
  userAgent String?
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Account {
  id                    String    @id
  accountId             String
  providerId            String
  userId                String
  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  accessToken           String?
  refreshToken          String?
  idToken               String?
  accessTokenExpiresAt  DateTime?
  refreshTokenExpiresAt DateTime?
  scope                 String?
  password              String?
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}

model Verification {
  id         String    @id
  identifier String
  value      String
  expiresAt  DateTime
  createdAt  DateTime? @default(now())
  updatedAt  DateTime? @updatedAt
}
```

---

## Step 5 — src/config/env.ts

```typescript
import dotenv from "dotenv";
dotenv.config();

interface IEnvConfig {
  PORT: string;
  NODE_ENV: string;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
  EMAIL_SENDER_SMTP_HOST: string;
  EMAIL_SENDER_SMTP_PORT: string;
  EMAIL_SENDER_SMTP_USER: string;
  EMAIL_SENDER_SMTP_PASS: string;
  EMAIL_SENDER_SMTP_FROM: string;
  ACCESS_TOKEN_SECRET: string;
  REFRESH_TOKEN_SECRET: string;
  ACCESS_TOKEN_EXPIRES_IN: string;
  REFRESH_TOKEN_EXPIRES_IN: string;
  CLOUDINARY_CLOUD_NAME: string;
  CLOUDINARY_API_KEY: string;
  CLOUDINARY_API_SECRET: string;
}

const envConfigs = (): IEnvConfig => {
  const requiredEnvVars = [
    "PORT", "NODE_ENV", "DATABASE_URL",
    "BETTER_AUTH_SECRET", "BETTER_AUTH_URL",
    "EMAIL_SENDER_SMTP_HOST", "EMAIL_SENDER_SMTP_PORT",
    "EMAIL_SENDER_SMTP_USER", "EMAIL_SENDER_SMTP_PASS", "EMAIL_SENDER_SMTP_FROM",
    "ACCESS_TOKEN_SECRET", "REFRESH_TOKEN_SECRET",
    "ACCESS_TOKEN_EXPIRES_IN", "REFRESH_TOKEN_EXPIRES_IN",
    "CLOUDINARY_CLOUD_NAME", "CLOUDINARY_API_KEY", "CLOUDINARY_API_SECRET",
  ];

  if (process.env.NODE_ENV === "development") {
    requiredEnvVars.forEach((envVar) => {
      if (!process.env[envVar]) {
        throw new Error(`Missing required environment variable: ${envVar}`);
      }
    });
  }

  return {
    PORT: process.env.PORT as string,
    NODE_ENV: process.env.NODE_ENV as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    EMAIL_SENDER_SMTP_HOST: process.env.EMAIL_SENDER_SMTP_HOST as string,
    EMAIL_SENDER_SMTP_PORT: process.env.EMAIL_SENDER_SMTP_PORT as string,
    EMAIL_SENDER_SMTP_USER: process.env.EMAIL_SENDER_SMTP_USER as string,
    EMAIL_SENDER_SMTP_PASS: process.env.EMAIL_SENDER_SMTP_PASS as string,
    EMAIL_SENDER_SMTP_FROM: process.env.EMAIL_SENDER_SMTP_FROM as string,
    ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET as string,
    REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET as string,
    ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN as string,
    REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN as string,
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  };
};

export const envVars = envConfigs();
```

---

## Step 6 — src/app/lib/prisma.ts

```typescript
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/client";

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };
```

---

## Step 7 — src/app/lib/auth.ts (Better Auth)

```typescript
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { otp } from "better-auth/plugins";
import { envVars } from "../../config/env";

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  plugins: [
    otp({
      sendOTP: async ({ email, otp: otpCode, type }) => {
        // sendMail() call here
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
    envVars.FRONTEND_URL || "",
  ],
});
```

---

## Step 8 — src/app/errHelpers/AppError.ts

```typescript
class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly errorCode?: string;
  public readonly path?: string;

  constructor(
    statusCode: number,
    message: string,
    stack?: string,
    isOperational = true,
    errorCode?: string,
    path?: string,
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.errorCode = errorCode;
    this.path = path;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export default AppError;
```

---

## Step 9 — src/app/errHelpers/zodErrorHandler.ts

```typescript
import status from "http-status";
import z from "zod";
import { TErrorResponse, TErrorSources } from "../interfaces/zodError";

export const handleZodError = (err: z.ZodError): TErrorResponse => {
  const errorSources: TErrorSources[] = err.issues.map((issue) => ({
    path: issue.path.length > 0 ? issue.path.join(".") : "",
    message: issue.message,
  }));

  return {
    success: false,
    statusCode: status.BAD_REQUEST,
    message: "Zod validation error",
    errorSource: errorSources,
  };
};
```

---

## Step 10 — src/app/interfaces/zodError.ts

```typescript
export interface TErrorSources {
  path: string;
  message: string;
}

export interface TErrorResponse {
  success: boolean;
  statusCode: number;
  message: string;
  errorSource: TErrorSources[];
  error?: unknown;
}
```

---

## Step 11 — src/app/middleware/globalErrorHandler.ts

```typescript
import { NextFunction, Request, Response } from "express";
import z from "zod";
import { envVars } from "../../config/env";
import { TErrorSources } from "../interfaces/zodError";
import status from "http-status";
import { handleZodError } from "../errHelpers/zodErrorHandler";
import AppError from "../errHelpers/AppError";
import { MulterError } from "multer";

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (envVars.NODE_ENV === "development") {
    console.error("Global Error Handler:", err);
  }

  let ErrorSource: TErrorSources[] = [];
  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message = "An unexpected error occurred";
  let code = "INTERNAL_ERROR";
  let stack: string | undefined = err.stack;

  if (err instanceof z.ZodError) {
    const simplified = handleZodError(err);
    statusCode = simplified.statusCode;
    message = simplified.message;
    code = "VALIDATION_ERROR";
    ErrorSource = [...simplified.errorSource];
  } else if (err instanceof MulterError) {
    statusCode = status.BAD_REQUEST;
    code = "UPLOAD_ERROR";
    message =
      err.code === "LIMIT_FILE_SIZE"
        ? "File is too large. Maximum limit is 5MB."
        : err.code === "LIMIT_UNEXPECTED_FILE"
          ? "Too many files or incorrect field name."
          : err.message;
    ErrorSource.push({ path: err.field || "file", message });
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
    code =
      statusCode === status.UNAUTHORIZED ? "UNAUTHORIZED"
      : statusCode === status.FORBIDDEN ? "FORBIDDEN"
      : statusCode === status.NOT_FOUND ? "RESOURCE_NOT_FOUND"
      : statusCode === status.CONFLICT ? "CONFLICT"
      : "APPLICATION_ERROR";
    ErrorSource.push({ path: err.path || "unknown", message: err.message });
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    error: {
      code,
      details: ErrorSource,
      debug: envVars.NODE_ENV === "development" ? err : undefined,
      stack: envVars.NODE_ENV === "development" ? stack : undefined,
    },
    meta: {
      requestId: res.locals.requestId,
      path: req.originalUrl,
      timestamp: new Date().toISOString(),
    },
  });
};
```

---

## Step 12 — src/app/middleware/requestContext.ts

```typescript
import { NextFunction, Request, Response } from "express";
import { randomUUID } from "node:crypto";

export const requestContext = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers["x-request-id"]?.toString() || randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);
  next();
};
```

---

## Step 13 — src/app/middleware/rateLimiter.ts

```typescript
import rateLimit from "express-rate-limit";

const formatRetryAfter = (seconds: number) => {
  const min = Math.ceil(seconds / 60);
  return `${min} minute(s)`;
};

const getRetryAfter = (req: any) => {
  const reset = req?.rateLimit?.resetTime;
  if (!reset) return null;
  const diff = Math.ceil((reset - Date.now()) / 1000);
  return diff > 0 ? diff : null;
};

// General: 120 req / 15 min
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: (req: any) => ({
    success: false,
    message: "Too many requests from this IP, please slow down.",
    tryAgainAfter: formatRetryAfter(getRetryAfter(req) || 900),
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth: 10 req / 15 min
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: (req: any) => ({
    success: false,
    message: "Too many authentication attempts, please try again later.",
    tryAgainAfter: formatRetryAfter(getRetryAfter(req) || 900),
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

// OTP: 10 req / 1 min
export const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: (req: any) => ({
    success: false,
    message: "Too many OTP requests, please try again later.",
    tryAgainAfter: formatRetryAfter(getRetryAfter(req) || 300),
  }),
  standardHeaders: true,
  legacyHeaders: false,
});
```

---

## Step 14 — src/app/middleware/checkAuth.ts

```typescript
import { NextFunction, Request, Response } from "express";
import { UserRole } from "../../generated/enums";
import AppError from "../errHelpers/AppError";
import status from "http-status";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../../config/env";

const checkAuth =
  (...authRoles: UserRole[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const accessToken = req.cookies["accessToken"];

    if (!accessToken) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized: Token missing",
        undefined, true, "TOKEN_MISSING", "accessToken");
    }

    const verifyResult = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);

    if (!verifyResult.success || !verifyResult.data) {
      throw new AppError(status.UNAUTHORIZED, "Unauthorized: Invalid access token",
        undefined, true, "INVALID_ACCESS_TOKEN", "accessToken");
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
      throw new AppError(status.UNAUTHORIZED, "Unauthorized: User is not active",
        undefined, true, "USER_NOT_ACTIVE", "userId");
    }

    if (authRoles.length > 0 && !authRoles.includes(user.role)) {
      throw new AppError(status.FORBIDDEN, "Forbidden: Insufficient role",
        undefined, true, "INSUFFICIENT_ROLE", "role");
    }

    req.user = {
      userId: user.id,
      role: user.role,
      status: user.status,
      email: user.email,
      name: user.name,
    };

    next();
  };

export default checkAuth;
```

---

## Step 15 — src/app/middleware/zodValidation.ts

```typescript
import { NextFunction, Request, Response } from "express";
import z from "zod";

export const zodValidation = (zodObject: z.ZodObject) => {
  return (req: Request, res: Response, next: NextFunction) => {
    // multer file upload এর সাথে JSON stringify করা data parse করে
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }

    const validationResult = zodObject.safeParse(req.body);

    if (!validationResult.success) {
      return next(validationResult.error);
    }

    req.body = validationResult.data;
    return next();
  };
};
```

---

## Step 16 — src/app/middleware/notFound.ts

```typescript
import { Request, Response, NextFunction } from "express";

export const notFound = (_req: Request, res: Response, _next: NextFunction) => {
  res.status(404).json({ success: false, message: "Route not found" });
};
```

---

## Step 17 — src/app/types/express.d.ts

```typescript
import { UserRole, UserStatus } from "../../generated/enums";

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
```

---

## Step 18 — src/app/utils/jwt.ts

```typescript
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";

const createToken = (payload: JwtPayload, secret: string, { expiresIn }: SignOptions) => {
  return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (
  token: string,
  secret: string,
): { success: boolean; data?: JwtPayload; message?: string; error?: any } => {
  try {
    const decoded = jwt.verify(token, secret);
    return { success: true, data: decoded as JwtPayload };
  } catch (error: any) {
    return { success: false, message: error.message, error };
  }
};

const decodedToken = (token: string) => jwt.decode(token) as JwtPayload;

export const jwtUtils = { createToken, verifyToken, decodedToken };
```

---

## Step 19 — src/app/shared/catchAsync.ts

```typescript
import { NextFunction, Request, Response } from "express";

export const catchAsync = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      fn(req, res, next).catch(next);
    } catch (error) {
      throw error;
    }
  };
};
```

---

## Step 20 — src/app/shared/sendResponse.ts

```typescript
import { Response } from "express";

export const sendResponse = async (
  res: Response,
  resData: {
    statusCode: number;
    success: boolean;
    message: string;
    data?: any;
    meta?: Record<string, unknown>;
  },
) => {
  const { success, message, data, statusCode, meta } = resData;
  const requestId = res.locals.requestId as string | undefined;

  res.status(statusCode).json({
    success,
    message,
    data,
    meta: {
      requestId,
      ...(meta || {}),
    },
  });
};
```

---

## Step 21 — src/app.ts

```typescript
import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/Routes";
import { notFound } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import cors from "cors";
import cookieParser from "cookie-parser";
import { requestContext } from "./app/middleware/requestContext";
import { generalLimiter } from "./app/middleware/rateLimiter";

const app: Application = express();

app.use(cors({
  origin: ["http://localhost:3000", process.env.FRONTEND_URL || ""],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(requestContext);
app.use(generalLimiter);

app.get("/", (_req: Request, res: Response) => {
  res.send("Welcome to API");
});

app.use("/api/v1", IndexRoutes);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
```

---

## Step 22 — src/server.ts

```typescript
import app from "./app";
import { envVars } from "./config/env";

const bootstrap = async () => {
  try {
    if (process.env.NODE_ENV !== "production") {
      app.listen(envVars.PORT, () => {
        console.log(`Server is running on http://localhost:${envVars.PORT}`);
      });
    }
  } catch (error) {
    console.error(`Server error:`, error);
  }
};

bootstrap();

// Vercel এর জন্য export
export default app;
```

---

## Step 23 — Module Pattern (একটি module এর full example)

প্রতিটি feature এর জন্য এই 5-file pattern follow করতে হবে।

### `src/app/module/[feature]/[feature].interface.ts`
```typescript
export interface ICreateFeaturePayload {
  title: string;
  description?: string;
}
```

### `src/app/module/[feature]/[feature].validation.ts`
```typescript
import z from "zod";

export const createFeatureZodSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
});
```

### `src/app/module/[feature]/[feature].service.ts`
```typescript
import { prisma } from "../../lib/prisma";
import AppError from "../../errHelpers/AppError";
import status from "http-status";

const createFeature = async (payload: { title: string; description?: string }) => {
  const result = await prisma.feature.create({ data: payload });
  return result;
};

export const FeatureService = { createFeature };
```

### `src/app/module/[feature]/[feature].controller.ts`
```typescript
import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { FeatureService } from "./feature.service";
import status from "http-status";

const createFeature = catchAsync(async (req: Request, res: Response) => {
  const result = await FeatureService.createFeature(req.body);
  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "Feature created successfully",
    data: result,
  });
});

export const FeatureController = { createFeature };
```

### `src/app/module/[feature]/[feature].routes.ts`
```typescript
import { Router } from "express";
import { FeatureController } from "./feature.controller";
import { zodValidation } from "../../middleware/zodValidation";
import checkAuth from "../../middleware/checkAuth";
import { createFeatureZodSchema } from "./feature.validation";

const router = Router();

router.post("/", checkAuth("ADMIN"), zodValidation(createFeatureZodSchema), FeatureController.createFeature);
router.get("/", FeatureController.getAllFeatures);

export const FeatureRoutes = router;
```

### Route index তে add করা — `src/app/Routes/index.ts`
```typescript
router.use("/features", FeatureRoutes);
```

---

## Step 24 — Response Format Standards

### Success Response
```json
{
  "success": true,
  "message": "Action successful",
  "data": {},
  "meta": {
    "requestId": "uuid-v4",
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [{ "path": "email", "message": "Invalid email" }],
    "debug": null,
    "stack": null
  },
  "meta": {
    "requestId": "uuid-v4",
    "path": "/api/v1/auth/login",
    "timestamp": "2026-06-03T10:00:00.000Z"
  }
}
```

---

## Step 25 — Prisma Migration Workflow

```bash
# Schema পরিবর্তনের পর:
pnpm migrate          # migration create + apply (dev)
pnpm generate         # Prisma client regenerate

# Production deploy:
pnpm vercel-build     # generate + migrate deploy + build
```

> Prisma schema multiple files এ রাখা হয়েছে `prisma/schema/` এ। `schema.prisma` তে শুধু generator ও datasource থাকে। বাকি models আলাদা `.prisma` file এ।

---

## ক্লড প্রম্পট — নতুন project setup করতে

নিচের prompt টি Claude কে দিলে সে হুবহু এই architecture অনুযায়ী নতুন project setup করবে:

```
আমি একটি নতুন Express + TypeScript + PostgreSQL + Prisma 7 + Better Auth backend project setup করতে চাই। নিচের exact pattern এ করতে হবে:

**Stack:**
- Node.js, TypeScript 5+, Express 5, Prisma 7 (with @prisma/adapter-pg), PostgreSQL
- Better Auth 1.4+ (email+password + OTP plugin)
- Zod 4+ validation, JWT (jsonwebtoken), Nodemailer, Cloudinary + Multer
- express-rate-limit, cookie-parser, cors, http-status, dotenv
- Package manager: pnpm, type: "module" (ESM)

**Directory structure:**
```
src/
├── app.ts
├── server.ts
├── config/env.ts
└── app/
    ├── Routes/index.ts
    ├── middleware/ (checkAuth, globalErrorHandler, rateLimiter, requestContext, zodValidation, notFound)
    ├── errHelpers/ (AppError.ts, zodErrorHandler.ts)
    ├── interfaces/zodError.ts
    ├── types/express.d.ts
    ├── lib/ (prisma.ts, auth.ts, mailer.ts)
    ├── utils/ (jwt.ts, token.ts)
    ├── shared/ (catchAsync.ts, sendResponse.ts)
    ├── constants/permissions.ts
    └── module/[feature]/ (routes, controller, service, validation, interface — 5 files pattern)
prisma/
└── schema/ (schema.prisma, enums.prisma, auth.prisma, separate model files)
```

**Key rules:**
1. Prisma client output: `src/generated/` — prisma/schema/schema.prisma তে `output = "../../src/generated"` দিতে হবে
2. Prisma adapter: `@prisma/adapter-pg` দিয়ে PrismaPg connection pool ব্যবহার করতে হবে
3. AppError class: statusCode, message, stack, isOperational, errorCode, path — 6 property
4. globalErrorHandler: ZodError, MulterError, AppError, Error — 4 type handle করবে। Response এ meta.requestId, meta.path, meta.timestamp থাকবে
5. requestContext middleware: `res.locals.requestId` তে UUID set করবে, `x-request-id` header ও set করবে
6. sendResponse: requestId res.locals থেকে নেবে, meta তে merge করবে
7. checkAuth: cookie থেকে accessToken নেবে, prisma দিয়ে user verify করবে, req.user তে attach করবে
8. zodValidation: req.body.data থাকলে JSON.parse করবে (multer compatibility এর জন্য)
9. Rate limiters: generalLimiter (120/15min), authLimiter (10/15min), otpLimiter (10/1min)
10. config/env.ts: development mode এ সব required env vars check করবে, না থাকলে error throw করবে
11. server.ts: production এ app.listen করবে না, Vercel এর জন্য `export default app`
12. Module pattern: প্রতি feature এ 5 file — routes, controller, service, validation, interface
13. tsconfig: module=ESNext, target=ES2023, moduleResolution=bundler, strict=true, outDir=./dist

প্রথমে project এর জন্য একটি project name নাও, তারপর উপরের structure অনুযায়ী সম্পূর্ণ setup করো। .env.example file সহ সব boilerplate code লিখে দাও।
```

---

## Verification Steps

নতুন project setup করার পর check করতে হবে:

1. `pnpm install` — কোনো error নেই
2. `.env` file তৈরি করে সব vars দাও
3. `pnpm generate` — Prisma client `src/generated/` এ তৈরি হয়েছে
4. `pnpm migrate` — migration চলেছে
5. `pnpm dev` — server `http://localhost:5000` এ চলছে
6. `GET /` — `"Welcome to API"` response আসছে
7. `POST /api/v1/auth/signup` — request body invalid হলে Zod error আসছে, format ঠিক আছে
8. Valid request পাঠালে success response এ `meta.requestId` আছে
9. Protected route এ token ছাড়া request পাঠালে `UNAUTHORIZED` error আসছে
