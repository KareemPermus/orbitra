export interface Contact {
  id: number;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  company?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  contact_id?: number;
  title: string;
  description?: string;
  status: string;
  priority: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: number;
  contact_id: number;
  task_id?: number;
  type: string;
  note?: string;
  created_at: string;
}

export interface DashboardStats {
  total_contacts: number;
  total_tasks: number;
  tasks_due_today: number;
  recent_contacts: { id: number; first_name: string; last_name: string; company: string }[];
  upcoming_tasks: { id: number; title: string; status: string; due_date: string }[];
}