import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

let db;

export async function getDb() {
  if (db) return db;
  
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sites (
      id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL,
      name TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now')),
      last_deploy_at TEXT,
      total_size_bytes INTEGER DEFAULT 0,
      file_count INTEGER DEFAULT 0,
      bandwidth_bytes_30d INTEGER DEFAULT 0,
      visitors_30d INTEGER DEFAULT 0,
      custom_domain TEXT,
      ssl_active INTEGER DEFAULT 0,
      preview_image TEXT,
      main_file TEXT DEFAULT 'index.html',
      FOREIGN KEY (owner_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS site_files (
      id TEXT PRIMARY KEY,
      site_id TEXT NOT NULL,
      path TEXT NOT NULL,
      original_name TEXT,
      size_bytes INTEGER,
      mime_type TEXT,
      uploaded_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
    );
  `);

  return db;
}
