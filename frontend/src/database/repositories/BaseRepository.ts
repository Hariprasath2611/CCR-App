import { SQLiteDatabase, Transaction } from 'react-native-sqlite-storage';
import { getDBConnection } from '../connection';

export class BaseRepository {
  protected async getDB(): Promise<SQLiteDatabase> {
    return getDBConnection();
  }

  protected executeSql(
    tx: Transaction,
    sql: string,
    params: any[] = []
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      tx.executeSql(
        sql,
        params,
        (_, result) => {
          resolve(result);
        },
        (_, err) => {
          reject(err);
          return false; // Rollback
        }
      );
    });
  }
}
