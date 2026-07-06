import { openDatabase, SQLiteDatabase } from 'react-native-sqlite-storage';
import { ENV } from '@config/env';

// Enable promise-based API for react-native-sqlite-storage if desired, or use standard callbacks
// SQLite.enablePromise(true);

let dbInstance: SQLiteDatabase | null = null;

export const getDBConnection = async (): Promise<SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  return new Promise((resolve, reject) => {
    const db = openDatabase(
      { name: ENV.DB_NAME, location: 'default' },
      () => {
        dbInstance = db;
        // Run initial migrations / schema creation
        db.transaction((tx) => {
          // Sync Queue Table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS sync_queue (
              id TEXT PRIMARY KEY,
              action_type TEXT NOT NULL,
              payload TEXT NOT NULL,
              created_at INTEGER NOT NULL,
              retry_count INTEGER DEFAULT 0,
              status TEXT DEFAULT 'PENDING'
            );`
          );

          // Timetable Table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS timetable (
              id TEXT PRIMARY KEY,
              day_of_week TEXT NOT NULL,
              period INTEGER NOT NULL,
              subject_code TEXT NOT NULL,
              subject_name TEXT NOT NULL,
              class_section TEXT NOT NULL,
              room_no TEXT NOT NULL
            );`
          );

          // Syllabus Table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS syllabus_progress (
              id TEXT PRIMARY KEY,
              subject_code TEXT NOT NULL,
              unit TEXT NOT NULL,
              topic_id TEXT NOT NULL,
              topic_title TEXT NOT NULL,
              is_completed INTEGER DEFAULT 0,
              completed_date TEXT
            );`
          );

          // Weekly Plans Table
          tx.executeSql(
            `CREATE TABLE IF NOT EXISTS weekly_plans (
              id TEXT PRIMARY KEY,
              academic_week_number INTEGER NOT NULL,
              subject_code TEXT NOT NULL,
              target_topic_ids TEXT NOT NULL,
              status TEXT NOT NULL,
              is_draft INTEGER DEFAULT 1
            );`
          );
        }, 
        (error) => {
          console.error('Database migration/init transaction failed:', error);
          reject(error);
        },
        () => {
          resolve(db);
        });
      },
      (err) => {
        console.error('Failed to open database:', err);
        reject(err);
      }
    );
  });
};
