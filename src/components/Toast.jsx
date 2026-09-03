import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed bottom-6 right-6 left-6 sm:left-auto sm:w-96 z-50 animate-bounce-short">
      <div className={`p-4 rounded-xl shadow-lg border flex items-start gap-3 text-sm font-medium ${
        isSuccess 
          ? 'bg-moss-900 text-white border-moss-700' 
          : 'bg-clay-900 text-white border-clay-700'
      }`}>
        {isSuccess ? (
          <CheckCircle2 className="w-5 h-5 text-moss-300 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="w-5 h-5 text-clay-300 flex-shrink-0 mt-0.5" />
        )}
        <div className="flex-1 leading-snug">
          {message}
        </div>
        <button
          onClick={onClose}
          className="text-stone-300 hover:text-white p-1 -mr-1 -mt-1 rounded-md transition-colors"
          aria-label="Chiudi notifica"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
