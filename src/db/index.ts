import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import fs from "node:fs";
import path from "node:path";
import * as schema from "./schema";

const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

export const DB_PATH = path.join(dataDir, "cms.db");

// 全局单例，避免开发热更新时重复打开连接
const globalForDb = globalThis as unknown as {
  sqlite?: Database.Database;
};

export const sqlite: Database.Database =
  globalForDb.sqlite ??
  (() => {
    const db = new Database(DB_PATH);
    db.pragma("journal_mode = WAL");
    db.pragma("foreign_keys = ON");
    db.pragma("busy_timeout = 5000");
    return db;
  })();

if (process.env.NODE_ENV !== "production") {
  globalForDb.sqlite = sqlite;
}

export const db = drizzle(sqlite, { schema });
export type DB = typeof db;
