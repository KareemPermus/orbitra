import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const db = getDb();

    if (isSupabase()) {
      const [contactsRes, tasksRes, todayTasksRes, recentRes, upcomingRes] = await Promise.all([
        db.from('contacts').select('id', { count: 'exact', head: true }),
        db.from('tasks').select('id', { count: 'exact', head: true }),
        db.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'pending').lte('due_date', new Date().toISOString().split('T')[0] + 'T23:59:59Z').gte('due_date', new Date().toISOString().split('T')[0] + 'T00:00:00Z'),
        db.from('contacts').select('id, first_name, last_name, company').order('created_at', { ascending: false }).limit(5),
        db.from('tasks').select('id, title, status, due_date').neq('status', 'completed').order('due_date', { ascending: true }).limit(5),
      ]);

      return res.json({
        total_contacts: contactsRes.count || 0,
        total_tasks: tasksRes.count || 0,
        tasks_due_today: todayTasksRes.count || 0,
        recent_contacts: recentRes.data || [],
        upcoming_tasks: upcomingRes.data || [],
      });
    }

    const total_contacts = db.prepare('SELECT COUNT(*) as c FROM contacts').get().c;
    const total_tasks = db.prepare('SELECT COUNT(*) as c FROM tasks').get().c;
    const tasks_due_today = db.prepare("SELECT COUNT(*) as c FROM tasks WHERE status != 'completed' AND date(due_date) = date('now')").get().c;
    const recent_contacts = db.prepare('SELECT id, first_name, last_name, company FROM contacts ORDER BY created_at DESC LIMIT 5').all();
    const upcoming_tasks = db.prepare("SELECT id, title, status, due_date FROM tasks WHERE status != 'completed' ORDER BY due_date ASC LIMIT 5").all();

    return res.json({ total_contacts, total_tasks, tasks_due_today, recent_contacts, upcoming_tasks });
  } catch (e: any) {
    console.error('Dashboard error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}