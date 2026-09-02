import React from 'react';

interface EntityTableCardProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  searchValue?: string;
  onSearchChange?: (v: string) => void;
  children: React.ReactNode;
}

export default function EntityTableCard({ title, actionLabel, onAction, searchValue, onSearchChange, children }: EntityTableCardProps) {
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0]">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 md:p-6 gap-3">
        <h2 className="font-semibold text-[#1E293B]">{title}</h2>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {onSearchChange && (
            <input
              type="text"
              placeholder="Search..."
              value={searchValue || ''}
              onChange={(e) => onSearchChange(e.target.value)}
              className="px-3 py-2 text-sm bg-[#F1F5F9] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-red-200 w-full sm:w-48"
            />
          )}
          {actionLabel && onAction && (
            <button onClick={onAction} className="px-4 py-2 text-sm rounded-lg bg-[#DC2626] text-white hover:bg-[#B91C1C] whitespace-nowrap">
              {actionLabel}
            </button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}