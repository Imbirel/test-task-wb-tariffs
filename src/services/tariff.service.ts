import env from "#config/env/env.js";
import knex from "#postgres/knex.js";
import { getWBTariffs } from "./wb.service.js";
import { getLogger } from "#config/logger.js";
import { WbResponseSchema, type WbTariffsResponse, type TariffRow } from "#types/tariff.js";
import { getTodayDate } from "#utils/date.js";

const logger = getLogger("tariff-service");

const mapWbResponseToRows = (data: WbTariffsResponse, today: string): TariffRow[] => {
    const { warehouseList, dtNextBox, dtTillMax } = data;
    
    return warehouseList.map((item) => ({
        date: today,
        warehouse_name: item.warehouseName,
        geo_name: item.geoName,
        box_delivery_marketplace_base: item.boxDeliveryMarketplaceBase,
        box_delivery_marketplace_coef_expr: item.boxDeliveryMarketplaceCoefExpr,
        box_delivery_marketplace_liter: item.boxDeliveryMarketplaceLiter,
        box_delivery_base: item.boxDeliveryBase,
        box_delivery_coef_expr: item.boxDeliveryCoefExpr,
        box_delivery_liter: item.boxDeliveryLiter,
        box_storage_base: item.boxStorageBase,
        box_storage_coef_expr: item.boxStorageCoefExpr,
        box_storage_liter: item.boxStorageLiter,
        dt_next_box: dtNextBox || null,
        dt_till_max: dtTillMax || null,
    }));
};

export const fetchAndSaveTariffs = async () => {
    try {
        logger.info("Запрос тарифов из Wildberries API...");
        const rawData = await getWBTariffs(env.WB_API_TOKEN);
        const result = WbResponseSchema.safeParse(rawData);

        if (!result.success) {
            logger.error(`Ошибка валидации WB API: ${result.error.message}`);
            return;
        }

        const today = getTodayDate();
        const rows = mapWbResponseToRows(result.data, today);

        await knex.transaction(async (trx) => {
            await trx("tariffs").insert(rows).onConflict(["date", "warehouse_name"]).merge();
        });

        logger.info(`Успешно сохранено/обновлено ${rows.length} тарифов в БД за ${today}`);
    } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        logger.error(`Ошибка при получении или сохранении тарифов: ${message}`);
    }
};

export const getSortedTariffsFromDb = async (): Promise<TariffRow[]> => {
    const today = getTodayDate();

    return knex("tariffs").where({ date: today }).orderBy("box_delivery_marketplace_coef_expr", "asc");
};
