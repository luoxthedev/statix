import { open } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'path';

async function checkDb() {
    try {
        const dbPath = path.resolve(process.cwd(), 'database.sqlite');
        console.log('Opening DB at:', dbPath);
        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });

        const sites = await db.all('SELECT * FROM sites');
        console.log('Sites found:', sites.length);
        console.log(JSON.stringify(sites, null, 2));

        const users = await db.all('SELECT * FROM users');
        console.log('Users found:', users.length);
        // Don't print passwords
        console.log(users.map(u => ({ id: u.id, email: u.email, name: u.name })));

    } catch (e) {
        console.error('Error:', e);
    }
}

checkDb();
