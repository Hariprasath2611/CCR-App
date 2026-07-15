import { BaseRepository } from './BaseRepository';
import { SQLiteTimetableItem } from '../types';

export class TimetableRepository extends BaseRepository {
  public async saveTimetable(slots: SQLiteTimetableItem[]): Promise<void> {
    const db = await this.getDB();
    await db.withTransactionAsync(async () => {
      // Clear old cached timetable slots
      await db.runAsync('DELETE FROM timetable;');

      // Batch insert new slots
      for (const slot of slots) {
        await db.runAsync(
          `INSERT INTO timetable (id, day_of_week, period, subject_code, subject_name, class_section, room_no, faculty_name)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
          [
            slot.id,
            slot.day_of_week,
            slot.period,
            slot.subject_code,
            slot.subject_name,
            slot.class_section,
            slot.room_no,
            slot.faculty_name || null,
          ]
        );
      }
    });
  }

  public async getTimetable(): Promise<SQLiteTimetableItem[]> {
    const db = await this.getDB();
    return db.getAllAsync<SQLiteTimetableItem>(
      'SELECT * FROM timetable ORDER BY day_of_week, period;'
    );
  }
}
