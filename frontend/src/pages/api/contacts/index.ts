import type { NextApiRequest, NextApiResponse } from 'next';
import { getDb, isSupabase } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const db = getDb();

  try {
    if (req.method === 'GET') {
      if (isSupabase()) {
        const { data, error } = await db.from('contacts').select('id, first_name, last_name, email, phone, company, created_at').order('created_at', { ascending: false });
        if (error) throw error;
        return res.json(data);
      }
      const rows = db.prepare('SELECT id, first_name, last_name, email, phone, company, created_at FROM contacts ORDER BY created_at DESC').all();
      return res.json(rows);
    }

    if (req.method === 'POST') {
      const { first_name, last_name, email, phone, company, notes } = req.body;
      if (!first_name || !last_name) return res.status(400).json({ error: 'first_name and last_name required' });

      const slug = `${first_name}-${last_name}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-');

      if (isSupabase()) {
        const { data, error } = await db.from('contacts').insert({ first_name, last_name, email, phone, company, notes, slug }).select().single();
        if (error) throw error;
        return res.status(201).json(data);
      }

      const stmt = db.prepare('INSERT INTO contacts (first_name, last_name, email, phone, company, notes, slug) VALUES (?, ?, ?, ?, ?, ?, ?)');
      const result = stmt.run(first_name, last_name, email || null, phone || null, company || null, notes || null, slug);
      const contact = db.prepare('SELECT * FROM contacts WHERE id = ?').get(result.lastInsertRowid);
      return res.status(201).json(contact);
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e: any) {
    console.error('Contacts error:', e);
    return res.status(500).json({ error: 'Internal server error' });
  }
}