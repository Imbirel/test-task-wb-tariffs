import pLimit from "p-limit";
import { google } from "googleapis";
import retry from "async-retry";
import knex from "#postgres/knex.js";
import { getLogger } from "#config/logger.js";
import { getTodayDate, getReadableTimestamp } from "#utils/date.js";
import env from "#config/env/env.js";

const logger = getLogger("google-sheets");
const limit = pLimit(5);

const auth = new google.auth.JWT(env.GOOGLE_SERVICE_ACCOUNT_EMAIL, undefined, env.GOOGLE_PRIVATE_KEY, [env.GOOGLE_AUTH_URL]);

const sheets = google.sheets({ version: "v4", auth });

async function ensureSheetExists(spreadsheetId: string, title: string) {
    const res = await sheets.spreadsheets.get({ spreadsheetId });
    const sheetExists = res.data.sheets?.some((s) => s.properties?.title === title);

    if (!sheetExists) {
        logger.info(`[${spreadsheetId}] Лист "${title}" не найден. Создаю...`);
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
                requests: [{ addSheet: { properties: { title } } }],
            },
        });
    }
}

export const updateGoogleSheets = async () => {
    try {
        const rows = await knex("spreadsheets").select("spreadsheet_id");
        const spreadsheetIds = rows.map((r) => r.spreadsheet_id);

        if (spreadsheetIds.length === 0) {
            return logger.warn("Список ID таблиц пуст. Нечего обновлять.");
        }

        const today = getTodayDate();
        const tariffs = await knex("tariffs").where("date", today).orderBy("box_delivery_marketplace_coef_expr", "asc");

        if (tariffs.length === 0) {
            return logger.warn(`Нет актуальных тарифов в БД за дату ${today}`);
        }

        const updatedTime = getReadableTimestamp();

        const values = [
            [`Данные обновлены (МСК): ${updatedTime}`],
            [],
            [
                "Название склада",
                "Округ РФ / Страна",
                "FBS: Коэф %",
                "FBS: Первый литр (₽)",
                "FBS: Доп. литр (₽)",
                "Логистика: Коэф %",
                "Логистика: Первый литр (₽)",
                "Логистика: Доп. литр (₽)",
                "Хранение: Коэф %",
                "Хранение: Первый литр (₽)",
                "Хранение: Доп. литр (₽)",
                "Дата начала тарифа",
                "Дата окончания тарифа",
            ],
            ...tariffs.map((t) => [
                t.warehouse_name,
                t.geo_name,
                t.box_delivery_marketplace_coef_expr, // коэффициент для сортировки
                t.box_delivery_marketplace_base,
                t.box_delivery_marketplace_liter,
                t.box_delivery_coef_expr,
                t.box_delivery_base,
                t.box_delivery_liter,
                t.box_storage_coef_expr,
                t.box_storage_base,
                t.box_storage_liter,
                t.dt_next_box,
                t.dt_till_max,
            ]),
        ];

        const sheetName = "stocks_coefs";

        logger.info(`Запуск обновления ${spreadsheetIds.length} таблиц...`);

        const tasks = spreadsheetIds.map((id) =>
            limit(async () => {
                try {
                    await retry(
                        async (bail: any) => {
                            try {
                                await ensureSheetExists(id, sheetName);

                                await sheets.spreadsheets.values.clear({
                                    spreadsheetId: id,
                                    range: `${sheetName}!A:Z`,
                                });

                                await sheets.spreadsheets.values.update({
                                    spreadsheetId: id,
                                    range: `${sheetName}!A1`,
                                    valueInputOption: "USER_ENTERED",
                                    requestBody: { values },
                                });

                                logger.info(`[${id}] Успешно обновлена`);
                            } catch (err: any) {
                                if (err.code === 403 || err.code === 404) {
                                    bail(new Error(`Критическая ошибка для ${id}: ${err.message}`));
                                    return;
                                }
                                throw err;
                            }
                        },
                        {
                            retries: 3,
                            factor: 2,
                            minTimeout: 1000,
                            onRetry: (err: any) => logger.warn(`[${id}] Повторная попытка обновления из-за ошибки: ${err.message}`),
                        },
                    );
                } catch (err: any) {
                    logger.error(`[${id}] Не удалось обновить: ${err.message}`);
                }
            }),
        );

        await Promise.all(tasks);
        logger.info("Все таблицы обработаны.");
    } catch (err: any) {
        logger.error(`Глобальная ошибка сервиса Google Sheets: ${err.message}`);
    }
};
