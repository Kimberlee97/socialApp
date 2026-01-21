/**
 * This file handles the initial setup of the SQLite database.
 * It ensures the database schema is created and populates it with 
 * initial seed data, while also keeping test user credentials in sync.
 */

import { getDB } from './connection';
import seedUsers from '../../assets/data/users.json';
import seedPosts from '../../assets/data/seed.json'; 

interface SeedPost {
  id: number;
  title: string;
  description?: string;
  author: string;
  image?: string;
  created_at?: string;
}

// Main initialization function called on app startup
export async function initDB() {
  const db = await getDB();

  // Define the Users table structure, ensuring it is only created if missing
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      pin TEXT,
      is_local INTEGER DEFAULT 0 -- 0 for JSON users, 1 for Sign Up users
    );
  `);

  // Define the Posts table structure, ensuring it is only created if missing
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      author TEXT NOT NULL,
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log("Checking users from users.json...");
  
  // Specific logic to sync test users from the JSON file into the database
  // If a user is missing, they are added. If they exist, their PIN and permissions 
  // are forced to match the JSON file to prevent lockout during testing.
  for (const user of seedUsers.users) {
    const existing = await db.getAllAsync(
      'SELECT * FROM users WHERE lower(username) = lower(?)', 
      [user.username]
    );

    if (existing.length === 0) {
      console.log(`Adding missing user: ${user.username}`);
      await db.runAsync(
        'INSERT INTO users (username, pin, is_local) VALUES (?, ?, ?)',
        [user.username, user.pin, user.is_local] 
      );
    } else {
      console.log(`Updating permissions & PIN for existing user: ${user.username}`);
      await db.runAsync(
        'UPDATE users SET is_local = ?, pin = ? WHERE lower(username) = lower(?)',
        [user.is_local, user.pin, user.username]
      );
    }
  }

  // Check if the posts table is empty and perform a batch insert of seed data if needed
  const postCount = await db.getAllAsync<{ c: number }>('SELECT COUNT(*) as c FROM posts');
  if (postCount[0].c === 0) {
    console.log("Seeding Posts...");
    
    await db.withTransactionAsync(async () => {
      const batchSize = 50; 
      
      const allPosts = (seedPosts as any).posts as SeedPost[];

      for (let i = 0; i < allPosts.length; i += batchSize) {
        const batch = allPosts.slice(i, i + batchSize);
        
        const placeholders = batch.map(() => '(?, ?, ?, ?)').join(',');
        
        const values = batch.flatMap(post => [
          post.title, 
          post.description || '', 
          post.author, 
          post.image || null
        ]);

        await db.runAsync(
          `INSERT INTO posts (title, description, author, image) VALUES ${placeholders}`,
          values
        );
      }
    });
  }
}