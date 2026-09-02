import { useState, useEffect, useCallback } from 'react';
import apiClient from '@/api/client';
import { Contact } from '@/types';
import { FiSearch, FiPlus, FiX, FiPhone, FiMail, FiTrash2 } from 'react-icons/fi';

interface ContactForm {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company: string;
  notes: string;
}

const empty: ContactForm = { first_name: '', last_name: '', email: '', phone: '', company: '', notes: '' };

export default function Contacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ContactForm>({ ...empty });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await apiClient.get('/api/contacts');
      setContacts(data);
    } catch { setError('Failed to load contacts'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = contacts.filter(c => {
    const q = search.toLowerCase();
    return !q || `${c.first_name} ${c.last_name} ${c.email ?? ''} ${c.company ?? ''}`.toLowerCase().includes(q);
  });

  const openCreate = () => { setForm({ ...empty }); setEditId(null); setShowModal(true); };
  const openEdit = (c: Contact) => {
    setForm({ first_name: c.first_name, last_name: c.last_name, email: c.email ?? '', phone: c.phone ?? '', company: c.company ?? '', notes: c.notes ?? '' });
    setEditId(c.id); setShowModal(true);
  };

  const save = async () => {
    if (!form.first_name || !form.last_name) return;
    setSaving(true);
    try {
      if (editId) { await apiClient.put(`/api/contacts/${editId}`, form); }
      else { await apiClient.post('/api/contacts', form); }
      setShowModal(false); load();
    } catch { setError('Save failed'); }
    finally { setSaving(false); }
  };

  const remove = async (id: number) => {
    if (!confirm('Delete this contact?')) return;
    try { await apiClient.delete(`/api/contacts/${id}`); load(); } catch { setError('Delete failed'); }
  };

  const set = (k: keyof ContactForm, v: string) => setForm(p => ({ ...p, [k]: v }));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500" /></div>;
  if (error && !contacts.length) return <div className="p-8 text-center text-red-400">{error}</div>;

  return (
    <div className="p-6 md:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-zinc-800">Contacts</h1>
          <p className="text-xs text-zinc-400">{contacts.length} total contacts</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 bg-red-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-red-700">
          <FiPlus className="w-4 h-4" /> Add Contact
        </button>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-xl border border-zinc-200">
        {/* Toolbar */}
        <div className="p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <FiSearch className="w-4 h-4 absolute left-3 top-2.5 text-zinc-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search contacts…" className="pl-9 pr-4 py-2 w-full text-sm bg-zinc-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" />
          </div>
        </div>

        {/* Table */}
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-zinc-400 text-sm">No contacts found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-zinc-400 border-y border-zinc-100">
                <tr>
                  <th className="py-2.5 px-6 font-medium uppercase text-xs tracking-wider">Name</th>
                  <th className="font-medium uppercase text-xs tracking-wider hidden md:table-cell">Email</th>
                  <th className="font-medium uppercase text-xs tracking-wider hidden md:table-cell">Phone</th>
                  <th className="font-medium uppercase text-xs tracking-wider hidden sm:table-cell">Company</th>
                  <th className="font-medium uppercase text-xs tracking-wider w-20">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filtered.map(c => (
                  <tr key={c.id} className="hover:bg-zinc-50 cursor-pointer" onClick={() => openEdit(c)}>
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-xs font-semibold shrink-0">
                          {c.first_name[0]}{c.last_name[0]}
                        </div>
                        <span className="font-medium text-zinc-800">{c.first_name} {c.last_name}</span>
                      </div>
                    </td>
                    <td className="text-zinc-500 hidden md:table-cell">{c.email || <span className="text-zinc-300">—</span>}</td>
                    <td className="text-zinc-500 hidden md:table-cell">{c.phone || <span className="text-zinc-300">—</span>}</td>
                    <td className="hidden sm:table-cell">{c.company ? <span className="px-2 py-0.5 rounded-full text-xs bg-zinc-100 text-zinc-600">{c.company}</span> : <span className="text-zinc-300">—</span>}</td>
                    <td>
                      <div className="flex gap-1">
                        {c.email && <a href={`mailto:${c.email}`} onClick={e => e.stopPropagation()} className="p-1.5 rounded hover:bg-zinc-100"><FiMail className="w-3.5 h-3.5 text-zinc-400" /></a>}
                        {c.phone && <a href={`tel:${c.phone}`} onClick={e => e.stopPropagation()} className="p-1.5 rounded hover:bg-zinc-100"><FiPhone className="w-3.5 h-3.5 text-zinc-400" /></a>}
                        <button onClick={e => { e.stopPropagation(); remove(c.id); }} className="p-1.5 rounded hover:bg-red-50"><FiTrash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="p-3 text-center text-xs text-zinc-400 border-t border-zinc-100">Orbitra CRM</div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowModal(false)} />
          <div className="relative bg-white w-full max-w-md rounded-xl p-6 shadow-xl mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-lg">{editId ? 'Edit Contact' : 'New Contact'}</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded hover:bg-zinc-100"><FiX className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-zinc-500">First name *</label><input value={form.first_name} onChange={e => set('first_name', e.target.value)} className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" /></div>
                <div><label className="text-zinc-500">Last name *</label><input value={form.last_name} onChange={e => set('last_name', e.target.value)} className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" /></div>
              </div>
              <div><label className="text-zinc-500">Email</label><input value={form.email} onChange={e => set('email', e.target.value)} className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" /></div>
              <div><label className="text-zinc-500">Phone</label><input value={form.phone} onChange={e => set('phone', e.target.value)} className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" /></div>
              <div><label className="text-zinc-500">Company</label><input value={form.company} onChange={e => set('company', e.target.value)} className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" /></div>
              <div><label className="text-zinc-500">Notes</label><textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2} className="w-full mt-1 px-3 py-2 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-200" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-sm rounded-lg hover:bg-zinc-100">Cancel</button>
              <button onClick={save} disabled={saving} className="px-4 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">
                {saving ? 'Saving…' : editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}