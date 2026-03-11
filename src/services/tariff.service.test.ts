import { describe, it, expect } from "vitest";
import { mapWbResponseToRows } from "./tariff.service.js";

describe("Tariff Service Mapper", () => {
    it("should correctly transform WB API response to database rows", () => {
        const mockWbData = {
            dtNextBox: "2024-03-20",
            dtTillMax: "2024-03-25",
            warehouseList: [
                {
                    warehouseName: "Коледино",
                    geoName: "Центральный",
                    boxDeliveryBase: 100,
                    boxDeliveryCoefExpr: 1.5,
                    boxDeliveryLiter: 5,
                    boxDeliveryMarketplaceBase: 80,
                    boxDeliveryMarketplaceCoefExpr: 1.2,
                    boxDeliveryMarketplaceLiter: 4,
                    boxStorageBase: 10,
                    boxStorageCoefExpr: 1.1,
                    boxStorageLiter: 0.5,
                },
            ],
        };

        const today = "2024-03-10";

        const rows = mapWbResponseToRows(mockWbData, today);

        expect(rows).toHaveLength(1);
        const row = rows[0];

        expect(row.warehouse_name).toBe("Коледино");
        expect(row.date).toBe(today);
        expect(row.dt_next_box).toBe("2024-03-20");
        expect(typeof row.box_delivery_base).toBe("number");
        expect(row.box_delivery_base).toBe(100);
    });

    it("should handle empty warehouse list", () => {
        const mockEmptyData = {
            dtNextBox: null,
            dtTillMax: null,
            warehouseList: [],
        };
        const rows = mapWbResponseToRows(mockEmptyData, "2024-03-10");
        expect(rows).toHaveLength(0);
    });
});
