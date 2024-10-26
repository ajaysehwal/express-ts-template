import { z } from "zod";

export const envSchema = z.object({
  PORT: z.string().transform(Number).pipe(z.number().min(1).max(65535)),
  NODE_ENV: z.enum(["development", "production", "test", "staging"]),
  ADMIN_USER:z.string(),
  ADMIN_PASSWORD:z.string(),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().min(32).optional(),
  COOKIE_SECRET: z.string().min(32).optional(),
  ACCESS_TOKEN_EXPIRES_IN: z.string().default("15m").optional(),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default("7d").optional(),
  REDIS_HOST: z.string().optional(),
  REDIS_PORT: z.string().transform(Number).optional(),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_USERNAME: z.string().optional(),
  REDIS_TLS_ENABLED: z
    .string()
    .transform((val) => val === "true")
    .default("false").optional(),
  DB_HOST: z.string().optional(),
  DB_PORT: z.string().transform(Number).optional(),
  DB_NAME: z.string().optional(),
  DB_USER: z.string().optional(),
  DB_PASSWORD: z.string().optional(),
  DB_POOL_MIN: z.string().transform(Number).default("2").optional(),
  DB_POOL_MAX: z.string().transform(Number).default("10").optional(),
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info").optional(),
  LOG_FORMAT: z.enum(["json", "pretty"]).default("json").optional(),
  CORS_ORIGIN: z.string().transform((val) => val.split(",")),
  CORS_METHODS: z
    .string()
    .transform((val) => val.split(","))
    .default("GET,POST,PUT,DELETE,PATCH"),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default("900000").optional(),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default("100").optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;
