import React from 'react';

interface GradientHeaderProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  children?: React.ReactNode;
}

export default function GradientHeader({ title, subtitle, onClose, children }: GradientHeaderProps) {
  return (
    <div className="sticky top-0 z-10 rounded-b-xl p-6 text-white" style={{ background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)' }}>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">{title}</h2>
          {subtitle && <p className="text-sm opacity-80 mt-1">{subtitle}</p>}
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-white/20 transition-colors">✕</button>
        )}
      </div>
      {children}
    </div>
  );
}