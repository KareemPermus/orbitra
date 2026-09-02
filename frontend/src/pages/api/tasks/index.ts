import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  try {
    if (req.method === 'GET') {
      if (isSupabase()) {
        const { data, error } = await db.from('tasks').select('id, contact_id, title, status, priority, due_date, created_at').order('created_at', { ascending: false });
        if (error) throw error;
        return res.json(data);
      }
      const rows = db.prepare('SELECT id, contact_id, title, status, priority, due_date, created_at FROM tasks ORDER BY created_at DESC').all();
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { contact_id, title, description, status, priority, due_date } = req.body;
      if (!title) return res.status(400).json({ error: 'title required' });

      const slug = `${title}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-');
      const s = status || 'pending';
      const p = priority || 'medium';

      if (isSupabase()) {
        const { data, error } = await db.from('tasks').insert({ contact_id: contact_id || null, title, description, status: s, priority: p, due_date: due_date || null, slug }).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }

      const result = db.prepare('INSERT INTO tasks (contact_id, title, description, status, priority, due_date, slug) VALUES (?, ?, ?, ?, ?, ?, ?)').run(contact_id || null, title, description || null, s, p, due_date || null, slug);
      const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(task);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('Tasks error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}