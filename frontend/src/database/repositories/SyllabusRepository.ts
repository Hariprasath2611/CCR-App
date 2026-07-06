import { BaseRepository } from './BaseRepository';
import { SQLiteSyllabusNode } from '../types';

export class SyllabusRepository extends BaseRepository {
  public async saveSyllabusNodes(nodes: SQLiteSyllabusNode[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        nodes.forEach((node) => {
          tx.executeSql(
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
        });
      },
      (err) => {
        console.error('Failed to save syllabus transaction:', err);
        reject(err);
      },
      () => {
        resolve();
      });
    });
  }

  public async getSyllabusBySubject(subjectCode: string): Promise<SQLiteSyllabusNode[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM syllabus_progress WHERE subject_code = ? ORDER BY unit, topic_id;',
          [subjectCode],
          (_, results) => {
            const items: SQLiteSyllabusNode[] = [];
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

  public async updateCompletionStatus(
    topicId: string,
    isCompleted: boolean,
    completedDate?: string
  ): Promise<void> {
    const db = await this.getDB();
    const isCompletedInt = isCompleted ? 1 : 0;
    const dateVal = isCompleted ? (completedDate || new Date().toISOString().split('T')[0]) : null;

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `UPDATE syllabus_progress 
           SET is_completed = ?, completed_date = ? 
           WHERE topic_id = ?;`,
          [isCompletedInt, dateVal, topicId],
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
