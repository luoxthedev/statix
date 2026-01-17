import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

async function addColumn() {
    try {
        const db = await open({
            filename: './database.sqlite',
            driver: sqlite3.Database
        });

        await db.run("ALTER TABLE sites ADD COLUMN main_file TEXT DEFAULT 'index.html'");
        console.log('✓ Column main_file added successfully');
        await db.close();
    } catch (e) {
        if (e.message && e.message.includes('duplicate column')) {
            console.log('✓ Column main_file already exists');
        } else {
            console.error('Error:', e.message);
        }
    }
}

addColumn();
