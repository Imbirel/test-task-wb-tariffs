import env from "#config/env/env.js";
import { Knex } from "knex";

const connection = {
    host: env.POSTGRES_HOST,
    port: env.POSTGRES_PORT,
    database: env.POSTGRES_DB,
    user: env.POSTGRES_USER,
    password: env.POSTGRES_PASSWORD,
};

const knexConfigs: Record<"development" | "production" | "test", Knex.Config> = {
    development: {
        client: "pg",
        connection,
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            stub: 'src/config/knex/migration.stub.js',
            directory: "./src/postgres/migrations",
            tableName: "migrations",
            extension: "ts",
        },
        seeds: {
            stub: 'src/config/knex/seed.stub.js',
            directory: "./src/postgres/seeds",
            extension: "js",
        },
    },
    production: {
        client: "pg",
        connection,
        pool: {
            min: 2,
            max: 10,
        },
        migrations: {
            stub: 'dist/config/knex/migration.stub.js',
            directory: "./dist/postgres/migrations",
            tableName: "migrations",
            extension: "js",
        },
        seeds: {
            stub: 'src/config/knex/seed.stub.js',
            directory: "./dist/postgres/seeds",
            extension: "js",
        },
    },
    test: {
        client: "pg",
        connection: {
            host: env.POSTGRES_HOST,
            port: env.POSTGRES_PORT,
            database: "test_db",
            user: env.POSTGRES_USER,
            password: env.POSTGRES_PASSWORD,
        },
    },
};

export default knexConfigs[env.NODE_ENV];
