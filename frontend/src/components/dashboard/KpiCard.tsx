import React from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg?: string;
}

export default function KpiCard({ label, value, icon, iconBg = 'bg-red-100 text-[#DC2626]' }: KpiCardProps) {
  return (
    <div className="bg-white p-5 rounded-xl border border-[#E2E8F0]">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[#64748B]">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconBg}`}>{icon}</div>
      </div>
      <div className="text-2xl font-bold mt-2 text-[#1E293B]">{value}</div>
    </div>
  );
}