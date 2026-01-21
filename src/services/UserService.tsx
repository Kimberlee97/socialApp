/**
 * This service encapsulates all user-related database operations.
 * It handles authentication, user creation, and validation, ensuring 
 * consistent data sanitation across the application.
 */

import { getDB } from '../database/connection';
import { User } from '../types/User';

export const UserService = {

  // Validates a username/PIN combination against the database.
  // Automatically trims whitespace from the username to ensure consistent login behavior.
  async login(username: string, pin: string): Promise<any> {
    const db = await getDB();
    const cleanName = username.trim();
    
    const result = await db.getAllAsync<User>(
      'SELECT * FROM users WHERE lower(username) = lower(?) LIMIT 1',
      [cleanName]
    );

    if (result.length > 0) {
      const user = result[0];
      
      if (user.pin.toString() === pin.toString()) {
        return user;
      }
    }
    
    return null; 
  },

  // Checks if a username is already taken in the database.
  // Used primarily during the Sign Up process to enforce uniqueness.
  async usernameExists(username: string): Promise<boolean> {
    const db = await getDB();
    const cleanName = username.trim();

    const result = await db.getAllAsync<User>(
      'SELECT * FROM users WHERE lower(username) = lower(?) LIMIT 1',
      [cleanName]
    );
    return result.length > 0;
  },

  // Determines if a user account is "Local" (created on this device).
  // This is required to authorize Biometric Login features.
  async isLocalUser(username: string): Promise<boolean> {
    const db = await getDB();
    const cleanName = username.trim();

    const result = await db.getAllAsync<any>(
      'SELECT * FROM users WHERE lower(username) = lower(?) AND is_local = 1 LIMIT 1',
      [cleanName]
    );
    return result.length > 0;
  },

  // Creates a new user record in the database.
  // Flags the user as 'is_local = 1' to enable device-specific features like Face ID.
  async createUser(username: string, pin: string) {
    const db = await getDB();
    const cleanName = username.trim();

    await db.runAsync(
      'INSERT INTO users (username, pin, is_local) VALUES (?, ?, 1)',
      [cleanName, pin]
    );
  }
};