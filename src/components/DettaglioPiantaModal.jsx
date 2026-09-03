import React, { useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Layers, 
  Package, 
  Truck, 
  Scale, 
  Ruler, 
  Info, 
  Check, 
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
    `Salve Vivaio Finocchiaro, vorrei ordinare o avere informazioni per la varietà:\n• ${nome}${nome_comune ? ` (${nome_comune})` : ''}\n• Vaso: Ø ${vaso_cm || '-'} cm\n• Prezzo di listino: € ${prezzo ? Number(prezzo).toFixed(2) : '-'}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${testoMessaggio}`;

  return (
    <div 
      className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-stone-200 overflow-hidden max-h-[92vh] sm:max-h-[88vh] flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con Immagine / Banner */}
        <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full bg-stone-900 flex-shrink-0">
          {foto_url ? (
            <img 
              src={foto_url} 
              alt={nome} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-stone-500 bg-stone-800">
              <span>Nessuna foto disponibile</span>
            </div>
          )}

          {/* Gradiente per leggibilità */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />

          {/* Pulsante Chiusura */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors touch-target z-10"
            aria-label="Chiudi scheda"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Pulsante Ingrandisci Lightbox */}
          {foto_url && (
            <button
              onClick={() => onOpenLightbox(foto_url, nome)}
              className="absolute top-3 left-3 sm:top-4 sm:left-4 px-3 py-1.5 rounded-full bg-black/40 hover:bg-black/70 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-md transition-colors z-10"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>A schermo intero</span>
            </button>
          )}

          {/* Badge e Titolo sovrapposti sull'immagine */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {categoria && (
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold text-emerald-200 border border-white/10">
                  {categoria}
                </span>
              )}
              {vaso_cm && (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-700/90 text-[11px] font-semibold text-white">
                  Vaso Ø {vaso_cm} cm
                </span>
              )}
              {disponibilita_carrelli && (
                <span className="px-2.5 py-0.5 rounded-full bg-stone-900/80 text-[11px] font-medium text-stone-200">
                  Disp: {disponibilita_carrelli}
                </span>
              )}
            </div>

            <h2 className="font-display font-bold text-2xl sm:text-3xl tracking-tight leading-tight">
              {nome}
            </h2>
            {nome_comune && (
              <p className="text-stone-300 text-xs sm:text-sm italic">
                {nome_comune}
              </p>
            )}
          </div>
        </div>

        {/* Contenuto Scrollabile */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {tipologia && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-moss-50 border border-moss-200 text-moss-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-moss-600"></span>
              {tipologia}
            </div>
          )}

          {descrizione && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">
                Descrizione botanica
              </h3>
              <p className="text-stone-700 text-sm leading-relaxed">
                {descrizione}
              </p>
            </div>
          )}

          {/* Griglia Specifiche Tecniche per Rivenditori */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">
              Specifiche di carico & fornitura
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                  <Ruler className="w-3.5 h-3.5 text-moss-700" />
                  <span>Altezza media</span>
                </div>
                <div className="text-sm font-bold text-stone-900">
                  {altezza_cm ? `${altezza_cm} cm` : '-'}
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                  <Scale className="w-3.5 h-3.5 text-moss-700" />
                  <span>Peso stimato</span>
                </div>
                <div className="text-sm font-bold text-stone-900">
                  {peso_kg ? `${peso_kg} kg` : '-'}
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                  <Layers className="w-3.5 h-3.5 text-moss-700" />
                  <span>Pz per pianale</span>
                </div>
                <div className="text-sm font-bold text-stone-900">
                  {pz_pianale || '-'}
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80">
                <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                  <Package className="w-3.5 h-3.5 text-moss-700" />
                  <span>Pz per carrello CC</span>
                </div>
                <div className="text-sm font-bold text-stone-900">
                  {pz_carrello || '-'}
                </div>
              </div>

              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200/80 col-span-2 sm:col-span-2">
                <div className="flex items-center gap-1.5 text-stone-500 mb-1">
                  <Truck className="w-3.5 h-3.5 text-moss-700" />
                  <span>Disponibilità carrelli settimanale</span>
                </div>
                <div className="text-sm font-bold text-emerald-800">
                  {disponibilita_carrelli || 'Disponibile su richiesta'}
                </div>
              </div>
            </div>
          </div>

          {note && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-amber-900 leading-relaxed">
              <span className="font-bold block mb-0.5">Note commerciali:</span>
              {note}
            </div>
          )}
        </div>

        {/* Footer Scheda con Prezzo e Pulsante Ordina */}
        <div className="p-4 sm:p-5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-stone-400 block">
              Prezzo Ingrosso Riservato
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-display font-bold text-stone-900">
                {prezzo ? `€ ${Number(prezzo).toFixed(2)}` : 'Su richiesta'}
              </span>
              {prezzo && <span className="text-xs text-stone-500 font-medium">+ IVA</span>}
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-sm font-semibold shadow-md shadow-emerald-900/10 transition-all touch-target"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Ordina su WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
