import { BaseRepository } from './BaseRepository';
import { SQLiteSyncQueueItem } from '../types';

export class SyncQueueRepository extends BaseRepository {
  public async enqueue(actionType: string, payload: any): Promise<void> {
    const db = await this.getDB();
    const id = Math.random().toString(36).substring(2, 15);
    const createdAt = Date.now();
    const payloadStr = JSON.stringify(payload);

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT INTO sync_queue (id, action_type, payload, created_at, retry_count, status) 
           VALUES (?, ?, ?, ?, 0, 'PENDING');`,
          [id, actionType, payloadStr, createdAt],
          () => resolve(),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  public async getPendingItems(): Promise<SQLiteSyncQueueItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM sync_queue WHERE status = 'PENDING' OR status = 'FAILED' ORDER BY created_at ASC;`,
          [],
          (_, results) => {
            const items: SQLiteSyncQueueItem[] = [];
            for (let i = 0; i < results.rows.length; i++) {
              items.push(results.rows.item(i));
            }
            resolve(items);
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  public async updateStatus(id: string, status: string, retryCount: number): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE sync_queue SET status = ?, retry_count = ? WHERE id = ?;`,
          [status, retryCount, id],
          () => resolve(),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  public async remove(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `DELETE FROM sync_queue WHERE id = ?;`,
          [id],
          () => resolve(),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }
}
