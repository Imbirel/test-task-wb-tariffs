import _knex from "knex";
import knexConfig from "#config/knex/knexfile.js";
import pg from "pg";
import { getLogger } from "#config/logger.js";

const logger = getLogger("database");

pg.types.setTypeParser(1700, (val) => parseFloat(val));

const knex = _knex(knexConfig);

function logMigrationResults(action: string, result: [number, string[]]) {
    const [batch, migrations] = result;
    if (migrations.length === 0) {
        logger.info(["latest", "up"].includes(action) ? "All migrations are up to date" : "All migrations have been rolled back");
        return;
    }
    logger.info(`Batch ${batch} ${["latest", "up"].includes(action) ? "run" : "rolled back"} the following migrations:`);
    migrations.forEach((m) => logger.info("- " + m));
}

function logMigrationList(list: [{ name: string }[], { file: string }[]]) {
    const [completed, pending] = list;
    logger.info(`Found ${completed.length} Completed Migration file/files:`);
    completed.forEach((m) => logger.info("- " + m.name));

    logger.info(`Found ${pending.length} Pending Migration file/files:`);
    pending.forEach((m) => logger.info("- " + m.file));
}

function logSeedRun(result: [string[]]) {
    const [seeds] = result;
    if (!seeds || seeds.length === 0) {
        return logger.info("No seeds to run");
    }
    logger.info(`Successfully run ${seeds.length} seed files:`);
    seeds.forEach((s) => logger.info("- " + (s?.split(/[/\\]/).pop() || s)));
}

function logSeedMake(name: string) {
    logger.info(`Created seed: ${name.split(/[/\\]/).pop()}`);
}

export const migrate = {
    latest: async () => {
        try {
            logMigrationResults("latest", await knex.migrate.latest());
        } catch (err: any) {
            logger.error(`Migration (latest) failed: ${err.message}`);
            throw err;
        }
    },
    rollback: async () => {
        logMigrationResults("rollback", await knex.migrate.rollback());
    },
    down: async (name?: string) => {
        logMigrationResults("down", await knex.migrate.down({ name }));
    },
    up: async (name?: string) => {
        logMigrationResults("up", await knex.migrate.up({ name }));
    },
    list: async () => {
        logMigrationList(await knex.migrate.list());
    },
    make: async (name: string) => {
        if (!name) throw new Error("Please provide a migration name");
        const path = await knex.migrate.make(name, { extension: "js" });
        logger.info(`Created migration: ${path}`);
    },
};

export const seed = {
    run: async () => {
        try {
            logSeedRun(await knex.seed.run());
        } catch (err: any) {
            logger.error(`Seeding failed: ${err.message}`);
            throw err;
        }
    },
    make: async (name: string) => {
        if (!name) throw new Error("Please provide a seed name");
        logSeedMake(await knex.seed.make(name));
    },
};

export default knex;
