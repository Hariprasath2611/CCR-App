import * as SQLite from 'expo-sqlite';
import { getDBConnection } from '../connection';

export class BaseRepository {
  protected async getDB(): Promise<SQLite.SQLiteDatabase> {
    return getDBConnection();
  }
}
