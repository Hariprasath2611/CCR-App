import { BaseRepository } from './BaseRepository';
import { SQLiteSyncQueueItem } from '../types';

export class SyncQueueRepository extends BaseRepository {
  public async enqueue(actionType: string, payload: any): Promise<void> {
    const db = await this.getDB();
    const id = Math.random().toString(36).substring(2, 15);
    const createdAt = Date.now();
    const payloadStr = JSON.stringify(payload);

    await db.runAsync(
      `INSERT INTO sync_queue (id, action_type, payload, created_at, retry_count, status) 
       VALUES (?, ?, ?, ?, 0, 'PENDING');`,
      [id, actionType, payloadStr, createdAt]
    );
  }

  public async getPendingItems(): Promise<SQLiteSyncQueueItem[]> {
    const db = await this.getDB();
    return db.getAllAsync<SQLiteSyncQueueItem>(
      `SELECT * FROM sync_queue WHERE status = 'PENDING' OR status = 'FAILED' ORDER BY created_at ASC;`
    );
  }

  public async updateStatus(id: string, status: string, retryCount: number): Promise<void> {
    const db = await this.getDB();
    await db.runAsync(
      `UPDATE sync_queue SET status = ?, retry_count = ? WHERE id = ?;`,
      [status, retryCount, id]
    );
  }

  public async remove(id: string): Promise<void> {
    const db = await this.getDB();
    await db.runAsync(
      `DELETE FROM sync_queue WHERE id = ?;`,
      [id]
    );
  }
}
