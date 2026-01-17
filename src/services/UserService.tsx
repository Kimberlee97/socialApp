import { getDB } from '../database/connection';
import { User } from '../types/User';

export const UserService = {

  async login(username: string, pin: string): Promise<boolean> {
    const db = await getDB();
    const result = await db.getAllAsync<User>(
      'SELECT * FROM users WHERE lower(username) = lower(?) AND pin = ? LIMIT 1', 
      [username, pin]
    );
    return result.length > 0;
  },

  async usernameExists(username: string): Promise<boolean> {
    const db = await getDB();
    const result = await db.getAllAsync<User>(
      'SELECT * FROM users WHERE lower(username) = lower(?) LIMIT 1', 
      [username]
    );
    return result.length > 0;
  },

  async createUser(username: string, pin: string) {
    const db = await getDB();
    await db.runAsync(
      'INSERT INTO users (username, pin) VALUES (?, ?)',
      [username, pin]
    );
  }
};