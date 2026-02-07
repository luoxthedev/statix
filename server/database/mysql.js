import { SCHEMA_MYSQL } from './schema.js';

let pool;

/**
 * Wrapper that provides the same interface as the sqlite driver
 * (db.get, db.all, db.run, db.exec) on top of mysql2/promise pool.
 */
function wrapPool(mysqlPool) {
  return {
    async get(sql, params = []) {
      const query = sql.replace(/datetime\("now"\)/gi, 'NOW()');
      const [rows] = await mysqlPool.execute(query, params);
      return rows[0] || undefined;
    },
    async all(sql, params = []) {
      const query = sql.replace(/datetime\("now"\)/gi, 'NOW()');
      const [rows] = await mysqlPool.execute(query, params);
      return rows;
    },
    async run(sql, params = []) {
      const query = sql.replace(/datetime\("now"\)/gi, 'NOW()');
      const [result] = await mysqlPool.execute(query, params);
      return { changes: result.affectedRows, lastID: result.insertId };
    },
    async exec(sql) {
      // exec can contain multiple statements – split by semicolons
      const statements = sql.split(';').map(s => s.trim()).filter(Boolean);
      for (const stmt of statements) {
        await mysqlPool.execute(stmt.replace(/datetime\('now'\)/gi, 'NOW()'));
      }
    }
  };
}

export async function createMysqlAdapter(config) {
  if (pool) return wrapPool(pool);

  // Dynamic import so the package is only required when this adapter is used
  const mysql = await import('mysql2/promise');

  pool = mysql.createPool({
    host: config.mysqlHost || '127.0.0.1',
    port: config.mysqlPort || 3306,
    user: config.mysqlUser || 'root',
    password: config.mysqlPassword || '',
    database: config.mysqlDatabase || 'statix',
    waitForConnections: true,
    connectionLimit: 10,
  });

  // Create tables
  for (const stmt of SCHEMA_MYSQL) {
    await pool.execute(stmt);
  }

  // Migration: add main_file column if missing
  try {
    const [columns] = await pool.execute(`SHOW COLUMNS FROM sites LIKE 'main_file'`);
    if (columns.length === 0) {
      await pool.execute("ALTER TABLE sites ADD COLUMN main_file VARCHAR(255) DEFAULT 'index.html'");
    }
  } catch (err) {
    // Table might not exist yet on first run – ignore
  }

  return wrapPool(pool);
}
