import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/dashboard';

jest.mock('@/lib/db', () => ({
  getDb: () => {
    const prepareMock = (sql: string) => ({
      get: () => {
        if (sql.includes('COUNT') && sql.includes('contacts')) return { c: 3 };
        if (sql.includes('COUNT') && sql.includes("date(due_date)")) return { c: 1 };
        if (sql.includes('COUNT')) return { c: 5 };
        return { c: 0 };
      },
      all: () => sql.includes('contacts') ? [{ id: 1, first_name: 'A', last_name: 'B', company: 'C' }] : [{ id: 1, title: 'T', status: 'pending', due_date: '2025-01-01' }],
    });
    return { prepare: prepareMock };
  },
  isSupabase: () => false,
}));

describe('GET /api/dashboard', () => {
  it('returns dashboard stats', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(data).toHaveProperty('total_contacts');
    expect(data).toHaveProperty('total_tasks');
    expect(data).toHaveProperty('tasks_due_today');
    expect(data).toHaveProperty('recent_contacts');
    expect(data).toHaveProperty('upcoming_tasks');
  });

  it('rejects non-GET', async () => {
    const { req, res } = createMocks({ method: 'POST' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(405);
  });
});