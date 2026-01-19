import { getDB } from '../database/connection';
import { User } from '../types/User';

export const UserService = {

  async login(username: string, pin: string): Promise<any> {
    const db = await getDB();
    
    const result = await db.getAllAsync<User>(
      'SELECT * FROM users WHERE lower(username) = lower(?) LIMIT 1',
      [username]
    );

    if (result.length > 0) {
      const user = result[0];
      
      if (user.pin.toString() === pin.toString()) {
        return user;
      }
    }
    
    return null; 
  },

  async usernameExists(username: string): Promise<boolean> {
    const db = await getDB();
    const result = await db.getAllAsync<User>(
      'SELECT * FROM users WHERE lower(username) = lower(?) LIMIT 1',
      [username]
    );
    return result.length > 0;
  },

  async isLocalUser(username: string): Promise<boolean> {
    const db = await getDB();
    const result = await db.getAllAsync<any>(
      'SELECT * FROM users WHERE lower(username) = lower(?) AND is_local = 1 LIMIT 1',
      [username]
    );
    return result.length > 0;
  },

  async createUser(username: string, pin: string) {
    const db = await getDB();
    await db.runAsync(
      'INSERT INTO users (username, pin, is_local) VALUES (?, ?, 1)',
      [username, pin]
    );
  }
};