import cron from "node-cron";
import { fetchAndSaveTariffs } from "#services/tariff.service.js";
import { updateGoogleSheets } from "#services/google.service.js";
import { getLogger } from "#config/logger.js";

const logger = getLogger("scheduler");

export const initScheduler = () => {
    return cron.schedule("0 * * * *", async () => {
        logger.info("Starting hourly update...");

        try {
            await fetchAndSaveTariffs();
            await updateGoogleSheets();

            logger.info("Update completed successfully");
        } catch (error: unknown) {
            const message = error instanceof Error ? error.message : "Unknown error";
            logger.error(`Error during scheduled task: ${message}`);
        }
    });
};
