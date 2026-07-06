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

    await db.runAsync(
      `INSERT OR REPLACE INTO weekly_plans (id, academic_week_number, subject_code, target_topic_ids, status, is_draft)
       VALUES (?, ?, ?, ?, ?, ?);`,
      [id, weekNo, subjectCode, targetTopicsStr, status, draftVal]
    );
  }

  public async getPlanDraft(subjectCode: string, weekNo: number): Promise<SQLiteWeeklyPlan | null> {
    const db = await this.getDB();
    const result = await db.getFirstAsync<SQLiteWeeklyPlan>(
      `SELECT * FROM weekly_plans WHERE subject_code = ? AND academic_week_number = ? LIMIT 1;`,
      [subjectCode, weekNo]
    );
    return result;
  }

  public async deletePlan(id: string): Promise<void> {
    const db = await this.getDB();
    await db.runAsync(
      `DELETE FROM weekly_plans WHERE id = ?;`,
      [id]
    );
  }
}
