import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import type { Task } from '@/types';
import { FiPlus, FiSearch, FiFilter, FiCheckSquare, FiTrash2, FiEdit2, FiX, FiAlertCircle, FiClock, FiArrowUp, FiArrowDown, FiMinus } from 'react-icons/fi';
import { format } from 'date-fns';

const priorityConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  high: { color: 'bg-red-100 text-red-700', icon: <FiArrowUp className="w-3 h-3" /> },
  medium: { color: 'bg-amber-100 text-amber-700', icon: <FiMinus className="w-3 h-3" /> },
  low: { color: 'bg-emerald-100 text-emerald-700', icon: <FiArrowDown className="w-3 h-3" /> },
};

const statusConfig: Record<string, string> = {
  todo: 'bg-zinc-100 text-zinc-600',
  in_progress: 'bg-indigo-100 text-indigo-700',
  done: 'bg-emerald-100 text-emerald-700',
  cancelled: 'bg-red-100 text-red-700',
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', contact_id: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/tasks');
      setTasks(data);
    } catch { setError('Failed to load tasks'); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const filtered = tasks.filter(t => {
    const matchSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || t.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const openCreate = () => {
    setEditTask(null);
    setForm({ title: '', description: '', status: 'todo', priority: 'medium', due_date: '', contact_id: '' });
    setShowModal(true);
  };

  const openEdit = (t: Task) => {
    setEditTask(t);
    setForm({
      title: t.title,
      description: t.description || '',
      status: t.status,
      priority: t.priority,
      due_date: t.due_date ? t.due_date.slice(0, 10) : '',
      contact_id: t.contact_id ? String(t.contact_id) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) return;
    setSubmitting(true);
    try {
      const body: any = { title: form.title, status: form.status, priority: form.priority };
      if (form.description) body.description = form.description;
      if (form.due_date) body.due_date = form.due_date;
      if (form.contact_id) body.contact_id = parseInt(form.contact_id);

      if (editTask) {
        await apiClient.put(`/api/tasks/${editTask.id}`, body);
      } else {
        await apiClient.post('/api/tasks', body);
      }
      setShowModal(false);
      fetchTasks();
    } catch { setError('Failed to save task'); } finally { setSubmitting(false); }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this task?')) return;
    try {
      await apiClient.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch { setError('Failed to delete task'); }
  };

  const formatDate = (d?: string) => {
    if (!d) return '—';
    try { return format(new Date(d), 'MMM d, yyyy'); } catch { return d; }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (error && tasks.length === 0) return <div className="flex flex-col items-center justify-center h-64 gap-2 text-zinc-500"><FiAlertCircle className="w-8 h-8 text-red-500" /><p>{error}</p><button onClick={fetchTasks} className="text-sm text-red-600 hover:underline">Retry</button></div>;

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-lg font-semibold text-zinc-800">Tasks</h1>
          <p className="text-xs text-zinc-400">{tasks.length} total tasks</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
          <FiPlus className="w-4 h-4" /> New Task
        </button>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl border border-zinc-200">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 gap-3 flex-wrap border-b border-zinc-100">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <FiSearch className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks…" className="pl-9 pr-4 py-2 w-full text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" />
          </div>
          <div className="flex items-center gap-2">
            <FiFilter className="w-4 h-4 text-zinc-400" />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-200">
              <option value="all">All Status</option>
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-12 text-center text-zinc-400 text-sm">
            <FiCheckSquare className="w-8 h-8 mx-auto mb-2 text-zinc-300" />
            <p>No tasks found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-400 border-b border-zinc-100">
                <tr>
                  <th className="py-2.5 px-6 font-medium text-xs uppercase tracking-wider">Task</th>
                  <th className="font-medium text-xs uppercase tracking-wider">Status</th>
                  <th className="font-medium text-xs uppercase tracking-wider">Priority</th>
                  <th className="font-medium text-xs uppercase tracking-wider">Due Date</th>
                  <th className="font-medium text-xs uppercase tracking-wider text-right pr-6">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map(task => (
                  <tr key={task.id} className="hover:bg-zinc-50 transition-colors">
                    <td className="py-3 px-6">
                      <div className="font-medium text-zinc-800">{task.title}</div>
                      {task.contact_id && <div className="text-xs text-zinc-400">Contact #{task.contact_id}</div>}
                    </td>
                    <td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[task.status] || 'bg-zinc-100 text-zinc-600'}`}>
                        {task.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${priorityConfig[task.priority]?.color || 'bg-zinc-100 text-zinc-600'}`}>
                        {priorityConfig[task.priority]?.icon}{task.priority}
                      </span>
                    </td>
                    <td className="text-zinc-500">
                      <span className="inline-flex items-center gap-1"><FiClock className="w-3 h-3" />{formatDate(task.due_date)}</span>
                    </td>
                    <td className="text-right pr-6">
                      <button onClick={() => openEdit(task)} className="p-1.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"><FiEdit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(task.id)} className="p-1.5 rounded hover:bg-red-50 text-zinc-400 hover:text-red-600 ml-1"><FiTrash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{editTask ? 'Edit Task' : 'Create New Task'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-zinc-100"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-zinc-500">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" placeholder="Task title" />
              </div>
              <div>
                <label className="text-zinc-500">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={2} className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" placeholder="Optional description" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-zinc-500">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200">
                    <option value="todo">Todo</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="text-zinc-500">Priority</label>
                  <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200">
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-zinc-500">Due Date</label>
                <input type="date" value={form.due_date} onChange={e => setForm(f => ({ ...f, due_date: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" />
              </div>
              <div>
                <label className="text-zinc-500">Contact ID</label>
                <input type="number" value={form.contact_id} onChange={e => setForm(f => ({ ...f, contact_id: e.target.value }))} className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" placeholder="Optional" />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg hover:bg-zinc-100">Cancel</button>
              <button onClick={handleSubmit} disabled={submitting || !form.title.trim()} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors">
                {submitting ? 'Saving…' : editTask ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}