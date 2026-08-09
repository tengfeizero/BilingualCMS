/**
 * 数据库初始化脚本：npm run db:init
 * 创建全部表结构（含 FTS5 全文搜索）、触发器，并填充基础数据（角色/管理员/设置）。
 */
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import { DB_PATH, sqlite } from "./index";

const UPLOADS_DIR = path.join(process.cwd(), "uploads");

const DDL = `
CREATE TABLE IF NOT EXISTS users (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL UNIQUE,
  username    TEXT NOT NULL UNIQUE,
  password    TEXT NOT NULL,
  role        TEXT NOT NULL DEFAULT 'author',
  avatar      TEXT,
  bio         TEXT,
  status      TEXT NOT NULL DEFAULT 'active',
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS roles (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  permissions TEXT NOT NULL DEFAULT '[]',
  description TEXT
);

CREATE TABLE IF NOT EXISTS categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  slug        TEXT NOT NULL UNIQUE,
  parent_id   INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS tags (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS posts (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  content      TEXT NOT NULL DEFAULT '',
  excerpt      TEXT,
  cover_image  TEXT,
  status       TEXT NOT NULL DEFAULT 'draft',
  type         TEXT NOT NULL DEFAULT 'post',
  category_id  INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  author_id    INTEGER NOT NULL REFERENCES users(id),
  is_pinned    INTEGER NOT NULL DEFAULT 0,
  view_count   INTEGER NOT NULL DEFAULT 0,
  published_at TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_category ON posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_published ON posts(published_at);

CREATE TABLE IF NOT EXISTS post_tags (
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id  INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS post_versions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  post_id    INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  content    TEXT NOT NULL,
  editor_id  INTEGER REFERENCES users(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS media (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  filename      TEXT NOT NULL,
  original_name TEXT NOT NULL,
  url           TEXT NOT NULL,
  mime_type     TEXT NOT NULL,
  size          INTEGER NOT NULL,
  width         INTEGER,
  height        INTEGER,
  thumb_url     TEXT,
  category      TEXT NOT NULL DEFAULT 'image',
  uploader_id   INTEGER REFERENCES users(id),
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES users(id),
  action      TEXT NOT NULL,
  target_type TEXT,
  target_id   INTEGER,
  detail      TEXT,
  ip          TEXT,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS product_categories (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  name_en     TEXT,
  slug        TEXT NOT NULL UNIQUE,
  parent_id   INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
  description TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS products (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  name           TEXT NOT NULL,
  name_en        TEXT,
  slug           TEXT NOT NULL UNIQUE,
  category_id    INTEGER REFERENCES product_categories(id) ON DELETE SET NULL,
  summary        TEXT,
  summary_en     TEXT,
  description    TEXT,
  description_en TEXT,
  spec           TEXT,
  spec_en        TEXT,
  cover_image    TEXT,
  images         TEXT NOT NULL DEFAULT '[]',
  status         TEXT NOT NULL DEFAULT 'draft',
  is_featured    INTEGER NOT NULL DEFAULT 0,
  view_count     INTEGER NOT NULL DEFAULT 0,
  seo_title      TEXT,
  seo_keywords   TEXT,
  created_at     TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at     TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

CREATE TABLE IF NOT EXISTS inquiries (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  whatsapp   TEXT,
  country    TEXT,
  company    TEXT,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  message    TEXT,
  ip         TEXT,
  status     TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);

-- 全文搜索（FTS5 外部内容表，trigram 分词器支持中文检索）
DROP TABLE IF EXISTS posts_fts;
CREATE VIRTUAL TABLE IF NOT EXISTS posts_fts USING fts5(
  title, content, excerpt,
  content='posts', content_rowid='id',
  tokenize='trigram'
);

CREATE TRIGGER IF NOT EXISTS posts_ai AFTER INSERT ON posts BEGIN
  INSERT INTO posts_fts(rowid, title, content, excerpt)
  VALUES (new.id, new.title, new.content, new.excerpt);
END;

CREATE TRIGGER IF NOT EXISTS posts_ad AFTER DELETE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, content, excerpt)
  VALUES ('delete', old.id, old.title, old.content, old.excerpt);
END;

CREATE TRIGGER IF NOT EXISTS posts_au AFTER UPDATE ON posts BEGIN
  INSERT INTO posts_fts(posts_fts, rowid, title, content, excerpt)
  VALUES ('delete', old.id, old.title, old.content, old.excerpt);
  INSERT INTO posts_fts(rowid, title, content, excerpt)
  VALUES (new.id, new.title, new.content, new.excerpt);
END;
`;

