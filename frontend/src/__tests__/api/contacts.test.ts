import { createMocks } from 'node-mocks-http';
import handler from '@/pages/api/contacts/index';

jest.mock('@/lib/db', () => ({
  getDb: () => ({
    prepare: (sql: string) => ({
      all: () => [{ id: 1, first_name: 'A', last_name: 'B', email: 'a@b.com', phone: '123', company: 'X', created_at: '2025-01-01' }],
      run: () => ({ lastInsertRowid: 1 }),
      get: () => ({ id: 1, first_name: 'Test', last_name: 'User', email: null, phone: null, company: null, notes: null, slug: 'test', created_at: '2025-01-01', updated_at: '2025-01-01' }),
    }),
  }),
  isSupabase: () => false,
}));

describe('/api/contacts', () => {
  it('GET returns contacts list', async () => {
    const { req, res } = createMocks({ method: 'GET' });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(200);
    const data = JSON.parse(res._getData());
    expect(Array.isArray(data)).toBe(true);
  });

  it('POST creates contact', async () => {
    const { req, res } = createMocks({ method: 'POST', body: { first_name: 'Test', last_name: 'User' } });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(201);
  });

  it('POST rejects missing fields', async () => {
    const { req, res } = createMocks({ method: 'POST', body: {} });
    await handler(req as any, res as any);
    expect(res._getStatusCode()).toBe(400);
  });
});