import React from 'react';
import { FiHelpCircle } from 'react-icons/fi';

export default function SupportFab() {
  return (
    <button className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#DC2626] text-white shadow-lg hover:bg-[#B91C1C] flex items-center justify-center z-30 transition-colors">
      <FiHelpCircle className="w-5 h-5" />
    </button>
  );
}