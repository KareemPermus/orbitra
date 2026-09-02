INSERT INTO contacts (first_name, last_name, email, phone, company, slug)
VALUES ('Alice', 'Johnson', 'alice@example.com', '555-0101', 'Acme Corp', 'alice-johnson')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO contacts (first_name, last_name, email, phone, company, slug)
VALUES ('Bob', 'Smith', 'bob@example.com', '555-0102', 'Globex Inc', 'bob-smith')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO contacts (first_name, last_name, email, phone, company, slug)
VALUES ('Carol', 'Williams', 'carol@example.com', '555-0103', 'Initech', 'carol-williams')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tasks (contact_id, title, description, status, priority, due_date, slug)
VALUES (1, 'Follow up call', 'Call Alice about proposal', 'pending', 'high', now() + interval '1 day', 'follow-up-call')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tasks (contact_id, title, description, status, priority, due_date, slug)
VALUES (2, 'Send contract', 'Email contract to Bob', 'in_progress', 'medium', now() + interval '3 days', 'send-contract')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO tasks (contact_id, title, description, status, priority, due_date, slug)
VALUES (3, 'Review proposal', 'Review Carol proposal', 'completed', 'low', now() - interval '1 day', 'review-proposal')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO activities (contact_id, task_id, type, note, slug)
VALUES (1, 1, 'call', 'Initial discovery call', 'activity-alice-call')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO activities (contact_id, type, note, slug)
VALUES (2, 'email', 'Sent intro email', 'activity-bob-email')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO activities (contact_id, type, note, slug)
VALUES (3, 'meeting', 'Lunch meeting', 'activity-carol-meeting')
ON CONFLICT (slug) DO NOTHING;