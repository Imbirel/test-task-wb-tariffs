import { z } from "zod";

const formatDate = (val: string | null | undefined) => {
    if (!val) return null;
    const date = new Date(val);
    return isNaN(date.getTime()) ? null : date.toLocaleDateString("en-CA");
};

const wbNumber = z.preprocess((val) => {
    if (typeof val === "string") return parseFloat(val.replace(",", ".")) || 0;
    return val;
}, z.coerce.number().default(0));

export const WbTariffSchema = z.object({
    warehouseName: z.string(),
    geoName: z.string().nullable().default(""),
    boxDeliveryBase: wbNumber,
    boxDeliveryCoefExpr: wbNumber,
    boxDeliveryLiter: wbNumber,
    boxDeliveryMarketplaceBase: wbNumber,
    boxDeliveryMarketplaceCoefExpr: wbNumber,
    boxDeliveryMarketplaceLiter: wbNumber,
    boxStorageBase: wbNumber,
    boxStorageCoefExpr: wbNumber,
    boxStorageLiter: wbNumber,
});

export const WbResponseSchema = z.object({
    dtNextBox: z.string().nullable().optional().transform(formatDate),
    dtTillMax: z.string().nullable().optional().transform(formatDate),
    warehouseList: z.array(WbTariffSchema),
});

export type WbWarehouseTariff = z.infer<typeof WbTariffSchema>;
export type WbTariffsResponse = z.infer<typeof WbResponseSchema>;

export interface TariffRow {
    id?: number;
    date: string;
    warehouse_name: string;
    geo_name: string | null;
    box_delivery_base: number;
    box_delivery_coef_expr: number;
    box_delivery_liter: number;
    box_delivery_marketplace_base: number;
    box_delivery_marketplace_coef_expr: number;
    box_delivery_marketplace_liter: number;
    box_storage_base: number;
    box_storage_coef_expr: number;
    box_storage_liter: number;
    dt_next_box: string | null;
    dt_till_max: string | null;
    fetched_at?: Date;
}