const ROLES = [
  {
    name: "super_admin",
    permissions: ["*"],
    description: "超级管理员，拥有全部权限",
  },
  {
    name: "admin",
    permissions: [
      "post:create",
      "post:update",
      "post:delete",
      "post:publish",
      "media:upload",
      "media:delete",
      "category:manage",
      "user:manage",
      "setting:manage",
      "audit:view",
      "product:manage",
      "inquiry:manage",
    ],
    description: "管理员，可管理内容、产品、询盘、媒体、用户与设置",
  },
  {
    name: "editor",
    permissions: ["post:create", "post:update", "post:publish", "media:upload"],
    description: "编辑，可创建、编辑并发布内容",
  },
  {
    name: "author",
    permissions: ["post:create", "post:update", "media:upload"],
    description: "作者，可创建和编辑自己的内容",
  },
];

const DEFAULT_SETTINGS: Record<string, unknown> = {
  site_name: "My Factory",
  site_description: "专业工厂，优质产品，欢迎询盘",
  site_logo: "",
  allow_register: false,
  // 海外独立站扩展设置
  site_name_en: "My Factory",
  site_description_en: "Professional factory, quality products, welcome inquiries",
  front_theme: "light",
  contact_email: "",
  whatsapp_number: "",
  contact_phone: "",
  contact_address: "",
  contact_address_en: "",
  smtp_host: "",
  smtp_port: "",
  smtp_user: "",
  smtp_password: "",
};

function seed() {
  sqlite.exec(DDL);

  // 旧库迁移：为 products 表补充 spec_en 列
  const productCols = sqlite.prepare("PRAGMA table_info(products)").all() as {
    name: string;
  }[];
  if (!productCols.some((c) => c.name === "spec_en")) {
    sqlite.exec("ALTER TABLE products ADD COLUMN spec_en TEXT;");
    console.log("✔ 已迁移：products 表新增 spec_en 列");
  }

  // 重建 FTS 索引（重建虚拟表后需重新填充）
  sqlite.exec("INSERT INTO posts_fts(posts_fts) VALUES('rebuild');");

  // 角色
  const roleCount = sqlite
    .prepare("SELECT COUNT(*) AS c FROM roles")
    .get() as { c: number };
  if (roleCount.c === 0) {
    const insertRole = sqlite.prepare(
      "INSERT INTO roles (name, permissions, description) VALUES (?, ?, ?)",
    );
    for (const r of ROLES) {
      insertRole.run(r.name, JSON.stringify(r.permissions), r.description);
    }
    console.log("✔ 已初始化角色:", ROLES.map((r) => r.name).join(", "));
  }

  // 管理员账号
  const adminCount = sqlite
    .prepare("SELECT COUNT(*) AS c FROM users WHERE role = 'super_admin'")
    .get() as { c: number };
  if (adminCount.c === 0) {
    const email = process.env.ADMIN_EMAIL || "admin@example.com";
    const password = process.env.ADMIN_PASSWORD || "admin123";
    const hash = bcrypt.hashSync(password, 10);
    sqlite
      .prepare(
        "INSERT INTO users (email, username, password, role) VALUES (?, ?, ?, 'super_admin')",
      )
      .run(email, "admin", hash);
    console.log(`✔ 已创建超级管理员: ${email} / ${password}`);
  }

  // 默认设置
  const insertSetting = sqlite.prepare(
    "INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)",
  );
  for (const [key, value] of Object.entries(DEFAULT_SETTINGS)) {
    insertSetting.run(key, JSON.stringify(value));
  }

  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  console.log(`✔ 数据库初始化完成: ${DB_PATH}`);
}

seed();
