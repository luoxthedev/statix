import { createSqliteAdapter } from './database/sqlite.js';
import { createMysqlAdapter } from './database/mysql.js';
import { createSupabaseAdapter } from './database/supabase.js';

let db;

/**
 * Returns a database connection based on the DB_TYPE environment variable.
 *
 * Supported values for DB_TYPE:
 *   - "sqlite"   (default) – local SQLite file
 *   - "mysql"    – MySQL / MariaDB on a VPS
 *   - "supabase" – Supabase (Postgres) via direct connection string
 *
 * See .env.example for the full list of environment variables.
 */
export async function getDb() {
  if (db) return db;

  const dbType = (process.env.DB_TYPE || 'sqlite').toLowerCase();

  switch (dbType) {
    case 'mysql':
    case 'mariadb':
      db = await createMysqlAdapter({
        mysqlHost: process.env.MYSQL_HOST,
        mysqlPort: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT, 10) : 3306,
        mysqlUser: process.env.MYSQL_USER,
        mysqlPassword: process.env.MYSQL_PASSWORD,
        mysqlDatabase: process.env.MYSQL_DATABASE,
      });
      break;

    case 'supabase':
      db = await createSupabaseAdapter({
        supabaseDbUrl: process.env.SUPABASE_DB_URL,
        supabaseSsl: process.env.SUPABASE_SSL !== 'false',
      });
      break;

    case 'sqlite':
    default:
      db = await createSqliteAdapter({
        sqliteFile: process.env.SQLITE_FILE || './database.sqlite',
      });
      break;
  }

  console.log(`[database] Using ${dbType} adapter`);
  return db;
}
