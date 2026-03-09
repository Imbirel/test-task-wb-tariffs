import axios, { isAxiosError } from "axios";
import { getTodayDate } from "#utils/date.js";
import { getLogger } from "#config/logger.js";
import env from "#config/env/env.js";

const logger = getLogger("wb-service");

const wbClient = axios.create({
    baseURL: env.WB_API_URL,
    timeout: 10000,
});

export const getWBTariffs = async (token: string): Promise<unknown> => {
    const today = getTodayDate();

    try {
        logger.info(`Отправка запроса к WB API за дату: ${today}`);

        const startTime = Date.now();

        const { data } = await wbClient.get<Record<string, unknown>>("", {
            params: { date: today },
            headers: { Authorization: token },
        });

        const duration = Date.now() - startTime;

        const raw = data as Record<string, any>;

        const responseData = raw?.data || raw?.response?.data || raw?.response || raw;
        const warehouseList = responseData?.warehouseList;

        if (!Array.isArray(warehouseList)) {
            logger.error({ response: data }, "Неверная структура ответа от WB API: warehouseList не является массивом");
            throw new Error("Invalid response structure from WB API");
        }

        logger.info(`Данные получены успешно: ${warehouseList.length} складов (время: ${duration}ms)`);

        return {
            warehouseList,
            dtNextBox: responseData?.dtNextBox ?? null,
            dtTillMax: responseData?.dtTillMax ?? null,
        };
    } catch (err: unknown) {
        if (isAxiosError(err)) {
            const status = err.response?.status;
            const message = err.response?.data?.errorText || err.message;
            logger.error(`Ошибка WB API: ${status || "Network Error"} ${message}`);
        } else {
            logger.error(`Неизвестная ошибка в wb-service: ${String(err)}`);
        }
        throw err;
    }
};
