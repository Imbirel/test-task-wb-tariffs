# WB Tariff Tracker & Google Sheets Sync

Сервис для автоматического сбора тарифов Wildberries (короба) с накоплением истории в PostgreSQL и синхронизацией актуальных данных в N Google-таблиц.

## 🚀 Функционал

- Daily Snapshot: Сбор данных каждый час с обновлением записи за текущий день (ON CONFLICT MERGE).
- Data Integrity: Валидация и трансформация типов данных через Zod (строковые коэффициенты WB -> numeric в БД).
- High Performance: Параллельное обновление Google-таблиц с ограничением конкурентности (p-limit).
- Reliability: Автоматические миграции и сидинг при старте в Docker.
- Observability: Структурированное логирование всех этапов работы.

## 🛠 Стек технологий

- Runtime: Node.js (TypeScript, ESM)
- DB: PostgreSQL + Knex.js
- API: Axios, Google APIs v4
- Validation: Zod
- Infrastructure: Docker + Docker Compose

## 📦 Быстрый запуск

### 1. Подготовка окружения

Создайте файл .env на основе .env.example:

```bash
cp .env.example .env
```

Заполните обязательные переменные:

- WB_API_TOKEN: Ваш токен из личного кабинета WB.
- GOOGLE_SERVICE_ACCOUNT_EMAIL: Email сервисного аккаунта.
- GOOGLE_PRIVATE_KEY: Приватный ключ (включая -----BEGIN PRIVATE KEY-----).
- GOOGLE_SHEET_IDS: ID таблиц через запятую.

Важно: Добавьте email сервисного аккаунта в список редакторов (Editor) для каждой Google-таблицы. Лист в таблице должен называться stocks_coefs.

### 2. Запуск в Docker

```bash
docker compose up -d --build
```

При запуске контейнер автоматически:

- Выполнит миграции.
- Проведет сидинг (заполнит ID таблиц из .env).
- Выполнит первичный сбор данных и выгрузку в Google Sheets.
- Запустит планировщик (Cron).

Посмотреть, что всё запустилось успешно:

```bash
docker compose logs -f
```

Так же логи есть в папке logs в корне проекта.

## 📂 Структура проекта

- src/postgres/migrations: Схема БД (таблицы tariffs и spreadsheets).
- src/services/tariff.service.ts: Логика обработки и сохранения тарифов.
- src/services/google.service.ts: Логика синхронизации с Google Sheets.
- src/types/tariff.ts: Единый источник правды для схем Zod и TS-интерфейсов.



