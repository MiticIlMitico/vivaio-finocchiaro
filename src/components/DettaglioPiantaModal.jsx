import React, { useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Layers, 
  Package, 
  Truck, 
  Scale, 
  Ruler, 
  Maximize2 
} from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function DettaglioPiantaModal({ pianta, onClose, onOpenLightbox }) {
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

  if (!pianta) return null;

  const {
    nome,
    nome_comune,
    categoria,
    tipologia,
    vaso_cm,
    altezza_cm,
    peso_kg,
    pz_pianale,
    pz_carrello,
    disponibilita_carrelli,
    prezzo,
    foto_url,
    descrizione,
    note
  } = pianta;

  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');
  const testoMessaggio = encodeURIComponent(
    `Salve Vivaio Finocchiaro, vorrei ordinare o avere informazioni per: ${nome}${nome_comune ? ` (${nome_comune})` : ''} - Vaso Ø ${vaso_cm || '-'} cm`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${testoMessaggio}`;

  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-xl border border-stone-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Immagine pulita */}
        <div className="relative aspect-[16/10] w-full bg-stone-100 flex-shrink-0">
          {foto_url ? (
            <img 
              src={foto_url} 
              alt={nome} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-400 bg-stone-100">
              <span className="text-xs">Nessuna foto</span>
            </div>
          )}

          {/* Chiudi */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-md transition-colors touch-target z-10"
            aria-label="Chiudi scheda"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Schermo intero */}
          {foto_url && (
            <button
              onClick={() => onOpenLightbox(foto_url, nome)}
              className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-md transition-colors z-10"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ingrandisci</span>
            </button>
          )}
        </div>

        {/* Informazioni sotto la foto */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            {categoria && (
              <span className="text-[11px] font-semibold text-emerald-800 tracking-wider uppercase block mb-1">
                {categoria}
              </span>
            )}
            <h2 className="font-bold text-2xl text-stone-900 leading-snug">
              {nome}
            </h2>
            {nome_comune && (
              <p className="text-stone-500 text-sm mt-0.5">
                {nome_comune}
              </p>
            )}
            {tipologia && (
              <p className="text-xs text-stone-600 mt-1">
                {tipologia}
              </p>
            )}
          </div>

          {descrizione && (
            <p className="text-stone-600 text-xs sm:text-sm leading-relaxed pt-2 border-t border-stone-100">
              {descrizione}
            </p>
          )}

          {/* Tabella Dati */}
          <div className="pt-2 border-t border-stone-100">
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[11px]">Diametro vaso</span>
                <span className="font-bold text-stone-900 text-sm mt-0.5 block">
                  {vaso_cm ? `Ø ${vaso_cm} cm` : '-'}
                </span>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                <span className="text-stone-400 block text-[11px]">Pezzi per carrello</span>
                <span className="font-bold text-stone-900 text-sm mt-0.5 block">
                  {pz_carrello ? `${pz_carrello} pz` : '-'}
                </span>
              </div>

              {pz_pianale && (
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block text-[11px]">Pezzi per pianale</span>
                  <span className="font-bold text-stone-900 text-sm mt-0.5 block">
                    {pz_pianale} pz
                  </span>
                </div>
              )}

              {disponibilita_carrelli && (
                <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100">
                  <span className="text-emerald-800 block text-[11px] font-medium">Disponibilità</span>
                  <span className="font-bold text-emerald-900 text-sm mt-0.5 block">
                    {disponibilita_carrelli}
                  </span>
                </div>
              )}

              {altezza_cm && (
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block text-[11px]">Altezza pianta</span>
                  <span className="font-bold text-stone-900 text-sm mt-0.5 block">
                    {altezza_cm} cm
                  </span>
                </div>
              )}

              {peso_kg && (
                <div className="bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <span className="text-stone-400 block text-[11px]">Peso stimato</span>
                  <span className="font-bold text-stone-900 text-sm mt-0.5 block">
                    {peso_kg} kg
                  </span>
                </div>
              )}
            </div>
          </div>

          {note && (
            <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/60 text-xs text-amber-900">
              <span className="font-semibold block mb-0.5">Note fornitura:</span>
              {note}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-400 block">
              Prezzo ingrosso
            </span>
            <span className="text-2xl font-bold text-stone-900">
              {prezzo ? `€ ${Number(prezzo).toFixed(2)}` : 'Su richiesta'}
            </span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors touch-target"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Ordina su WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
