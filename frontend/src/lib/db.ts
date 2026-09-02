import path from 'path';

let db: any = null;

export function getDb() {
  if (db) return db;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    const { createClient } = require('@supabase/supabase-js');
    db = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    return db;
  }

  const Database = require('better-sqlite3');
  db = new Database(path.join('/tmp', 'app.db'));
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      company TEXT,
      notes TEXT,
      slug TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER REFERENCES contacts(id) ON DELETE SET NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      priority TEXT NOT NULL DEFAULT 'medium',
      due_date TEXT,
      slug TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      contact_id INTEGER NOT NULL REFERENCES contacts(id) ON DELETE CASCADE,
      task_id INTEGER REFERENCES tasks(id) ON DELETE SET NULL,
      type TEXT NOT NULL,
      note TEXT,
      slug TEXT UNIQUE NOT NULL,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  const count = db.prepare('SELECT COUNT(*) as c FROM contacts').get();
  if (count.c === 0) {
    db.exec(`
      INSERT INTO contacts (first_name, last_name, email, phone, company, slug) VALUES ('Alice', 'Johnson', 'alice@example.com', '555-0101', 'Acme Corp', 'alice-johnson');
      INSERT INTO contacts (first_name, last_name, email, phone, company, slug) VALUES ('Bob', 'Smith', 'bob@example.com', '555-0102', 'Globex Inc', 'bob-smith');
      INSERT INTO contacts (first_name, last_name, email, phone, company, slug) VALUES ('Carol', 'Williams', 'carol@example.com', '555-0103', 'Initech', 'carol-williams');

      INSERT INTO tasks (contact_id, title, description, status, priority, due_date, slug) VALUES (1, 'Follow up call', 'Call Alice about proposal', 'pending', 'high', datetime('now', '+1 day'), 'follow-up-call');
      INSERT INTO tasks (contact_id, title, description, status, priority, due_date, slug) VALUES (2, 'Send contract', 'Email contract to Bob', 'in_progress', 'medium', datetime('now', '+3 days'), 'send-contract');
      INSERT INTO tasks (contact_id, title, description, status, priority, due_date, slug) VALUES (3, 'Review proposal', 'Review Carol proposal', 'completed', 'low', datetime('now', '-1 day'), 'review-proposal');

      INSERT INTO activities (contact_id, task_id, type, note, slug) VALUES (1, 1, 'call', 'Initial discovery call', 'activity-alice-call');
      INSERT INTO activities (contact_id, type, note, slug) VALUES (2, 'email', 'Sent intro email', 'activity-bob-email');
      INSERT INTO activities (contact_id, type, note, slug) VALUES (3, 'meeting', 'Lunch meeting', 'activity-carol-meeting');
    `);
  }

  return db;
}

export function isSupabase(): boolean {
  return !!process.env.NEXT_PUBLIC_SUPABASE_URL;
}