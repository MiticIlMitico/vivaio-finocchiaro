import React, { useEffect, useState } from 'react';
import { 
  X, 
  MessageCircle, 
  Layers, 
  Package, 
  Truck, 
  Scale, 
  Ruler, 
  Maximize2,
  CheckCircle2,
  Warehouse
} from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function DettaglioPiantaModal({ pianta, validoFino, onClose, onOpenLightbox }) {
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
    giacenza,
    disponibile,
    varianti,
    foto_url,
    descrizione,
    note,
    varianteSelezionata
  } = pianta;

  // Lista varianti normalizzata
  const elencoVarianti = Array.isArray(varianti) && varianti.length > 0
    ? varianti
    : [{ vaso_cm, giacenza, disponibile }];

  // Inizializza con la variante passata o la prima
  const [varianteAttiva, setVarianteAttiva] = useState(
    varianteSelezionata || elencoVarianti[0]
  );

  const vasoCorrente = varianteAttiva?.vaso_cm ?? vaso_cm;
  const dispCorrente = varianteAttiva?.disponibile ?? disponibile ?? 0;
  const giacCorrente = varianteAttiva?.giacenza ?? giacenza ?? 0;

  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');
  const testoMessaggio = encodeURIComponent(
    `Salve ${AZIENDA.nome}, vorrei richiedere quotazione e disponibilità per: ${nome}${nome_comune ? ` (${nome_comune})` : ''} - Vaso Ø ${vasoCorrente || '-'} cm (Disponibili: ${dispCorrente} pz)`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${testoMessaggio}`;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#122A04]/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#B7BEA9]/60 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Immagine */}
        {(() => {
          const imgSource = varianteAttiva?.foto_url || foto_url;
          return (
            <div className="relative aspect-[16/10] w-full bg-[#F2F3EB] flex-shrink-0">
              {imgSource ? (
                <img 
                  key={imgSource}
                  src={imgSource} 
                  alt={nome} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-[#B7BEA9] bg-[#F2F3EB]">
                  <span className="text-xs font-semibold text-[#25570A]/70 uppercase tracking-wider">Foto in arrivo</span>
                </div>
              )}

              {/* Chiudi */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-md transition-colors touch-target z-10"
                aria-label="Chiudi scheda"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Schermo intero */}
              {imgSource && (
                <button
                  onClick={() => onOpenLightbox(imgSource, nome)}
                  className="absolute top-3 left-3 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/80 text-white text-xs font-medium flex items-center gap-1.5 backdrop-blur-md transition-colors z-10"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Ingrandisci</span>
                </button>
              )}
            </div>
          );
        })()}

        {/* Informazioni sotto la foto */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div>
            {categoria && (
              <span className="text-[11px] font-bold text-[#6BB221] tracking-wider uppercase block mb-1">
                {categoria}
              </span>
            )}
            {/* Nome botanico pulito */}
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#25570A] leading-snug">
              {nome}
            </h2>
            {nome_comune && (
              <p className="text-[#282B27]/70 text-sm mt-0.5 italic">
                {nome_comune}
              </p>
            )}
            {tipologia && (
              <p className="text-xs text-[#282B27]/80 mt-1">
                {tipologia}
              </p>
            )}
          </div>

          {/* Selettore Vaso nella modale se multiplo */}
          {elencoVarianti.length > 1 && (
            <div className="p-3.5 bg-[#F2F3EB] rounded-2xl border border-[#B7BEA9]/50">
              <span className="text-xs font-bold uppercase tracking-wider text-[#282B27]/70 block mb-2">
                Seleziona formato vaso:
              </span>
              <div className="flex flex-wrap gap-2">
                {elencoVarianti.map((v, idx) => {
                  const isSelected = v.vaso_cm === vasoCorrente;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setVarianteAttiva(v)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-[#25570A] text-white shadow-sm ring-2 ring-[#6BB221]/50'
                          : 'bg-white hover:bg-[#E5E7DC] text-[#282B27] border border-[#B7BEA9]/60'
                      }`}
                    >
                      {v.vaso_cm ? `Ø ${v.vaso_cm} cm` : 'Standard'}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {descrizione && (
            <p className="text-[#282B27]/80 text-xs sm:text-sm leading-relaxed pt-2 border-t border-[#B7BEA9]/30">
              {descrizione}
            </p>
          )}

          {/* Tabella Dati e Logistica aggiornata per il vaso selezionato */}
          <div className="pt-2 border-t border-[#B7BEA9]/30">
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {/* Disponibilità Vaso Selezionato */}
              <div className="bg-[#25570A]/10 p-3 rounded-xl border border-[#25570A]/20">
                <span className="text-[#25570A] block text-[11px] font-bold flex items-center justify-between gap-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6BB221]" />
                    Disponibili {vasoCorrente ? `(Ø ${vasoCorrente} cm)` : ''}
                  </span>
                </span>
                <span className="font-extrabold text-[#25570A] text-base mt-0.5 block">
                  {dispCorrente !== null ? `${Number(dispCorrente).toLocaleString('it-IT')} pz` : 'Disponibile'}
                </span>
                {validoFino && (
                  <span className="text-[10px] text-[#25570A]/85 font-bold block mt-1">
                    Valide fino al {validoFino}
                  </span>
                )}
              </div>

              {/* Giacenza Magazzino */}
              <div className="bg-[#F2F3EB] p-3 rounded-xl border border-[#B7BEA9]/40">
                <span className="text-[#282B27]/60 block text-[11px] font-semibold flex items-center gap-1">
                  <Warehouse className="w-3.5 h-3.5 text-[#25570A]" />
                  Giacenza magazzino
                </span>
                <span className="font-bold text-[#282B27] text-base mt-0.5 block">
                  {giacCorrente !== null ? `${Number(giacCorrente).toLocaleString('it-IT')} pz` : '-'}
                </span>
              </div>

              <div className="bg-[#F2F3EB] p-3 rounded-xl border border-[#B7BEA9]/40">
                <span className="text-[#282B27]/60 block text-[11px]">Diametro vaso</span>
                <span className="font-bold text-[#282B27] text-sm mt-0.5 block">
                  {vasoCorrente ? `Ø ${vasoCorrente} cm` : '-'}
                </span>
              </div>

              <div className="bg-[#F2F3EB] p-3 rounded-xl border border-[#B7BEA9]/40">
                <span className="text-[#282B27]/60 block text-[11px]">Pezzi per carrello CC</span>
                <span className="font-bold text-[#282B27] text-sm mt-0.5 block">
                  {pz_carrello ? `${pz_carrello} pz` : '-'}
                </span>
              </div>

              {pz_pianale && (
                <div className="bg-[#F2F3EB] p-3 rounded-xl border border-[#B7BEA9]/40">
                  <span className="text-[#282B27]/60 block text-[11px]">Pezzi per pianale</span>
                  <span className="font-bold text-[#282B27] text-sm mt-0.5 block">
                    {pz_pianale} pz
                  </span>
                </div>
              )}

              {disponibilita_carrelli && (
                <div className="bg-[#25570A]/10 p-3 rounded-xl border border-[#25570A]/20">
                  <span className="text-[#25570A] block text-[11px] font-semibold">Carrelli pronti</span>
                  <span className="font-bold text-[#25570A] text-sm mt-0.5 block">
                    {disponibilita_carrelli}
                  </span>
                </div>
              )}

              {altezza_cm && (
                <div className="bg-[#F2F3EB] p-3 rounded-xl border border-[#B7BEA9]/40">
                  <span className="text-[#282B27]/60 block text-[11px] flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-[#25570A]" />
                    Altezza pianta
                  </span>
                  <span className="font-bold text-[#282B27] text-sm mt-0.5 block">
                    {String(altezza_cm).includes('cm') ? altezza_cm : `${altezza_cm} cm`}
                  </span>
                </div>
              )}

              {peso_kg && (
                <div className="bg-[#F2F3EB] p-3 rounded-xl border border-[#B7BEA9]/40">
                  <span className="text-[#282B27]/60 block text-[11px]">Peso stimato</span>
                  <span className="font-bold text-[#282B27] text-sm mt-0.5 block">
                    {peso_kg} kg
                  </span>
                </div>
              )}
            </div>
          </div>

          {note && (
            <div className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs text-amber-900">
              <span className="font-bold block mb-0.5">Note fornitura:</span>
              {note}
            </div>
          )}
        </div>

        {/* Footer: Disponibilità lotto e Tasto Richiedi WhatsApp in Sicilian Orange */}
        <div className="p-4 sm:p-5 bg-[#F2F3EB] border-t border-[#B7BEA9]/40 flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#282B27]/60 block">
              Disponibili {vasoCorrente ? `(Ø ${vasoCorrente} cm)` : ''}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-extrabold text-[#25570A]">
                {dispCorrente !== null ? `${Number(dispCorrente).toLocaleString('it-IT')} pz` : 'In vivaio'}
              </span>
              {validoFino && (
                <span className="text-[11px] font-bold text-[#25570A] bg-[#25570A]/10 px-2 py-0.5 rounded-full">
                  Fino al {validoFino}
                </span>
              )}
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#EA4707] hover:bg-[#CF3B02] text-white rounded-xl text-sm font-bold shadow-md shadow-black/15 transition-all touch-target"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Richiedi su WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
