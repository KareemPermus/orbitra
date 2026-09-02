import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const db = getDb();

  try {
    if (req.method === 'GET') {
      if (isSupabase()) {
        const { data, error } = await db.from('tasks').select('*').eq('id', id).single();
        if (error || !data) return res.status(404).json({ error: 'Not found' });
        return res.json(data);
      }
      const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      return res.json(row);
    }

    if (req.method === 'PUT') {
      const { title, status, priority, due_date, description } = req.body;

      if (isSupabase()) {
        const updates: any = { updated_at: new Date().toISOString() };
        if (title !== undefined) updates.title = title;
        if (status !== undefined) updates.status = status;
        if (priority !== undefined) updates.priority = priority;
        if (due_date !== undefined) updates.due_date = due_date;
        if (description !== undefined) updates.description = description;

        const { data, error } = await db.from('tasks').update(updates).eq('id', id).select().single();
        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Not found' });
        return res.json(data);
      }

      db.prepare("UPDATE tasks SET title=COALESCE(?,title), status=COALESCE(?,status), priority=COALESCE(?,priority), due_date=COALESCE(?,due_date), description=COALESCE(?,description), updated_at=datetime('now') WHERE id=?")
        .run(title || null, status || null, priority || null, due_date || null, description || null, id);
      const row = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id);
      if (!row) return res.status(404).json({ error: 'Not found' });
      return res.json(row);
    }

    if (req.method === 'DELETE') {
      if (isSupabase()) {
        await db.from('activities').update({ task_id: null }).eq('task_id', id);
        const { error } = await db.from('tasks').delete().eq('id', id);
        if (error) throw error;
        return res.json({ success: true });
      }
      db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
      return res.json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('Task error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}