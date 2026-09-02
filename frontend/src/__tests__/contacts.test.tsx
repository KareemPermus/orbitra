import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Contacts from '@/pages/contacts';
import apiClient from '@/api/client';

jest.mock('@/api/client', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

const mockContacts = [
  { id: 1, first_name: 'John', last_name: 'Doe', email: 'john@test.com', phone: '555-1234', company: 'Acme', created_at: '2024-01-01' },
  { id: 2, first_name: 'Jane', last_name: 'Smith', email: '', phone: '', company: '', created_at: '2024-01-02' },
];

beforeEach(() => {
  jest.clearAllMocks();
  (apiClient.get as jest.Mock).mockResolvedValue({ data: mockContacts });
});

test('renders contacts table', async () => {
  render(<Contacts />);
  await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument());
  expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  expect(screen.getByText('Acme')).toBeInTheDocument();
});

test('search filters contacts', async () => {
  render(<Contacts />);
  await waitFor(() => screen.getByText('John Doe'));
  fireEvent.change(screen.getByPlaceholderText('Search contacts…'), { target: { value: 'Jane' } });
  expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
  expect(screen.getByText('Jane Smith')).toBeInTheDocument();
});

test('opens create modal', async () => {
  render(<Contacts />);
  await waitFor(() => screen.getByText('John Doe'));
  fireEvent.click(screen.getByText('Add Contact'));
  expect(screen.getByText('New Contact')).toBeInTheDocument();
});

test('shows error on load failure', async () => {
  (apiClient.get as jest.Mock).mockRejectedValue(new Error('fail'));
  render(<Contacts />);
  await waitFor(() => expect(screen.getByText('Failed to load contacts')).toBeInTheDocument());
});