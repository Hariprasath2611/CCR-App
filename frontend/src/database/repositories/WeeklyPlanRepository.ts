import { BaseRepository } from './BaseRepository';

export interface SQLiteWeeklyPlan {
  id: string;
  academic_week_number: number;
  subject_code: string;
  target_topic_ids: string; // comma-separated topic IDs
  status: string;
  is_draft: number; // 0 or 1
}

export class WeeklyPlanRepository extends BaseRepository {
  public async savePlanDraft(
    id: string,
    weekNo: number,
    subjectCode: string,
    targetTopicIds: string[],
    status: string,
    isDraft: boolean
  ): Promise<void> {
    const db = await this.getDB();
    const targetTopicsStr = targetTopicIds.join(',');
    const draftVal = isDraft ? 1 : 0;

    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `INSERT OR REPLACE INTO weekly_plans (id, academic_week_number, subject_code, target_topic_ids, status, is_draft)
           VALUES (?, ?, ?, ?, ?, ?);`,
          [id, weekNo, subjectCode, targetTopicsStr, status, draftVal],
          () => resolve(),
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  public async getPlanDraft(subjectCode: string, weekNo: number): Promise<SQLiteWeeklyPlan | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `SELECT * FROM weekly_plans WHERE subject_code = ? AND academic_week_number = ? LIMIT 1;`,
          [subjectCode, weekNo],
          (_, results) => {
            if (results.rows.length > 0) {
              resolve(results.rows.item(0));
            } else {
              resolve(null);
            }
          },
          (_, err) => {
            reject(err);
            return false;
          }
        );
      });
    });
  }

  public async deletePlan(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          `DELETE FROM weekly_plans WHERE id = ?;`,
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
