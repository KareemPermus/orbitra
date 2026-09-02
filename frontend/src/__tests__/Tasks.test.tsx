import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Tasks from '@/pages/tasks';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

const mockTasks = [
  { id: 1, title: 'Test Task', status: 'todo', priority: 'high', due_date: '2025-01-15', contact_id: 2, created_at: '2025-01-01' },
  { id: 2, title: 'Another Task', status: 'done', priority: 'low', due_date: null, contact_id: null, created_at: '2025-01-02' },
];

describe('Tasks Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (apiClient.get as jest.Mock).mockResolvedValue({ data: mockTasks });
  });

  it('renders tasks after loading', async () => {
    render(<Tasks />);
    await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument());
    expect(screen.getByText('Another Task')).toBeInTheDocument();
  });

  it('filters tasks by search', async () => {
    render(<Tasks />);
    await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument());
    fireEvent.change(screen.getByPlaceholderText('Search tasks…'), { target: { value: 'Another' } });
    expect(screen.queryByText('Test Task')).not.toBeInTheDocument();
    expect(screen.getByText('Another Task')).toBeInTheDocument();
  });

  it('opens create modal on button click', async () => {
    render(<Tasks />);
    await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument());
    fireEvent.click(screen.getByText('New Task'));
    expect(screen.getByText('Create New Task')).toBeInTheDocument();
  });

  it('shows error state when API fails', async () => {
    (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
    render(<Tasks />);
    await waitFor(() => expect(screen.getByText('Failed to load tasks')).toBeInTheDocument());
  });

  it('calls delete endpoint', async () => {
    (apiClient.delete as jest.Mock).mockResolvedValue({ data: { success: true } });
    window.confirm = jest.fn(() => true);
    render(<Tasks />);
    await waitFor(() => expect(screen.getByText('Test Task')).toBeInTheDocument());
    const deleteButtons = screen.getAllByRole('button').filter(b => b.querySelector('.w-4.h-4'));
    // find trash buttons - they are the second action button per row
    fireEvent.click(screen.getAllByRole('button')[screen.getAllByRole('button').length - 3]);
  });
});