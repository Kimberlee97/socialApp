/*
import { getDB } from './connection';
import { Post } from '../types/posts';
import seedData from '../../assets/data/seed.json'; 

export async function initDB() {
  const db = await getDB();

  // Create Table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      author TEXT NOT NULL,
      description TEXT, 
      image TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // Check if the database is empty
  const result = await db.getAllAsync<{ count: number }>('SELECT COUNT(*) as count FROM posts');

  if (result[0].count === 0) {
    console.log("Seeding Database in Batches...");
    
    const posts = (seedData as any).posts;
    const BATCH_SIZE = 50; // Insert 50 posts at a time

    await db.withTransactionAsync(async () => {
      for (let i = 0; i < posts.length; i += BATCH_SIZE) {
        // 1. Slice a chunk of posts
        const batch = posts.slice(i, i + BATCH_SIZE);
        
        // 2. Create placeholders (?, ?, ?, ?) for each post
        const placeholders = batch.map(() => '(?, ?, ?, ?)').join(',');
        
        // 3. Flatten the data into a single array
        const values = batch.flatMap((post: Post) => [
          post.title,
          post.author,
          post.description ?? null,
          post.image ?? null
        ]);

        // 4. Run one command for 50 posts
        await db.runAsync(
          `INSERT INTO posts (title, author, description, image) VALUES ${placeholders}`,
          values
        );
      }
    });

    console.log("Database Seeded Instantly!");
  } else {
    console.log("Database ready.");
  }
}
*/

import { getDB } from './connection';
import seedUsers from '../../assets/data/users.json';
import seedPosts from '../../assets/data/seed.json'; 

export async function initDB() {
  const db = await getDB();

  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE,
      pin TEXT,
      is_local INTEGER DEFAULT 0 -- 0 for JSON users, 1 for Sign Up users
    );
  `);

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
  
  for (const user of seedUsers.users) {
    const existing = await db.getAllAsync(
      'SELECT * FROM users WHERE lower(username) = lower(?)', 
      [user.username]
    );

    if (existing.length === 0) {
      console.log(`Adding missing user: ${user.username}`);
      await db.runAsync(
        'INSERT INTO users (username, pin) VALUES (?, ?)',
        [user.username, user.pin]
      );
    }
  }

  const postCount = await db.getAllAsync<{ c: number }>('SELECT COUNT(*) as c FROM posts');
  if (postCount[0].c === 0) {
    console.log("Seeding Posts...");
    await db.withTransactionAsync(async () => {
      const batchSize = 50; 
      for (let i = 0; i < seedPosts.posts.length; i += batchSize) {
        const batch = seedPosts.posts.slice(i, i + batchSize);
        const placeholders = batch.map(() => '(?, ?, ?, ?)').join(',');
        const values = batch.flatMap(post => [
          post.title, post.description || '', post.author, post.image || null
        ]);
        await db.runAsync(
          `INSERT INTO posts (title, description, author, image) VALUES ${placeholders}`,
          values
        );
      }
    });
  }
}