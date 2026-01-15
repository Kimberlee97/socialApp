import { getDB } from './connection';

export async function initDB() {
  const db = await getDB();
  
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      author TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    );
  `);
  
  console.log('Database initialized');
}