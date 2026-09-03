import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Lightbox({ src, alt, title, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  if (!src) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity"
      onClick={onClose}
    >
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 touch-target text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10"
        aria-label="Chiudi visualizzatore a schermo intero"
      >
        <X className="w-6 h-6" />
      </button>

      <div 
        className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img 
          src={src} 
          alt={alt || "Foto pianta a schermo intero"} 
          className="max-w-full max-h-[78vh] object-contain rounded-lg shadow-2xl"
        />
        {title && (
          <p className="mt-3 text-white text-base font-display italic text-center">
            {title}
          </p>
        )}
      </div>
    </div>
  );
}
