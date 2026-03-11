import log4js from "log4js";
import env from "#config/env/env.js";

log4js.configure({
    appenders: {
        out: {
            type: "stdout",
            layout: { 
                type: "pattern",
                pattern: "%[[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c -%] %m" 
            },
        },
        file: {
            type: "dateFile",
            filename: env.LOG_FILE_PATH,
            pattern: "yyyy-MM-dd",
            keepFileExt: true,
            compress: true,
            numBackups: 7,
            layout: { 
                type: "pattern",
                pattern: "[%d{yyyy-MM-dd hh:mm:ss}] [%p] %c - %m" 
            },
        },
    },
    categories: {
        default: {
            appenders: ["out", "file"],
            level: env.LOG_LEVEL,
        },
    },
});

export const getLogger = (category: string) => log4js.getLogger(category);
