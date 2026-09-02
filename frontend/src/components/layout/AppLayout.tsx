import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiHome, FiUsers, FiCheckSquare, FiMenu, FiX } from 'react-icons/fi';

const navItems = [
  { label: 'Dashboard', href: '/', icon: FiHome },
  { label: 'Contacts', href: '/contacts', icon: FiUsers },
  { label: 'Tasks', href: '/tasks', icon: FiCheckSquare },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === '/') return router.pathname === '/' || router.pathname === '/dashboard';
    return router.pathname.startsWith(href);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#F8FAFC]">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-40 w-60 flex flex-col bg-white border-r border-[#E2E8F0] transform transition-transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 h-16 flex items-center gap-2 border-b border-[#F1F5F9]">
          <div className="w-8 h-8 rounded-lg bg-[#DC2626] flex items-center justify-center text-white font-bold text-sm">O</div>
          <span className="font-bold text-lg tracking-tight text-[#1E293B]">Orbitra</span>
        </div>
        <nav className="flex-1 overflow-y-auto p-3 space-y-1 text-sm">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${active ? 'bg-red-50 text-[#DC2626] font-medium' : 'text-[#64748B] hover:bg-[#F1F5F9]'}`}
                onClick={() => setSidebarOpen(false)}>
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-[#F1F5F9] flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[#DC2626] flex items-center justify-center text-white text-sm font-medium">PR</div>
          <div className="min-w-0">
            <div className="text-sm font-medium truncate text-[#1E293B]">Priya Raman</div>
            <div className="text-xs text-[#94A3B8] truncate">Sales Lead</div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden min-w-0">
        <header className="h-16 px-4 md:px-8 flex items-center justify-between bg-white border-b border-[#E2E8F0] shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg hover:bg-[#F1F5F9]" onClick={() => setSidebarOpen(true)}>
              <FiMenu className="w-5 h-5 text-[#64748B]" />
            </button>
            <div>
              <h1 className="font-semibold text-lg text-[#1E293B]">Orbitra CRM</h1>
              <p className="text-xs text-[#94A3B8]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}