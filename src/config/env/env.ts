import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
    TZ: z.string().default("Europe/Moscow"),
    
    NODE_ENV: z.enum(["development", "production", "test"]).default("production"),
    APP_PORT: z.coerce.number().default(5000),

    POSTGRES_HOST: z.string().min(1).default("localhost"),
    POSTGRES_PORT: z.coerce.number().default(5432),
    POSTGRES_DB: z.string().min(1),
    POSTGRES_USER: z.string().min(1),
    POSTGRES_PASSWORD: z.string().min(1),

    WB_API_URL: z.string().url().default("https://common-api.wildberries.ru/api/v1/tariffs/box"),
    WB_API_TOKEN: z.string().min(1, "WB_API_TOKEN is required"),

    GOOGLE_AUTH_URL: z.string().url().default("https://www.googleapis.com/auth/spreadsheets"),
    GOOGLE_SERVICE_ACCOUNT_EMAIL: z.string().email(),
    GOOGLE_PRIVATE_KEY: z
        .string()
        .min(1)
        .transform((key) => key.replace(/\\n/g, "\n")),
    GOOGLE_SHEET_IDS: z
        .string()
        .min(1)
        .transform((val) =>
            val
                .split(",")
                .map((id) => id.trim())
                .filter(Boolean),
        ),

    LOG_LEVEL: z.enum(["trace", "debug", "info", "warn", "error", "fatal"]).default("info"),
    LOG_FILE_PATH: z.string().default("./logs/app.log"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error("Ошибка в переменных окружения:");
    parsed.error.issues.forEach((issue) => {
        console.error(`   - ${issue.path.join(".")}: ${issue.message}`);
    });
    process.exit(1);
}

export default parsed.data;
