import React from 'react';

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function DetailDrawer({ open, onClose, children }: DetailDrawerProps) {
  if (!open) return null;
  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[560px] lg:w-[680px] max-w-[100vw] bg-white shadow-xl overflow-y-auto">
        {children}
      </div>
    </>
  );
}