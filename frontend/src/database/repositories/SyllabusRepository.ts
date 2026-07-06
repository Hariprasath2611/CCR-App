import { BaseRepository } from './BaseRepository';
import { SQLiteSyllabusNode } from '../types';

export class SyllabusRepository extends BaseRepository {
  public async saveSyllabusNodes(nodes: SQLiteSyllabusNode[]): Promise<void> {
    const db = await this.getDB();
    await db.withTransactionAsync(async () => {
      for (const node of nodes) {
        await db.runAsync(
          `INSERT OR REPLACE INTO syllabus_progress (id, subject_code, unit, topic_id, topic_title, is_completed, completed_date)
           VALUES (?, ?, ?, ?, ?, ?, ?);`,
          [
            node.id,
            node.subject_code,
            node.unit,
            node.topic_id,
            node.topic_title,
            node.is_completed,
            node.completed_date || null,
          ]
        );
      }
    });
  }

  public async getSyllabusBySubject(subjectCode: string): Promise<SQLiteSyllabusNode[]> {
    const db = await this.getDB();
    return db.getAllAsync<SQLiteSyllabusNode>(
      'SELECT * FROM syllabus_progress WHERE subject_code = ? ORDER BY unit, topic_id;',
      [subjectCode]
    );
  }

  public async updateCompletionStatus(
    topicId: string,
    isCompleted: boolean,
    completedDate?: string
  ): Promise<void> {
    const db = await this.getDB();
    const isCompletedInt = isCompleted ? 1 : 0;
    const dateVal = isCompleted ? (completedDate || new Date().toISOString().split('T')[0]) : null;

    await db.runAsync(
      `UPDATE syllabus_progress 
       SET is_completed = ?, completed_date = ? 
       WHERE topic_id = ?;`,
      [isCompletedInt, dateVal, topicId]
    );
  }
}
