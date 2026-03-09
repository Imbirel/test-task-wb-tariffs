import env from "#config/env/env.js";

/**
 * Генерирует дату в формате YYYY-MM-DD для БД и API.
 * Использует часовой пояс из конфигурации (по умолчанию Europe/Moscow).
 * 
 * @example "2023-10-27"
 */
export const getTodayDate = (): string => {
    return new Date().toLocaleDateString('en-CA', { 
        timeZone: env.TZ 
    });
};

/**
 * Генерирует стандартный ISO-штамп времени.
 * 
 * @example "2023-10-27T14:05:01.000Z"
 */
export const getLogTimestamp = (): string => new Date().toISOString();

/**
 * Генерирует человекочитаемую дату и время в формате RU.
 * Полезно для записи времени обновления в ячейки Google Sheets.
 * 
 * @example "27.10.2023, 17:05:01"
 */
export const getReadableTimestamp = (): string => {
    return new Date().toLocaleString('ru-RU', { 
        timeZone: env.TZ 
    });
};
