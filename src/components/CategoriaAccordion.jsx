import React from 'react';
import { ChevronDown } from 'lucide-react';
import CardPianta from './CardPianta';

export default function CategoriaAccordion({
  categoria,
  piante,
  isOpen,
  onToggle,
  onOpenLightbox
}) {
  return (
    <section className="border border-stone-200/90 rounded-2xl bg-white shadow-sm overflow-hidden mb-5 transition-all">
      {/* Header Fisarmonica Categoria */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between p-4 sm:p-5 text-left bg-stone-50/50 hover:bg-stone-100/70 transition-colors focus:outline-none focus:ring-2 focus:ring-moss-600 focus:ring-inset"
      >
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-moss-600"></span>
          <h2 className="font-display font-bold text-lg sm:text-xl text-stone-900 tracking-tight">
            {categoria}
          </h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-200/70 text-stone-700">
            {piante.length} {piante.length === 1 ? 'varietà' : 'varietà'}
          </span>
        </div>

        <div className="touch-target text-stone-500 hover:text-stone-800 transition-transform">
          <ChevronDown
            className={`w-5 h-5 transition-transform duration-300 ${
              isOpen ? 'rotate-180' : 'rotate-0'
            }`}
          />
        </div>
      </button>

      {/* Contenuto Espandibile / Griglia Card */}
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="p-4 sm:p-6 border-t border-stone-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {piante.map((pianta) => (
                <CardPianta
                  key={pianta.id}
                  pianta={pianta}
                  onOpenLightbox={onOpenLightbox}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
