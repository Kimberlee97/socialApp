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