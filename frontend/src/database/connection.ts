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

  // Database Seeding for Syllabus Progress (Topics)
  try {
    const countResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM syllabus_progress;');
    if (countResult && countResult.count === 0) {
      await db.withTransactionAsync(async () => {
        const seedNodes = [
          // CS8501 - Theory of Computation
          { id: '1', subject_code: 'CS8501', unit: 'Unit 1', topic_id: '1.1', topic_title: 'Finite Automata (DFA & NFA)' },
          { id: '2', subject_code: 'CS8501', unit: 'Unit 2', topic_id: '1.2', topic_title: 'Regular Expressions & Languages' },
          { id: '3', subject_code: 'CS8501', unit: 'Unit 3', topic_id: '1.3', topic_title: 'Context Free Grammars & Ambiguity' },
          { id: '4', subject_code: 'CS8501', unit: 'Unit 4', topic_id: '1.4', topic_title: 'Pushdown Automata (PDA)' },
          { id: '5', subject_code: 'CS8501', unit: 'Unit 5', topic_id: '1.5', topic_title: 'Turing Machines & Decidability' },
          
          // CS8502 - Database Systems
          { id: '6', subject_code: 'CS8502', unit: 'Unit 1', topic_id: 'db1', topic_title: 'Relational Model & ER Diagrams' },
          { id: '7', subject_code: 'CS8502', unit: 'Unit 2', topic_id: 'db2', topic_title: 'SQL DDL, DML, and Join Queries' },
          { id: '8', subject_code: 'CS8502', unit: 'Unit 3', topic_id: 'db3', topic_title: 'Normalization (1NF, 2NF, 3NF, BCNF)' },
          { id: '9', subject_code: 'CS8502', unit: 'Unit 4', topic_id: 'db4', topic_title: 'Transactions, ACID & Concurrency Control' },
          { id: '10', subject_code: 'CS8502', unit: 'Unit 5', topic_id: 'db5', topic_title: 'NoSQL Architectures & Indexing' },
          
          // CS8503 - Computer Networks
          { id: '11', subject_code: 'CS8503', unit: 'Unit 1', topic_id: 'cn1', topic_title: 'OSI & TCP/IP Network Models' },
          { id: '12', subject_code: 'CS8503', unit: 'Unit 2', topic_id: 'cn2', topic_title: 'IPv4/IPv6 Routing & Subnetting' },
          { id: '13', subject_code: 'CS8503', unit: 'Unit 3', topic_id: 'cn3', topic_title: 'TCP Flow Control & Congestion Avoidance' },
          { id: '14', subject_code: 'CS8503', unit: 'Unit 4', topic_id: 'cn4', topic_title: 'Application Protocols (HTTP, DNS, SMTP)' },
          { id: '15', subject_code: 'CS8503', unit: 'Unit 5', topic_id: 'cn5', topic_title: 'Network Cryptography & Firewalls' },
          
          // CS8504 - OS Principles
          { id: '16', subject_code: 'CS8504', unit: 'Unit 1', topic_id: 'os1', topic_title: 'Process Management & Multithreading' },
          { id: '17', subject_code: 'CS8504', unit: 'Unit 2', topic_id: 'os2', topic_title: 'CPU Scheduling (FCFS, SJF, RR)' },
          { id: '18', subject_code: 'CS8504', unit: 'Unit 3', topic_id: 'os3', topic_title: 'Semaphore Synchronization & Deadlocks' },
          { id: '19', subject_code: 'CS8504', unit: 'Unit 4', topic_id: 'os4', topic_title: 'Paging, Segmentation & Page Replacement' },
          { id: '20', subject_code: 'CS8504', unit: 'Unit 5', topic_id: 'os5', topic_title: 'File System & Disk I/O Scheduling' },
        ];

        for (const node of seedNodes) {
          await db.runAsync(
            `INSERT OR IGNORE INTO syllabus_progress (id, subject_code, unit, topic_id, topic_title, is_completed)
             VALUES (?, ?, ?, ?, ?, 0);`,
            [node.id, node.subject_code, node.unit, node.topic_id, node.topic_title]
          );
        }
      });
      console.log('Syllabus data successfully seeded.');
    }
  } catch (err) {
    console.error('Error seeding syllabus:', err);
  }

  // Database Seeding for Timetable
  try {
    const timetableCountResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM timetable;');
    if (timetableCountResult && timetableCountResult.count === 0) {
      await db.withTransactionAsync(async () => {
        const seedSlots = [
          // Monday
          { id: 't1', day_of_week: 'Monday', period: 1, subject_code: 'CS8501', subject_name: 'Theory of Computation', class_section: 'CSE-B', room_no: 'LH-302' },
          { id: 't2', day_of_week: 'Monday', period: 3, subject_code: 'CS8502', subject_name: 'Database Systems', class_section: 'CSE-B', room_no: 'LH-303' },
          { id: 't3', day_of_week: 'Monday', period: 5, subject_code: 'CS8503', subject_name: 'Computer Networks', class_section: 'CSE-B', room_no: 'LH-201' },
          // Tuesday
          { id: 't4', day_of_week: 'Tuesday', period: 2, subject_code: 'CS8502', subject_name: 'Database Systems', class_section: 'CSE-B', room_no: 'LH-303' },
          { id: 't5', day_of_week: 'Tuesday', period: 4, subject_code: 'CS8504', subject_name: 'OS Principles', class_section: 'CSE-B', room_no: 'Lab 3' },
          { id: 't6', day_of_week: 'Tuesday', period: 6, subject_code: 'CS8501', subject_name: 'Theory of Computation', class_section: 'CSE-B', room_no: 'LH-302' },
          // Wednesday
          { id: 't7', day_of_week: 'Wednesday', period: 1, subject_code: 'CS8503', subject_name: 'Computer Networks', class_section: 'CSE-B', room_no: 'LH-201' },
          { id: 't8', day_of_week: 'Wednesday', period: 3, subject_code: 'CS8504', subject_name: 'OS Principles', class_section: 'CSE-B', room_no: 'Lab 3' },
          { id: 't9', day_of_week: 'Wednesday', period: 5, subject_code: 'CS8502', subject_name: 'Database Systems', class_section: 'CSE-B', room_no: 'LH-303' },
          // Thursday
          { id: 't10', day_of_week: 'Thursday', period: 2, subject_code: 'CS8501', subject_name: 'Theory of Computation', class_section: 'CSE-B', room_no: 'LH-302' },
          { id: 't11', day_of_week: 'Thursday', period: 4, subject_code: 'CS8503', subject_name: 'Computer Networks', class_section: 'CSE-B', room_no: 'LH-201' },
          { id: 't12', day_of_week: 'Thursday', period: 6, subject_code: 'CS8504', subject_name: 'OS Principles', class_section: 'CSE-B', room_no: 'Lab 3' },
          // Friday
          { id: 't13', day_of_week: 'Friday', period: 1, subject_code: 'CS8504', subject_name: 'OS Principles', class_section: 'CSE-B', room_no: 'Lab 3' },
          { id: 't14', day_of_week: 'Friday', period: 3, subject_code: 'CS8501', subject_name: 'Theory of Computation', class_section: 'CSE-B', room_no: 'LH-302' },
          { id: 't15', day_of_week: 'Friday', period: 5, subject_code: 'CS8503', subject_name: 'Computer Networks', class_section: 'CSE-B', room_no: 'LH-201' },
        ];

        for (const slot of seedSlots) {
          await db.runAsync(
            `INSERT OR IGNORE INTO timetable (id, day_of_week, period, subject_code, subject_name, class_section, room_no)
             VALUES (?, ?, ?, ?, ?, ?, ?);`,
            [slot.id, slot.day_of_week, slot.period, slot.subject_code, slot.subject_name, slot.class_section, slot.room_no]
          );
        }
      });
      console.log('Timetable data successfully seeded.');
    }
  } catch (err) {
    console.error('Error seeding timetable:', err);
  }

  return db;
};
