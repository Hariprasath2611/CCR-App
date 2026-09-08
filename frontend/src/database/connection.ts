import * as SQLite from 'expo-sqlite';
import { ENV } from '@config/env';

let dbInstance: SQLite.SQLiteDatabase | null = null;

export const getDBConnection = async (): Promise<SQLite.SQLiteDatabase> => {
  if (dbInstance) {
    return dbInstance;
  }

  const db = await SQLite.openDatabaseAsync(ENV.DB_NAME);
  dbInstance = db;

  // Check if faculty_name column exists in timetable table, if not, drop it to recreate it with the correct schema
  try {
    await db.runAsync('SELECT faculty_name FROM timetable LIMIT 1;');
  } catch (e) {
    console.log('Migrating timetable table to add faculty_name column...');
    await db.runAsync('DROP TABLE IF EXISTS timetable;');
  }

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
      room_no TEXT NOT NULL,
      faculty_name TEXT
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

  // Clear old offline mock data to reseed with the user's specific subjects if found
  try {
    const checkOld = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM syllabus_progress WHERE subject_code = 'CS8501';");
    if (checkOld && checkOld.count > 0) {
      console.log('Clearing old offline mock data...');
      await db.runAsync('DELETE FROM syllabus_progress;');
      await db.runAsync('DELETE FROM timetable;');
      await db.runAsync('DELETE FROM weekly_plans;');
    }

    const checkNull = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM timetable WHERE faculty_name IS NULL OR faculty_name = '';");
    if (checkNull && checkNull.count > 0) {
      console.log('Clearing timetable to add faculty names...');
      await db.runAsync('DELETE FROM timetable;');
    }

    const checkNewSyllabus = await db.getFirstAsync<{ count: number }>("SELECT COUNT(*) as count FROM syllabus_progress WHERE subject_code = 'CS3591';");
    if (!checkNewSyllabus || checkNewSyllabus.count === 0) {
      console.log('Clearing old syllabus progress to seed new subjects...');
      await db.runAsync('DELETE FROM syllabus_progress;');
      await db.runAsync('DELETE FROM timetable;');
      await db.runAsync('DELETE FROM weekly_plans;');
    }
  } catch (e) {
    console.error('Error checking null faculty_name or old database:', e);
  }

  // Database Seeding for Syllabus Progress (Topics)
  try {
    const countResult = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM syllabus_progress;');
    if (countResult && countResult.count === 0) {
      await db.withTransactionAsync(async () => {
        const seedNodes = [
          // CS3591 - Computer Networks
          { id: '1', subject_code: 'CS3591', unit: 'Unit 1', topic_id: 'cs3591_1', topic_title: 'Finite Automata & Physical Layer' },
          { id: '2', subject_code: 'CS3591', unit: 'Unit 2', topic_id: 'cs3591_2', topic_title: 'Data Link Layer & Media Access Control' },
          { id: '3', subject_code: 'CS3591', unit: 'Unit 3', topic_id: 'cs3591_3', topic_title: 'Network Layer Routing & IP Protocols' },
          { id: '4', subject_code: 'CS3591', unit: 'Unit 4', topic_id: 'cs3591_4', topic_title: 'Transport Layer TCP & UDP Congestion' },
          { id: '5', subject_code: 'CS3591', unit: 'Unit 5', topic_id: 'cs3591_5', topic_title: 'Application Protocols HTTP, DNS, SMTP' },

          // CS3501 - Compiler Design
          { id: '6', subject_code: 'CS3501', unit: 'Unit 1', topic_id: 'cs3501_1', topic_title: 'Introduction & Lexical Analysis' },
          { id: '7', subject_code: 'CS3501', unit: 'Unit 2', topic_id: 'cs3501_2', topic_title: 'Syntax Analysis & Parsing Algorithms' },
          { id: '8', subject_code: 'CS3501', unit: 'Unit 3', topic_id: 'cs3501_3', topic_title: 'Syntax-Directed Translation Schemes' },
          { id: '9', subject_code: 'CS3501', unit: 'Unit 4', topic_id: 'cs3501_4', topic_title: 'Intermediate Code & Runtime Storage' },
          { id: '10', subject_code: 'CS3501', unit: 'Unit 5', topic_id: 'cs3501_5', topic_title: 'Code Generation & Local Optimization' },

          // CB3491 - Cryptography and Cyber Security
          { id: '11', subject_code: 'CB3491', unit: 'Unit 1', topic_id: 'cb3491_1', topic_title: 'Classical Ciphers & Block Encryption' },
          { id: '12', subject_code: 'CB3491', unit: 'Unit 2', topic_id: 'cb3491_2', topic_title: 'Public Key Encryption RSA & ECC' },
          { id: '13', subject_code: 'CB3491', unit: 'Unit 3', topic_id: 'cb3491_3', topic_title: 'Hash Functions, Message Authentication' },
          { id: '14', subject_code: 'CB3491', unit: 'Unit 4', topic_id: 'cb3491_4', topic_title: 'Digital Signatures & Mutual Trust' },
          { id: '15', subject_code: 'CB3491', unit: 'Unit 5', topic_id: 'cb3491_5', topic_title: 'Firewalls, Intrusion Systems & Cyber Law' },

          // CS3551 - Distributed Computing
          { id: '16', subject_code: 'CS3551', unit: 'Unit 1', topic_id: 'cs3551_1', topic_title: 'Foundation Models & Distributed Systems' },
          { id: '17', subject_code: 'CS3551', unit: 'Unit 2', topic_id: 'cs3551_2', topic_title: 'Interprocess Communication & RPC Engines' },
          { id: '18', subject_code: 'CS3551', unit: 'Unit 3', topic_id: 'cs3551_3', topic_title: 'Coordination, Mutual Exclusion & Consensus' },
          { id: '19', subject_code: 'CS3551', unit: 'Unit 4', topic_id: 'cs3551_4', topic_title: 'Consistency Models & Active Replication' },
          { id: '20', subject_code: 'CS3551', unit: 'Unit 5', topic_id: 'cs3551_5', topic_title: 'Fault Tolerance Recovery & Virtualization' },

          // CCS375 - Web Technologies
          { id: '21', subject_code: 'CCS375', unit: 'Unit 1', topic_id: 'ccs375_1', topic_title: 'Markup HTML5, Visual Styling & CSS3' },
          { id: '22', subject_code: 'CCS375', unit: 'Unit 2', topic_id: 'ccs375_2', topic_title: 'Client Scripting JS & DOM Architecture' },
          { id: '23', subject_code: 'CCS375', unit: 'Unit 3', topic_id: 'ccs375_3', topic_title: 'Server Execution Engines Node & Servlets' },
          { id: '24', subject_code: 'CCS375', unit: 'Unit 4', topic_id: 'ccs375_4', topic_title: 'Database Connection & Persistent Engines' },
          { id: '25', subject_code: 'CCS375', unit: 'Unit 5', topic_id: 'ccs375_5', topic_title: 'AJAX Communication & XML Web Services' },

          // CCS370 - UI and UX Design (Detailed)
          // Unit 1
          { id: 'ccs370_u1_1', subject_code: 'CCS370', unit: 'Unit 1', topic_id: 'ccs370_u1_t1', topic_title: 'UI vs. UX Design' },
          { id: 'ccs370_u1_2', subject_code: 'CCS370', unit: 'Unit 1', topic_id: 'ccs370_u1_t2', topic_title: 'Core Stages of Design Thinking' },
          { id: 'ccs370_u1_3', subject_code: 'CCS370', unit: 'Unit 1', topic_id: 'ccs370_u1_t3', topic_title: 'Divergent and Convergent Thinking' },
          { id: 'ccs370_u1_4', subject_code: 'CCS370', unit: 'Unit 1', topic_id: 'ccs370_u1_t4', topic_title: 'Brainstorming and Game storming' },
          { id: 'ccs370_u1_5', subject_code: 'CCS370', unit: 'Unit 1', topic_id: 'ccs370_u1_t5', topic_title: 'Observational Empathy' },
          // Unit 2
          { id: 'ccs370_u2_1', subject_code: 'CCS370', unit: 'Unit 2', topic_id: 'ccs370_u2_t1', topic_title: 'Visual and UI Principles' },
          { id: 'ccs370_u2_2', subject_code: 'CCS370', unit: 'Unit 2', topic_id: 'ccs370_u2_t2', topic_title: 'UI Elements and Patterns' },
          { id: 'ccs370_u2_3', subject_code: 'CCS370', unit: 'Unit 2', topic_id: 'ccs370_u2_t3', topic_title: 'Interaction Behaviors and Principles' },
          { id: 'ccs370_u2_4', subject_code: 'CCS370', unit: 'Unit 2', topic_id: 'ccs370_u2_t4', topic_title: 'Branding' },
          { id: 'ccs370_u2_5', subject_code: 'CCS370', unit: 'Unit 2', topic_id: 'ccs370_u2_t5', topic_title: 'Style Guides' },
          // Unit 3
          { id: 'ccs370_u3_1', subject_code: 'CCS370', unit: 'Unit 3', topic_id: 'ccs370_u3_t1', topic_title: 'Introduction to User Experience' },
          { id: 'ccs370_u3_2', subject_code: 'CCS370', unit: 'Unit 3', topic_id: 'ccs370_u3_t2', topic_title: 'Why You Should Care about User Experience' },
          { id: 'ccs370_u3_3', subject_code: 'CCS370', unit: 'Unit 3', topic_id: 'ccs370_u3_t3', topic_title: 'Understanding User Experience' },
          { id: 'ccs370_u3_4', subject_code: 'CCS370', unit: 'Unit 3', topic_id: 'ccs370_u3_t4', topic_title: 'Defining the UX Design Process and its Methodology' },
          { id: 'ccs370_u3_5', subject_code: 'CCS370', unit: 'Unit 3', topic_id: 'ccs370_u3_t5', topic_title: 'Research in User Experience Design' },
          { id: 'ccs370_u3_6', subject_code: 'CCS370', unit: 'Unit 3', topic_id: 'ccs370_u3_t6', topic_title: 'Tools and Method used for Research' },
          { id: 'ccs370_u3_7', subject_code: 'CCS370', unit: 'Unit 3', topic_id: 'ccs370_u3_t7', topic_title: 'User Needs and its Goals' },
          { id: 'ccs370_u3_8', subject_code: 'CCS370', unit: 'Unit 3', topic_id: 'ccs370_u3_t8', topic_title: 'Know about Business Goals' },
          // Unit 4
          { id: 'ccs370_u4_1', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t1', topic_title: 'Sketching Principles' },
          { id: 'ccs370_u4_2', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t2', topic_title: 'Sketching Red Routes' },
          { id: 'ccs370_u4_3', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t3', topic_title: 'Responsive Design' },
          { id: 'ccs370_u4_4', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t4', topic_title: 'Wireframing' },
          { id: 'ccs370_u4_5', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t5', topic_title: 'Creating Wireflows' },
          { id: 'ccs370_u4_6', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t6', topic_title: 'Building a Prototype' },
          { id: 'ccs370_u4_7', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t7', topic_title: 'Building High-Fidelity Mockups' },
          { id: 'ccs370_u4_8', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t8', topic_title: 'Designing Efficiently with Tools' },
          { id: 'ccs370_u4_9', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t9', topic_title: 'Interaction Patterns' },
          { id: 'ccs370_u4_10', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t10', topic_title: 'Conducting Usability Tests' },
          { id: 'ccs370_u4_11', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t11', topic_title: 'Other Evaluative User Research Methods' },
          { id: 'ccs370_u4_12', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t12', topic_title: 'Synthesizing Test Findings' },
          { id: 'ccs370_u4_13', subject_code: 'CCS370', unit: 'Unit 4', topic_id: 'ccs370_u4_t13', topic_title: 'Prototype Iteration' },
          // Unit 5
          { id: 'ccs370_u5_1', subject_code: 'CCS370', unit: 'Unit 5', topic_id: 'ccs370_u5_t1', topic_title: 'Identifying and Writing Problem Statements' },
          { id: 'ccs370_u5_2', subject_code: 'CCS370', unit: 'Unit 5', topic_id: 'ccs370_u5_t2', topic_title: 'Identifying Appropriate Research Methods' },
          { id: 'ccs370_u5_3', subject_code: 'CCS370', unit: 'Unit 5', topic_id: 'ccs370_u5_t3', topic_title: 'Creating Personas' },
          { id: 'ccs370_u5_4', subject_code: 'CCS370', unit: 'Unit 5', topic_id: 'ccs370_u5_t4', topic_title: 'Solution Ideation' },
          { id: 'ccs370_u5_5', subject_code: 'CCS370', unit: 'Unit 5', topic_id: 'ccs370_u5_t5', topic_title: 'Creating User Stories' },
          { id: 'ccs370_u5_6', subject_code: 'CCS370', unit: 'Unit 5', topic_id: 'ccs370_u5_t6', topic_title: 'Creating Scenarios' },
          { id: 'ccs370_u5_7', subject_code: 'CCS370', unit: 'Unit 5', topic_id: 'ccs370_u5_t7', topic_title: 'Flow Diagrams' },
          { id: 'ccs370_u5_8', subject_code: 'CCS370', unit: 'Unit 5', topic_id: 'ccs370_u5_t8', topic_title: 'Flow Mapping' },
          { id: 'ccs370_u5_9', subject_code: 'CCS370', unit: 'Unit 5', topic_id: 'ccs370_u5_t9', topic_title: 'Information Architecture' },

          // MX3084 - Disaster Management
          { id: '31', subject_code: 'MX3084', unit: 'Unit 1', topic_id: 'mx3084_1', topic_title: 'Understanding Disasters & Hazard Types' },
          { id: '32', subject_code: 'MX3084', unit: 'Unit 2', topic_id: 'mx3084_2', topic_title: 'Mitigation Systems & Disaster Cycle' },
          { id: '33', subject_code: 'MX3084', unit: 'Unit 3', topic_id: 'mx3084_3', topic_title: 'Risk Assessment & Vulnerability Plans' },
          { id: '34', subject_code: 'MX3084', unit: 'Unit 4', topic_id: 'mx3084_4', topic_title: 'Response Systems Recovery & Rebuilding' },
          { id: '35', subject_code: 'MX3084', unit: 'Unit 5', topic_id: 'mx3084_5', topic_title: 'Case Studies, Regulations & Cyber Relief' },
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
          { id: 't1', day_of_week: 'Monday', period: 1, subject_code: 'CS3591', subject_name: 'Computer Networks', class_section: '3rd Year CSE-A', room_no: 'LH-302', faculty_name: 'Ms.E Uva Shakthi' },
          { id: 't2', day_of_week: 'Monday', period: 2, subject_code: 'CS3501', subject_name: 'Compiler Design', class_section: '3rd Year CSE-A', room_no: 'LH-303', faculty_name: 'Mr.J Lin Eby Chandra' },
          { id: 't3', day_of_week: 'Monday', period: 3, subject_code: 'CB3491', subject_name: 'Cryptography and Cyber Security', class_section: '3rd Year CSE-A', room_no: 'LH-304', faculty_name: 'Mr.S Faizal Mukthar Hussain' },
          { id: 't4', day_of_week: 'Monday', period: 4, subject_code: 'CS3551', subject_name: 'Distributed Computing', class_section: '3rd Year CSE-A', room_no: 'LH-305', faculty_name: 'Ms.R Rajalakshmi' },
          { id: 't5', day_of_week: 'Monday', period: 5, subject_code: 'CCS375', subject_name: 'Web Technologies', class_section: '3rd Year CSE-A', room_no: 'LH-306', faculty_name: 'Ms.P Divya' },
          { id: 't6', day_of_week: 'Monday', period: 6, subject_code: 'CCS370', subject_name: 'UI and UX Design', class_section: '3rd Year CSE-A', room_no: 'LH-307', faculty_name: 'Ms.Punitha EM' },
          // Tuesday
          { id: 't7', day_of_week: 'Tuesday', period: 1, subject_code: 'CCS370', subject_name: 'UI and UX Design', class_section: '3rd Year CSE-A', room_no: 'LH-307', faculty_name: 'Ms.Punitha EM' },
          { id: 't8', day_of_week: 'Tuesday', period: 2, subject_code: 'MX3084', subject_name: 'Disaster Management', class_section: '3rd Year CSE-A', room_no: 'LH-308', faculty_name: 'Ms.Arun Kamala' },
          { id: 't9', day_of_week: 'Tuesday', period: 3, subject_code: 'CS3591', subject_name: 'Computer Networks', class_section: '3rd Year CSE-A', room_no: 'LH-302', faculty_name: 'Ms.E Uva Shakthi' },
          { id: 't10', day_of_week: 'Tuesday', period: 4, subject_code: 'CS3501', subject_name: 'Compiler Design', class_section: '3rd Year CSE-A', room_no: 'LH-303', faculty_name: 'Mr.J Lin Eby Chandra' },
          { id: 't11', day_of_week: 'Tuesday', period: 5, subject_code: 'CB3491', subject_name: 'Cryptography and Cyber Security', class_section: '3rd Year CSE-A', room_no: 'LH-304', faculty_name: 'Mr.S Faizal Mukthar Hussain' },
          { id: 't12', day_of_week: 'Tuesday', period: 6, subject_code: 'CS3551', subject_name: 'Distributed Computing', class_section: '3rd Year CSE-A', room_no: 'LH-305', faculty_name: 'Ms.R Rajalakshmi' },
          // Wednesday
          { id: 't13', day_of_week: 'Wednesday', period: 1, subject_code: 'CS3551', subject_name: 'Distributed Computing', class_section: '3rd Year CSE-A', room_no: 'LH-305', faculty_name: 'Ms.R Rajalakshmi' },
          { id: 't14', day_of_week: 'Wednesday', period: 2, subject_code: 'CCS375', subject_name: 'Web Technologies', class_section: '3rd Year CSE-A', room_no: 'LH-306', faculty_name: 'Ms.P Divya' },
          { id: 't15', day_of_week: 'Wednesday', period: 3, subject_code: 'CCS370', subject_name: 'UI and UX Design', class_section: '3rd Year CSE-A', room_no: 'LH-307', faculty_name: 'Ms.Punitha EM' },
          { id: 't16', day_of_week: 'Wednesday', period: 4, subject_code: 'MX3084', subject_name: 'Disaster Management', class_section: '3rd Year CSE-A', room_no: 'LH-308', faculty_name: 'Ms.Arun Kamala' },
          { id: 't17', day_of_week: 'Wednesday', period: 5, subject_code: 'CS3591', subject_name: 'Computer Networks', class_section: '3rd Year CSE-A', room_no: 'LH-302', faculty_name: 'Ms.E Uva Shakthi' },
          { id: 't18', day_of_week: 'Wednesday', period: 6, subject_code: 'CS3501', subject_name: 'Compiler Design', class_section: '3rd Year CSE-A', room_no: 'LH-303', faculty_name: 'Mr.J Lin Eby Chandra' },
          // Thursday
          { id: 't19', day_of_week: 'Thursday', period: 1, subject_code: 'CS3501', subject_name: 'Compiler Design', class_section: '3rd Year CSE-A', room_no: 'LH-303', faculty_name: 'Mr.J Lin Eby Chandra' },
          { id: 't20', day_of_week: 'Thursday', period: 2, subject_code: 'CB3491', subject_name: 'Cryptography and Cyber Security', class_section: '3rd Year CSE-A', room_no: 'LH-304', faculty_name: 'Mr.S Faizal Mukthar Hussain' },
          { id: 't21', day_of_week: 'Thursday', period: 3, subject_code: 'CS3551', subject_name: 'Distributed Computing', class_section: '3rd Year CSE-A', room_no: 'LH-305', faculty_name: 'Ms.R Rajalakshmi' },
          { id: 't22', day_of_week: 'Thursday', period: 4, subject_code: 'CCS375', subject_name: 'Web Technologies', class_section: '3rd Year CSE-A', room_no: 'LH-306', faculty_name: 'Ms.P Divya' },
          { id: 't23', day_of_week: 'Thursday', period: 5, subject_code: 'CCS370', subject_name: 'UI and UX Design', class_section: '3rd Year CSE-A', room_no: 'LH-307', faculty_name: 'Ms.Punitha EM' },
          { id: 't24', day_of_week: 'Thursday', period: 6, subject_code: 'CS3591', subject_name: 'Computer Networks', class_section: '3rd Year CSE-A', room_no: 'LH-302', faculty_name: 'Ms.E Uva Shakthi' },
          // Friday
          { id: 't25', day_of_week: 'Friday', period: 1, subject_code: 'CB3491', subject_name: 'Cryptography and Cyber Security', class_section: '3rd Year CSE-A', room_no: 'LH-304', faculty_name: 'Mr.S Faizal Mukthar Hussain' },
          { id: 't26', day_of_week: 'Friday', period: 2, subject_code: 'CS3551', subject_name: 'Distributed Computing', class_section: '3rd Year CSE-A', room_no: 'LH-305', faculty_name: 'Ms.R Rajalakshmi' },
          { id: 't27', day_of_week: 'Friday', period: 3, subject_code: 'CCS375', subject_name: 'Web Technologies', class_section: '3rd Year CSE-A', room_no: 'LH-306', faculty_name: 'Ms.P Divya' },
          { id: 't28', day_of_week: 'Friday', period: 4, subject_code: 'CCS370', subject_name: 'UI and UX Design', class_section: '3rd Year CSE-A', room_no: 'LH-307', faculty_name: 'Ms.Punitha EM' },
          { id: 't29', day_of_week: 'Friday', period: 5, subject_code: 'CS3591', subject_name: 'Computer Networks', class_section: '3rd Year CSE-A', room_no: 'LH-302', faculty_name: 'Ms.E Uva Shakthi' },
          { id: 't30', day_of_week: 'Friday', period: 6, subject_code: 'CS3501', subject_name: 'Compiler Design', class_section: '3rd Year CSE-A', room_no: 'LH-303', faculty_name: 'Mr.J Lin Eby Chandra' },
          { id: 't100', day_of_week: 'Monday', period: 1, subject_code: 'MA25C01', subject_name: 'APPLIED CALCULUS', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Dr. Karuppaiya' },
          { id: 't101', day_of_week: 'Monday', period: 2, subject_code: 'EN25C01', subject_name: 'ENGLISH ESSENTIALS-I', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Mrs. Gopikha' },
          { id: 't102', day_of_week: 'Monday', period: 3, subject_code: 'UC25H01', subject_name: 'HERITAGE OF TAMILS', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Dr. Josphin' },
          { id: 't103', day_of_week: 'Monday', period: 4, subject_code: 'PH25C01', subject_name: 'APPLIED PHYSICS-I', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Dr. Saravanan' },
          { id: 't104', day_of_week: 'Monday', period: 5, subject_code: 'CY25C01', subject_name: 'APPLIED CHEMISTRY-I', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Dr. Bhuvaneshwari' },
          { id: 't105', day_of_week: 'Monday', period: 6, subject_code: 'CS25C01', subject_name: 'COMPUTER PROGRAMMING:C', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Mrs. Agnus' },
          { id: 't106', day_of_week: 'Monday', period: 7, subject_code: 'CS25C03', subject_name: 'ESSENTIALS OF COMPUTING', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Mrs. Archana' },
          { id: 't107', day_of_week: 'Monday', period: 8, subject_code: 'E25C16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Mr. D.Sivakumar' },
          { id: 't108', day_of_week: 'Monday', period: 9, subject_code: 'E25C16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Mrs. Bhakyalakshmi' },
          { id: 't109', day_of_week: 'Monday', period: 10, subject_code: 'UC25A01', subject_name: 'LIFE SKILLS FOR ENGINEERS-I', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Dr. Saravanan' },
          { id: 't110', day_of_week: 'Monday', period: 11, subject_code: 'UC25A02', subject_name: 'PHYSICAL EDUCATION-I', class_section: '1st Year SEC-A', room_no: 'LH-10A', faculty_name: 'Ms. Sabishna' },
          { id: 't111', day_of_week: 'Monday', period: 1, subject_code: 'EN25C01', subject_name: 'ENGLISH ESSENTIALS-I', class_section: '1st Year SEC-B', room_no: 'LH-10B', faculty_name: 'Mrs. A.Vani Berlina' },
          { id: 't112', day_of_week: 'Monday', period: 2, subject_code: 'UC25H01', subject_name: 'HERITAGE OF TAMILS', class_section: '1st Year SEC-B', room_no: 'LH-10B', faculty_name: 'Dr. Josphin' },
          { id: 't113', day_of_week: 'Monday', period: 3, subject_code: 'PH25C01', subject_name: 'APPLIED PHYSICS-I', class_section: '1st Year SEC-B', room_no: 'LH-10B', faculty_name: 'Mrs. Revathy' },
          { id: 't114', day_of_week: 'Monday', period: 4, subject_code: 'CY25C01', subject_name: 'APPLIED CHEMISTRY-I', class_section: '1st Year SEC-B', room_no: 'LH-10B', faculty_name: 'Dr. C.Murugesan' },
          { id: 't115', day_of_week: 'Monday', period: 5, subject_code: 'CS25C01', subject_name: 'COMPUTER PROGRAMMING:C', class_section: '1st Year SEC-B', room_no: 'LH-10B', faculty_name: 'Mrs. Agnus' },
          { id: 't116', day_of_week: 'Monday', period: 6, subject_code: 'ME25C16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-B', room_no: 'LH-10B', faculty_name: 'Dr. Gopikumar' },
          { id: 't117', day_of_week: 'Monday', period: 7, subject_code: 'ME25C16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-B', room_no: 'LH-10B', faculty_name: 'Mrs. Kanagavalli' },
          { id: 't118', day_of_week: 'Monday', period: 8, subject_code: 'UC25A01', subject_name: 'LIFE SKILLS FOR ENGINEERS-I', class_section: '1st Year SEC-B', room_no: 'LH-10B', faculty_name: 'Dr. Thirugnanam' },
          { id: 't119', day_of_week: 'Monday', period: 9, subject_code: 'UC25A02', subject_name: 'PHYSICAL EDUCATION-I', class_section: '1st Year SEC-B', room_no: 'LH-10B', faculty_name: 'Ms. Sabishna' },
          { id: 't120', day_of_week: 'Monday', period: 1, subject_code: 'MA25C01', subject_name: 'APPLIED CALCULUS', class_section: '1st Year SEC-C', room_no: 'LH-10C', faculty_name: 'Mr. Srinivasan' },
          { id: 't121', day_of_week: 'Monday', period: 2, subject_code: 'EN25C01', subject_name: 'ENGLISH ESSENTIALS-I', class_section: '1st Year SEC-C', room_no: 'LH-10C', faculty_name: 'Mrs. Gophika' },
          { id: 't122', day_of_week: 'Monday', period: 3, subject_code: 'UC25H01', subject_name: 'HERITAGE OF TAMILS', class_section: '1st Year SEC-C', room_no: 'LH-10C', faculty_name: 'Dr. Josphin' },
          { id: 't123', day_of_week: 'Monday', period: 4, subject_code: 'PH25C01', subject_name: 'APPLIED PHYSICS-I', class_section: '1st Year SEC-C', room_no: 'LH-10C', faculty_name: 'Mrs. Jasline' },
          { id: 't124', day_of_week: 'Monday', period: 5, subject_code: 'CY25C01', subject_name: 'APPLIED CHEMISTRY-I', class_section: '1st Year SEC-C', room_no: 'LH-10C', faculty_name: 'Dr. A.Yoganath' },
          { id: 't125', day_of_week: 'Monday', period: 6, subject_code: 'CS25C01', subject_name: 'COMPUTER PROGRAMMING:C', class_section: '1st Year SEC-C', room_no: 'LH-10C', faculty_name: 'Mrs. Agnus' },
          { id: 't126', day_of_week: 'Monday', period: 7, subject_code: 'ME25C16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-C', room_no: 'LH-10C', faculty_name: 'Dr. Kalaimani' },
          { id: 't127', day_of_week: 'Monday', period: 8, subject_code: 'UC25A01', subject_name: 'LIFE SKILLS FOR ENGINEERS-I', class_section: '1st Year SEC-C', room_no: 'LH-10C', faculty_name: 'Dr. Thirugnanam' },
          { id: 't128', day_of_week: 'Monday', period: 9, subject_code: 'UC25A02', subject_name: 'PHYSICAL EDUCATION-I', class_section: '1st Year SEC-C', room_no: 'LH-10C', faculty_name: 'Ms. Sabishna' },
          { id: 't129', day_of_week: 'Monday', period: 1, subject_code: 'MA25C01', subject_name: 'APPLIED CALCULUS', class_section: '1st Year SEC-D', room_no: 'LH-10D', faculty_name: 'Mrs. Kavitha' },
          { id: 't130', day_of_week: 'Monday', period: 2, subject_code: 'EN25C01', subject_name: 'ENGLISH ESSENTIALS-I', class_section: '1st Year SEC-D', room_no: 'LH-10D', faculty_name: 'Mrs. A.Vani Berlin' },
          { id: 't131', day_of_week: 'Monday', period: 3, subject_code: 'UC25H01', subject_name: 'HERITAGE OF TAMILS', class_section: '1st Year SEC-D', room_no: 'LH-10D', faculty_name: 'Dr. Josphin' },
          { id: 't132', day_of_week: 'Monday', period: 4, subject_code: 'PH25C01', subject_name: 'APPLIED PHYSICS-I', class_section: '1st Year SEC-D', room_no: 'LH-10D', faculty_name: 'Dr. Thirugnanam' },
          { id: 't133', day_of_week: 'Monday', period: 5, subject_code: 'CY25C01', subject_name: 'APPLIED CHEMISTRY-I', class_section: '1st Year SEC-D', room_no: 'LH-10D', faculty_name: 'Dr. Bhuvaneshwari' },
          { id: 't134', day_of_week: 'Monday', period: 6, subject_code: 'ME25C16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-D', room_no: 'LH-10D', faculty_name: 'Mr. Kumarasamy' },
          { id: 't135', day_of_week: 'Monday', period: 7, subject_code: 'ME25C16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-D', room_no: 'LH-10D', faculty_name: 'Mrs. Vyshnavai' },
          { id: 't136', day_of_week: 'Monday', period: 8, subject_code: 'UC25A01', subject_name: 'LIFE SKILLS FOR ENGINEERS-I', class_section: '1st Year SEC-D', room_no: 'LH-10D', faculty_name: 'Dr. Thirugnanam' },
          { id: 't137', day_of_week: 'Monday', period: 9, subject_code: 'UC25A02', subject_name: 'PHYSICAL EDUCATION-I', class_section: '1st Year SEC-D', room_no: 'LH-10D', faculty_name: 'Ms. Sabishna' },
          { id: 't138', day_of_week: 'Monday', period: 1, subject_code: 'EN25C01', subject_name: 'ENGLISH ESSENTIALS-I', class_section: '1st Year SEC-E', room_no: 'LH-10E', faculty_name: 'Mr. Aravind' },
          { id: 't139', day_of_week: 'Monday', period: 2, subject_code: 'UC25H01', subject_name: 'HERITAGE OF TAMILS', class_section: '1st Year SEC-E', room_no: 'LH-10E', faculty_name: 'Dr. Josphin' },
          { id: 't140', day_of_week: 'Monday', period: 3, subject_code: 'PH25C01', subject_name: 'APPLIED PHYSICS-I', class_section: '1st Year SEC-E', room_no: 'LH-10E', faculty_name: 'Dr. Thirugnanam' },
          { id: 't141', day_of_week: 'Monday', period: 4, subject_code: 'CY25C01', subject_name: 'APPLIED CHEMISTRY-I', class_section: '1st Year SEC-E', room_no: 'LH-10E', faculty_name: 'Dr. C.Murugesan' },
          { id: 't142', day_of_week: 'Monday', period: 5, subject_code: 'CS25C02', subject_name: 'COMPUTER PROGRAMMING:PYTHON', class_section: '1st Year SEC-E', room_no: 'LH-10E', faculty_name: 'Mrs. Archana' },
          { id: 't143', day_of_week: 'Monday', period: 6, subject_code: 'ME25C01', subject_name: 'ENGINEERING DRAWING', class_section: '1st Year SEC-E', room_no: 'LH-10E', faculty_name: 'Dr. Kalaimani' },
          { id: 't144', day_of_week: 'Monday', period: 7, subject_code: 'ME25C03', subject_name: 'INTRODUCTION TO MECHANICAL ENGINEERING', class_section: '1st Year SEC-E', room_no: 'LH-10E', faculty_name: 'Mr. Vijayakumar' },
          { id: 't145', day_of_week: 'Monday', period: 8, subject_code: 'CE25C01', subject_name: 'INTRODUCTION TO CIVIL ENGINEERING', class_section: '1st Year SEC-E', room_no: 'LH-10E', faculty_name: 'Dr. Gopikumar' },
          { id: 't146', day_of_week: 'Monday', period: 9, subject_code: '16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-E', room_no: 'LH-10E', faculty_name: 'Dr. Kalaimani' },
          { id: 't147', day_of_week: 'Monday', period: 10, subject_code: '16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-E', room_no: 'LH-10E', faculty_name: 'Mrs. Kanagavalli' },
          { id: 't148', day_of_week: 'Monday', period: 11, subject_code: 'UC25A01', subject_name: 'LIFE SKILLS FOR ENGINEERS-I', class_section: '1st Year SEC-E', room_no: 'LH-10E', faculty_name: 'Dr. Thirugnanam' },
          { id: 't149', day_of_week: 'Monday', period: 12, subject_code: 'UC25A02', subject_name: 'PHYSICAL EDUCATION-I', class_section: '1st Year SEC-E', room_no: 'LH-10E', faculty_name: 'Ms. Sabishna' },
          { id: 't150', day_of_week: 'Monday', period: 1, subject_code: 'EN25C01', subject_name: 'ENGLISH ESSENTIALS-I', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Mr. Aravind' },
          { id: 't151', day_of_week: 'Monday', period: 2, subject_code: 'UC25H01', subject_name: 'HERITAGE OF TAMILS', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Dr. Josphin' },
          { id: 't152', day_of_week: 'Monday', period: 3, subject_code: 'PH25C01', subject_name: 'APPLIED PHYSICS-I', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Mrs. Jasline' },
          { id: 't153', day_of_week: 'Monday', period: 4, subject_code: 'CY25C01', subject_name: 'APPLIED CHEMISTRY-I', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Dr. Bhuvaneshwari' },
          { id: 't154', day_of_week: 'Monday', period: 5, subject_code: 'CS25C01', subject_name: 'COMPUTER PROGRAMMING:C', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Mrs. Agnus' },
          { id: 't155', day_of_week: 'Monday', period: 6, subject_code: 'CS25C02', subject_name: 'COMPUTER PROGRAMMING:PYTHON', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Mrs. Archana' },
          { id: 't156', day_of_week: 'Monday', period: 7, subject_code: 'EE25C03', subject_name: 'FUNDAMENTALS OF ELECTRICAL AND ELECTRONIC ENGINEERING', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Mrs. Amudha' },
          { id: 't157', day_of_week: 'Monday', period: 8, subject_code: 'TT25C01', subject_name: 'INTRODUCTION TO TETILE TECHNOLOGY', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Ms. Gophika' },
          { id: 't158', day_of_week: 'Monday', period: 9, subject_code: 'EI25C01', subject_name: 'INTRODUCTION TO MEASUREMENT AND INSTRUMENTATION', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Mr. Kumaraswamy' },
          { id: 't159', day_of_week: 'Monday', period: 10, subject_code: 'ME25C16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Dr. Gopikumar' },
          { id: 't160', day_of_week: 'Monday', period: 11, subject_code: 'ME25C16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Mrs. Amudha' },
          { id: 't161', day_of_week: 'Monday', period: 12, subject_code: 'UC25A01', subject_name: 'LIFE SKILLS FOR ENGINEERS-I', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Dr. Thirugnanam' },
          { id: 't162', day_of_week: 'Monday', period: 13, subject_code: 'UC25A02', subject_name: 'PHYSICAL EDUCATION-I', class_section: '1st Year SEC-F', room_no: 'LH-10F', faculty_name: 'Ms. Sabishna' },
          { id: 't163', day_of_week: 'Monday', period: 1, subject_code: 'MA25C01', subject_name: 'APPLIED CALCULUS', class_section: '1st Year SEC-G', room_no: 'LH-10G', faculty_name: 'Mrs. R.Sumathy' },
          { id: 't164', day_of_week: 'Monday', period: 2, subject_code: 'EN25C01', subject_name: 'ENGLISH ESSENTIALS-I', class_section: '1st Year SEC-G', room_no: 'LH-10G', faculty_name: 'Mrs. Gophika' },
          { id: 't165', day_of_week: 'Monday', period: 3, subject_code: 'UC25H01', subject_name: 'HERITAGE OF TAMILS', class_section: '1st Year SEC-G', room_no: 'LH-10G', faculty_name: 'Dr. Josphin' },
          { id: 't166', day_of_week: 'Monday', period: 4, subject_code: 'PH25C01', subject_name: 'APPLIED PHYSICS-I', class_section: '1st Year SEC-G', room_no: 'LH-10G', faculty_name: 'Mrs. G.Revathy' },
          { id: 't167', day_of_week: 'Monday', period: 5, subject_code: 'CY25C01', subject_name: 'APPLIED CHEMISTRY-I', class_section: '1st Year SEC-G', room_no: 'LH-10G', faculty_name: 'Dr. A.Yoganath' },
          { id: 't168', day_of_week: 'Monday', period: 6, subject_code: 'EE25C04', subject_name: 'BASIC ELECTRONICS AND ELECTRICAL ENGINEERING', class_section: '1st Year SEC-G', room_no: 'LH-10G', faculty_name: 'Mr. Kumaraswamy' },
          { id: 't169', day_of_week: 'Monday', period: 7, subject_code: 'ME25C16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-G', room_no: 'LH-10G', faculty_name: 'Mrs. Vyshnavai' },
          { id: 't170', day_of_week: 'Monday', period: 8, subject_code: 'ME25C16', subject_name: 'MAKERSPACE', class_section: '1st Year SEC-G', room_no: 'LH-10G', faculty_name: 'Mrs. Ashwini' },
          { id: 't171', day_of_week: 'Monday', period: 9, subject_code: 'UC25A01', subject_name: 'LIFE SKILLS FOR ENGINEERS-I', class_section: '1st Year SEC-G', room_no: 'LH-10G', faculty_name: 'Dr. Thirugnanam' },
          { id: 't172', day_of_week: 'Monday', period: 10, subject_code: 'UC25A02', subject_name: 'PHYSICAL EDUCATION-I', class_section: '1st Year SEC-G', room_no: 'LH-10G', faculty_name: 'Ms. Sabishna' },
        ];

        for (const slot of seedSlots) {
          await db.runAsync(
            `INSERT OR IGNORE INTO timetable (id, day_of_week, period, subject_code, subject_name, class_section, room_no, faculty_name)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?);`,
            [slot.id, slot.day_of_week, slot.period, slot.subject_code, slot.subject_name, slot.class_section, slot.room_no, slot.faculty_name]
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
