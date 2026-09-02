import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const db = getDb();

  try {
    if (req.method === 'GET') {
      if (isSupabase()) {
        const { data, error } = await db.from('activities').select('id, type, note, task_id, created_at').eq('contact_id', id).order('created_at', { ascending: false });
        if (error) throw error;
        return res.json(data);
      }
      const rows = db.prepare('SELECT id, type, note, task_id, created_at FROM activities WHERE contact_id = ? ORDER BY created_at DESC').all(id);
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { type, note, task_id } = req.body;
      if (!type) return res.status(400).json({ error: 'type required' });

      const slug = `act-${id}-${Date.now()}`;

      if (isSupabase()) {
        const { data, error } = await db.from('activities').insert({ contact_id: Number(id), task_id: task_id || null, type, note, slug }).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }

      const result = db.prepare('INSERT INTO activities (contact_id, task_id, type, note, slug) VALUES (?, ?, ?, ?, ?)').run(Number(id), task_id || null, type, note || null, slug);
      const activity = db.prepare('SELECT * FROM activities WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(activity);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('Activities error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}