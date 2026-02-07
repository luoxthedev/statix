// Shared schema definitions for all database adapters

export const SCHEMA_SQLITE = `
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
`;

export const SCHEMA_MYSQL = [
  `CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE TABLE IF NOT EXISTS sites (
    id VARCHAR(36) PRIMARY KEY,
    owner_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_deploy_at DATETIME,
    total_size_bytes BIGINT DEFAULT 0,
    file_count INT DEFAULT 0,
    bandwidth_bytes_30d BIGINT DEFAULT 0,
    visitors_30d INT DEFAULT 0,
    custom_domain VARCHAR(255),
    ssl_active TINYINT DEFAULT 0,
    preview_image TEXT,
    main_file VARCHAR(255) DEFAULT 'index.html',
    FOREIGN KEY (owner_id) REFERENCES users(id)
  )`,
  `CREATE TABLE IF NOT EXISTS site_files (
    id VARCHAR(36) PRIMARY KEY,
    site_id VARCHAR(36) NOT NULL,
    path TEXT NOT NULL,
    original_name VARCHAR(255),
    size_bytes BIGINT,
    mime_type VARCHAR(255),
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (site_id) REFERENCES sites(id) ON DELETE CASCADE
  )`
];
