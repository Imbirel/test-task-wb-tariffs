import cron from "node-cron";
import { fetchAndSaveTariffs } from "#services/tariff.service.js";
import { updateGoogleSheets } from "#services/google.service.js";
import { getLogger } from "#config/logger.js";
import env from "#config/env/env.js";

const logger = getLogger("scheduler");

let isRunning = false;

export const initScheduler = () => {
    return cron.schedule(env.CRON_SCHEDULE, async () => {
        if (isRunning) return logger.warn("Previous update is still running...");

        isRunning = true;
        logger.info("Starting hourly update...");

        try {
            await fetchAndSaveTariffs();
            await updateGoogleSheets();

            logger.info("Update completed successfully");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            logger.error(`Error during scheduled task: ${message}`);
        } finally {
            isRunning = false;
        }
    });
};
