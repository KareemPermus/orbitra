import { useEffect, useState } from 'react';
import apiClient from '@/api/client';
import Link from 'next/link';
import { FiUsers, FiCheckSquare, FiCalendar, FiClock, FiArrowUpRight } from 'react-icons/fi';

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
    { label: 'Total Contacts', value: data.total_contacts, icon: <FiUsers className="w-4 h-4 text-red-500" />, color: 'text-red-600' },
    { label: 'Total Tasks', value: data.total_tasks, icon: <FiCheckSquare className="w-4 h-4 text-red-400" />, color: 'text-red-600' },
    { label: 'Tasks Due Today', value: data.tasks_due_today, icon: <FiCalendar className="w-4 h-4 text-amber-500" />, color: 'text-amber-600' },
    { label: 'Upcoming Tasks', value: data.upcoming_tasks.length, icon: <FiClock className="w-4 h-4 text-red-300" />, color: 'text-red-500' },
  ];

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-700',
    in_progress: 'bg-red-100 text-red-700',
    completed: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="font-semibold text-lg text-zinc-800">Dashboard</h1>
        <p className="text-xs text-zinc-400">Overview of your CRM activity</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-white p-5 rounded-xl border border-zinc-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-500">{k.label}</span>
              {k.icon}
            </div>
            <div className={`text-2xl font-bold mt-2 ${k.color}`}>{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Tasks */}
        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-zinc-800">Upcoming Tasks</h2>
            <Link href="/tasks" className="text-sm text-red-600 hover:underline">All</Link>
          </div>
          {data.upcoming_tasks.length === 0 ? (
            <p className="text-sm text-zinc-400">No upcoming tasks</p>
          ) : (
            <ul className="space-y-3 text-sm">
              {data.upcoming_tasks.map(t => (
                <li key={t.id} className="flex items-start gap-3">
                  <input type="checkbox" className="mt-0.5 accent-red-600" readOnly />
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
          )}
        </div>

        {/* Recent Contacts */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-200">
          <div className="flex items-center justify-between p-6 pb-3">
            <h2 className="font-semibold text-zinc-800">Recent Contacts</h2>
            <Link href="/contacts" className="text-sm text-red-600 hover:underline flex items-center gap-1">
              View all <FiArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          {data.recent_contacts.length === 0 ? (
            <p className="p-6 pt-0 text-sm text-zinc-400">No contacts yet</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-400 border-y border-zinc-100">
                <tr>
                  <th className="py-2.5 px-6 font-medium">Name</th>
                  <th className="font-medium">Company</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data.recent_contacts.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-50">
                    <td className="py-3 px-6 font-medium">{c.first_name} {c.last_name}</td>
                    <td className="text-zinc-500">{c.company || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}