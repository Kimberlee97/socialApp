import * as SQLite from 'expo-sqlite';

export const getDB = async () => {
  return await SQLite.openDatabaseAsync('social.db');
};