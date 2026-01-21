/**
 * This file encapsulates all direct database interactions for the 'posts' table.
 * It provides methods to fetch paginated data, count total records, and insert 
 * new posts, keeping SQL queries isolated from the UI logic.
 */

import { Post } from "../types/posts"; 
import { getDB } from "./connection";

export const PostRepositorySql = {

  // Retrieves a subset of posts based on a limit and offset, enabling 
  // infinite scroll features by loading data in small chunks (e.g., 20 at a time)
  async getAll(limit: number = 20, offset: number = 0): Promise<Post[]> {
    const db = await getDB();
    
    const results = await db.getAllAsync<Post>(
      'SELECT * FROM posts ORDER BY id DESC LIMIT ? OFFSET ?',
      [limit, offset]
    );
    
    return results;
  },

  // Returns the total number of entries in the posts table, primarily used 
  // for debugging purposes to verify data seeding and insertion
  async getCount(): Promise<number> {
    const db = await getDB();
    const result = await db.getAllAsync<{ c: number }>('SELECT COUNT(*) as c FROM posts');
    return result[0].c;
  },

  // Inserts a new post into the database with the provided details and 
  // automatically sets the creation timestamp to the current time
  async create(post: Omit<Post, 'id' | 'created_at'>): Promise<void> {
    const db = await getDB();
    
    await db.runAsync(
      `INSERT INTO posts (title, author, description, image, created_at) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        post.title,
        post.author,
        post.description,
        post.image || null, 
        new Date().toISOString()
      ]
    );
  }
};