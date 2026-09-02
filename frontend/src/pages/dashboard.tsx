import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import { FiUsers, FiCheckSquare, FiCalendar, FiArrowUpRight, FiArrowDownRight } from 'react-icons/fi';
import Link from 'next/link';

interface DashboardData {
  total_contacts: number;
  total_tasks: number;
  tasks_due_today: number;
  recent_contacts: { id: number; first_name: string; last_name: string; company: string }[];
  upcoming_tasks: { id: number; title: string; status: string; due_date: string }[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/api/dashboard')
      .then(res => setData(res.data))
      .catch(() => setError('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-zinc-400">Loading dashboard…</div>;
  if (error) return <div className="p-8 text-red-500">{error}</div>;
  if (!data) return null;

  const kpis = [
    { label: 'Total Contacts', value: data.total_contacts, icon: <FiUsers className="w-4 h-4 text-indigo-500" />, change: null },
    { label: 'Total Tasks', value: data.total_tasks, icon: <FiCheckSquare className="w-4 h-4 text-emerald-500" />, change: null },
    { label: 'Tasks Due Today', value: data.tasks_due_today, icon: <FiCalendar className="w-4 h-4 text-amber-500" />, change: null },
  ];

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-emerald-100 text-emerald-700',
    todo: 'bg-zinc-100 text-zinc-600',
  };

  return (
    <div className="p-8 space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white p-5 rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">{k.label}</span>
              {k.icon}
            </div>
            <div className="text-2xl font-bold mt-2">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Contacts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between p-6 pb-3">
            <h2 className="font-semibold">Recent Contacts</h2>
            <Link href="/contacts" className="text-sm text-red-600 hover:underline">View all</Link>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-400 border-y border-zinc-100">
              <tr>
                <th className="py-2.5 px-6 font-medium">Name</th>
                <th className="font-medium">Company</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.recent_contacts.length === 0 && (
                <tr><td colSpan={2} className="py-4 px-6 text-zinc-400 text-center">No contacts yet</td></tr>
              )}
              {data.recent_contacts.map(c => (
                <tr key={c.id} className="hover:bg-zinc-50">
                  <td className="py-3 px-6 font-medium">{c.first_name} {c.last_name}</td>
                  <td className="text-zinc-500">{c.company || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Upcoming Tasks */}
        <div className="bg-white p-6 rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Upcoming Tasks</h2>
            <Link href="/tasks" className="text-sm text-red-600 hover:underline">All</Link>
          </div>
          <ul className="space-y-3 text-sm">
            {data.upcoming_tasks.length === 0 && <li className="text-zinc-400">No upcoming tasks</li>}
            {data.upcoming_tasks.map(t => (
              <li key={t.id} className="flex items-start gap-3">
                <FiCheckSquare className="w-4 h-4 mt-0.5 text-red-500 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate">{t.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor[t.status] || 'bg-zinc-100 text-zinc-600'}`}>{t.status}</span>
                    {t.due_date && <span className="text-xs text-zinc-400">{t.due_date}</span>}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}