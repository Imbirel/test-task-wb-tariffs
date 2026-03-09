import axios from "axios";
import { getTodayDate } from "#utils/date.js";
import { getLogger } from "#config/logger.js";
import env from "#config/env/env.js";

const logger = getLogger("wb-service");

const wbClient = axios.create({ 
    baseURL: env.WB_API_URL, 
    timeout: 10000 
});

export const getWBTariffs = async (token: string) => {
    const today = getTodayDate();

    try {
        logger.info(`Отправка запроса к WB API за дату: ${today}`);

        const startTime = Date.now();

        const { data } = await wbClient.get("", {
            params: { date: today },
            headers: { Authorization: token },
        });

        const duration = Date.now() - startTime;

        const responseData = data?.data || data?.response?.data; 
        const warehouseList = responseData?.warehouseList;

        if (!warehouseList) {
            logger.error({ response: data }, "Неверная структура ответа от WB API");
            throw new Error("Invalid response structure from WB API");
        }

        logger.info(`Данные получены успешно: ${warehouseList.length} складов (время: ${duration}ms)`);

        return {
            warehouseList,
            dtNextBox: responseData?.dtNextBox,
            dtTillMax: responseData?.dtTillMax,
        };
    } catch (err: any) {
        const status = err.response?.status;
        const message = err.response?.data?.errorText || err.message;
        logger.error(`Ошибка при запросе к WB API: ${status || ""} ${message}`);
        throw err;
    }
};
