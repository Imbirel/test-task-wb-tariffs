import "dotenv/config";
import { ScheduledTask } from "node-cron";
import { getLogger } from "#config/logger.js";
import { migrate, seed } from "#postgres/knex.js";
import { initScheduler } from "#jobs/scheduler.js";
import { fetchAndSaveTariffs } from "#services/tariff.service.js";
import { updateGoogleSheets } from "#services/google.service.js";

const logger = getLogger("app");

async function bootstrap() {
    logger.info("Запуск инициализации приложения...");

    logger.info("Выполнение миграций и сидов...");
    await migrate.latest();
    await seed.run();
    logger.info("База данных готова к работе");

    logger.info("Запуск первичного сбора данных...");
    await fetchAndSaveTariffs();
    await updateGoogleSheets();
    logger.info("Первичные данные успешно загружены в БД и Google Sheets");

    const task: ScheduledTask = initScheduler();
    logger.info("Планировщик запущен. Сервис работает в штатном режиме.");

    const shutdown = async (signal: string) => {
        logger.info(`Получен сигнал ${signal}. Завершение работы...`);

        try {
            if (task?.stop) await task.stop();
            logger.info("Работа успешно завершена.");
            process.exit(0);
        } catch (err) {
            logger.error(`Ошибка при закрытии ресурсов: ${err instanceof Error ? err.message : err}`);
            process.exit(1);
        }
    };

    process.on("SIGINT", () => shutdown("SIGINT"));
    process.on("SIGTERM", () => shutdown("SIGTERM"));
}

await bootstrap().catch((err) => {
    logger.fatal(`Критическая ошибка: ${err.message}`);
    process.exit(1);
});
