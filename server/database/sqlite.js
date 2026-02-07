import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { SCHEMA_SQLITE } from './schema.js';

let db;

export async function createSqliteAdapter(config) {
  if (db) return db;

  db = await open({
    filename: config.sqliteFile || './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec('PRAGMA foreign_keys = ON;');
  await db.exec(SCHEMA_SQLITE);

  // Migration: add main_file column if missing
  const siteColumns = await db.all('PRAGMA table_info(sites)');
  const hasMainFile = siteColumns.some((col) => col.name === 'main_file');
  if (!hasMainFile) {
    await db.run("ALTER TABLE sites ADD COLUMN main_file TEXT DEFAULT 'index.html'");
  }

  return db;
}
