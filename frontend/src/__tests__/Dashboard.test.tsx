import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '@/pages/index';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

const mockData = {
  total_contacts: 5,
  total_tasks: 12,
  tasks_due_today: 3,
  recent_contacts: [
    { id: 1, first_name: 'Alice', last_name: 'Smith', company: 'Acme' },
  ],
  upcoming_tasks: [
    { id: 1, title: 'Follow up', status: 'pending', due_date: '2025-01-01' },
  ],
};

describe('Dashboard', () => {
  it('renders KPI cards and data after loading', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockData });
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('5')).toBeInTheDocument());
    expect(screen.getByText('Total Contacts')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Follow up')).toBeInTheDocument();
  });

  it('shows error on API failure', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Dashboard />);
    await waitFor(() => expect(screen.getByText('Failed to load dashboard')).toBeInTheDocument());
  });
});