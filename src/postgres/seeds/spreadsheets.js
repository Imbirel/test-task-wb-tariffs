import env from "#config/env/env.js";

/**
 * @param {import("knex").Knex} knex
 * @returns {Promise<void>}
 */
export async function seed(knex) {
    const ids = env.GOOGLE_SHEET_IDS;

    if (!ids || ids.length === 0) {
        console.warn("GOOGLE_SHEET_IDS is empty, seed skipped");
        return;
    }

    const dataToInsert = ids.map((id) => ({
        spreadsheet_id: id,
    }));

    await knex("spreadsheets").insert(dataToInsert).onConflict("spreadsheet_id").merge();

    const deletedCount = await knex("spreadsheets").whereNotIn("spreadsheet_id", ids).del();

    if (deletedCount > 0) {
        console.log(`[Seed] Removed ${deletedCount} old spreadsheet IDs`);
    }

    console.log(`[Seed] Successfully synced ${ids.length} spreadsheet IDs`);
}
