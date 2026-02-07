let supabase;

/**
 * Wrapper that provides the same interface as the sqlite driver
 * (db.get, db.all, db.run, db.exec) on top of the Supabase JS client.
 *
 * Because Supabase exposes a REST / PostgREST API (not raw SQL),
 * we use supabase-js .rpc() or the REST query builder.
 * However, to keep the existing SQL-based codebase working without
 * rewriting every query, we use the Supabase "pg" connection
 * (via the `postgres` module) when available, or fall back to
 * a lightweight SQL executor through the Supabase Management API.
 *
 * The simplest approach that keeps full SQL compatibility is to
 * connect directly to the underlying Postgres database that backs
 * every Supabase project.  The connection string is available in the
 * Supabase dashboard under Settings → Database.
 */

function wrapClient(pgPool) {
  return {
    async get(sql, params = []) {
      const query = convertPlaceholders(sql);
      const res = await pgPool.query(query, params);
      return res.rows[0] || undefined;
    },
    async all(sql, params = []) {
      const query = convertPlaceholders(sql);
      const res = await pgPool.query(query, params);
      return res.rows;
    },
    async run(sql, params = []) {
      const query = convertPlaceholders(sql);
      const res = await pgPool.query(query, params);
      return { changes: res.rowCount };
    },
    async exec(sql) {
      // Execute raw multi-statement SQL
      const cleaned = sql.replace(/datetime\('now'\)/gi, 'NOW()');
      await pgPool.query(cleaned);
    }
  };
}

/** Convert `?` placeholders (sqlite style) to `$1, $2, …` (pg style) */
function convertPlaceholders(sql) {
  let i = 0;
  return sql
    .replace(/datetime\("now"\)/gi, 'NOW()')
    .replace(/datetime\('now'\)/gi, 'NOW()')
    .replace(/\?/g, () => `$${++i}`);
}

const SCHEMA_PG = `
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    avatar TEXT,
    created_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS sites (
    id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL REFERENCES users(id),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_deploy_at TIMESTAMP,
    total_size_bytes BIGINT DEFAULT 0,
    file_count INT DEFAULT 0,
    bandwidth_bytes_30d BIGINT DEFAULT 0,
    visitors_30d INT DEFAULT 0,
    custom_domain TEXT,
    ssl_active INT DEFAULT 0,
    preview_image TEXT,
    main_file TEXT DEFAULT 'index.html'
  );

  CREATE TABLE IF NOT EXISTS site_files (
    id TEXT PRIMARY KEY,
    site_id TEXT NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
    path TEXT NOT NULL,
    original_name TEXT,
    size_bytes BIGINT,
    mime_type TEXT,
    uploaded_at TIMESTAMP DEFAULT NOW()
  );
`;

export async function createSupabaseAdapter(config) {
  if (supabase) return supabase;

  // Dynamic import – only loaded when Supabase adapter is chosen
  const pg = await import('pg');
  const Pool = pg.default?.Pool || pg.Pool;

  const pool = new Pool({
    connectionString: config.supabaseDbUrl,
    ssl: config.supabaseSsl !== false ? { rejectUnauthorized: false } : false,
  });

  // Create tables
  await pool.query(SCHEMA_PG);

  // Migration: add main_file column if missing
  try {
    const res = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'sites' AND column_name = 'main_file'
    `);
    if (res.rows.length === 0) {
      await pool.query("ALTER TABLE sites ADD COLUMN main_file TEXT DEFAULT 'index.html'");
    }
  } catch (err) {
    // Ignore if table doesn't exist yet
  }

  supabase = wrapClient(pool);
  return supabase;
}
