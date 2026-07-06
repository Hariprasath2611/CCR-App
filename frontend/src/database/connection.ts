import * as SQLite from 'expo-sqlite';
import { ENV } from '@config/env';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDBConnection = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  const db = await SQLite.openDatabaseAsync(ENV.DB_NAME);
  dbInstance = db;

  // Run initial migrations / schema creation
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sync_queue (
      id TEXT PRIMARY KEY,
      action_type TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      retry_count INTEGER DEFAULT 0,
      status TEXT DEFAULT 'PENDING'
    );

    CREATE TABLE IF NOT EXISTS timetable (
      id TEXT PRIMARY KEY,
      day_of_week TEXT NOT NULL,
      period INTEGER NOT NULL,
      subject_code TEXT NOT NULL,
      subject_name TEXT NOT NULL,
      class_section TEXT NOT NULL,
      room_no TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS syllabus_progress (
      id TEXT PRIMARY KEY,
      subject_code TEXT NOT NULL,
      unit TEXT NOT NULL,
      topic_id TEXT NOT NULL,
      topic_title TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      completed_date TEXT
    );

    CREATE TABLE IF NOT EXISTS weekly_plans (
      id TEXT PRIMARY KEY,
      academic_week_number INTEGER NOT NULL,
      subject_code TEXT NOT NULL,
      target_topic_ids TEXT NOT NULL,
      status TEXT NOT NULL,
      is_draft INTEGER DEFAULT 1
    );
  `);

  return db;
};
