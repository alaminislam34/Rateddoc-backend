import rateLimit, { type AugmentedRequest } from "express-rate-limit";

const formatRetryAfter = (seconds: number) => {
  const min = Math.ceil(seconds / 60);
  return `${min} minute(s)`;
};

const getRetryAfter = (req: AugmentedRequest) => {
  const reset = req.rateLimit?.resetTime;
  if (!reset) return null;
  const diff = Math.ceil((reset.getTime() - Date.now()) / 1000);
  return diff > 0 ? diff : null;
};

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 120,
  message: (req: AugmentedRequest) => ({
    success: false,
    message: "Too many requests from this IP, please slow down.",
    tryAgainAfter: formatRetryAfter(getRetryAfter(req) ?? 900),
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: (req: AugmentedRequest) => ({
    success: false,
    message: "Too many authentication attempts, please try again later.",
    tryAgainAfter: formatRetryAfter(getRetryAfter(req) ?? 900),
  }),
  standardHeaders: true,
  legacyHeaders: false,
});

export const otpLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: (req: AugmentedRequest) => ({
    success: false,
    message: "Too many OTP requests, please try again later.",
    tryAgainAfter: formatRetryAfter(getRetryAfter(req) ?? 300),
  }),
  standardHeaders: true,
  legacyHeaders: false,
});
