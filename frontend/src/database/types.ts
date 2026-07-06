export interface SQLiteSyncQueueItem {
  id: string;
  action_type: string; // 'CREATE_PLAN', 'SUBMIT_PROGRESS', 'REQUEST_EXTRA_HOURS'
  payload: string;     // JSON stringified payload
  created_at: number;
  retry_count: number;
  status: string;      // 'PENDING', 'PROCESSING', 'FAILED'
}

export interface SQLiteTimetableItem {
  id: string;
  day_of_week: string;
  period: number;
  subject_code: string;
  subject_name: string;
  class_section: string;
  room_no: string;
}

export interface SQLiteSyllabusNode {
  id: string;
  subject_code: string;
  unit: string;
  topic_id: string;
  topic_title: string;
  is_completed: number; // 0 or 1
  completed_date?: string;
}
