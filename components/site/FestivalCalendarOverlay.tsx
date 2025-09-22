import React, { useState } from 'react';
import FestivalCalendar from './FestivalCalendar';
import { X } from 'lucide-react';

export default function FestivalCalendarOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  if (!open) return null;
  // Close overlay if clicking outside modal content
  function handleBackdropClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur"
      style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={handleBackdropClick}
    >
      <div className="relative bg-white rounded-lg shadow-lg p-6 w-full max-w-md" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <button
          className="absolute top-2 right-2 text-gray-500 hover:text-pink-600"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <FestivalCalendar />
      </div>
    </div>
  );
}
