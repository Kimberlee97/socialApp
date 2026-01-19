import { Post } from "../types/posts"; 
import { getDB } from "./connection";

export const PostRepositorySql = {
  // Fetch all posts
  async getAll(): Promise<Post[]> {
    const db = await getDB();
    const results = await db.getAllAsync<Post>('SELECT * FROM posts ORDER BY id DESC');
    return results;
  },

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