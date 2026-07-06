import { BaseRepository } from './BaseRepository';
import { SQLiteTimetableItem } from '../types';

export class TimetableRepository extends BaseRepository {
  public async saveTimetable(slots: SQLiteTimetableItem[]): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        // Clear old cached timetable slots
        tx.executeSql('DELETE FROM timetable;');

        // Batch insert new slots
        slots.forEach((slot) => {
          tx.executeSql(
            `INSERT INTO timetable (id, day_of_week, period, subject_code, subject_name, class_section, room_no)
             VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [
              slot.id,
              slot.day_of_week,
              slot.period,
              slot.subject_code,
              slot.subject_name,
              slot.class_section,
              slot.room_no,
            ]
          );
        });
      },
      (err) => {
        console.error('Failed to save timetable transaction:', err);
        reject(err);
      },
      () => {
        resolve();
      });
    });
  }

  public async getTimetable(): Promise<SQLiteTimetableItem[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM timetable ORDER BY day_of_week, period;',
          [],
          (_, results) => {
            const items: SQLiteTimetableItem[] = [];
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
}
