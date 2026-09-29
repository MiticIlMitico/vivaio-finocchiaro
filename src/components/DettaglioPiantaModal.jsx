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
  Warehouse,
  Sprout,
  Info
} from 'lucide-react';
import { AZIENDA } from '../content/azienda';
import { normalizzaCampiVisibili } from '../lib/campiConfig';

export default function DettaglioPiantaModal({ pianta, validoFino, campiVisibili, mostraGiacenze = true, onClose, onOpenLightbox }) {
  const vis = normalizzaCampiVisibili(
    campiVisibili || { giacenza: mostraGiacenze }
  );

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
    prezzo,
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
  const quantitaTesto = vis.disponibile && dispCorrente !== null ? ` (Disponibili: ${dispCorrente} pz)` : '';
  const testoMessaggio = encodeURIComponent(
    `Salve ${AZIENDA.nome}, vorrei richiedere quotazione e dettagli fornitura per: ${nome}${nome_comune ? ` (${nome_comune})` : ''} - Vaso Ø ${vasoCorrente || '-'} cm${quantitaTesto}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${testoMessaggio}`;

  const imgSource = varianteAttiva?.foto_url || foto_url;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#122A04]/75 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white w-full max-w-xl rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#B7BEA9]/60 overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Immagine con altezza calibrata per mostrare immediatamente i dettagli tecnici */}
        <div className="relative h-48 sm:h-64 w-full bg-[#F2F3EB] flex-shrink-0 overflow-hidden">
          {imgSource ? (
            <img 
              key={imgSource}
              src={imgSource} 
              alt={nome} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#B7BEA9] bg-[#F2F3EB]">
              <Sprout className="w-12 h-12 text-[#25570A]/30 mb-1" />
              <span className="text-xs font-semibold text-[#25570A]/70 uppercase tracking-wider">
                Foto del lotto in arrivo
              </span>
            </div>
          )}

          {/* Gradiente superiore per leggibilità tasti */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

          {/* Chiudi */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 active:scale-95 text-white flex items-center justify-center backdrop-blur-md transition-all touch-target z-10 shadow-md"
            aria-label="Chiudi scheda"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Tasto Ingrandisci Foto (Apre Lightbox) */}
          {imgSource && (
            <button
              type="button"
              onClick={() => onOpenLightbox && onOpenLightbox(imgSource, nome)}
              className="absolute top-3 left-3 px-3.5 py-1.5 rounded-full bg-black/60 hover:bg-black/85 active:scale-95 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-md transition-all z-10 shadow-md touch-target"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Ingrandisci foto</span>
            </button>
          )}

          {/* Badge Scheda Botanica */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase border border-white/20 flex items-center gap-1.5">
            <Info className="w-3 h-3 text-[#6BB221]" />
            <span>Scheda Dettagli Fornitura</span>
          </div>
        </div>

        {/* Informazioni e Scheda Tecnica Completa */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {/* Intestazione Pianta */}
          <div>
            {categoria && (
              <span className="text-[11px] font-bold text-[#6BB221] tracking-wider uppercase block mb-1">
                {categoria}
              </span>
            )}
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-[#25570A] leading-snug">
              {nome}
            </h2>
            {vis.nome_comune && (
              <p className="text-[#282B27]/70 text-sm mt-0.5 italic">
                {nome_comune || 'Esemplare selezionato'}
              </p>
            )}
            {vis.tipologia && (
              <div className="mt-1.5">
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#25570A] bg-[#25570A]/8 px-2.5 py-0.5 rounded-md border border-[#25570A]/15">
                  <Sprout className="w-3 h-3 text-[#25570A]/70" />
                  <span>{tipologia || 'Pianta ornamentale da vivaio'}</span>
                </span>
              </div>
            )}
          </div>

          {/* Formati Vaso Selezionabili o Badge Calibro */}
          {vis.vaso_cm && (
            elencoVarianti.length > 1 ? (
              <div className="p-3.5 bg-[#F2F3EB] rounded-2xl border border-[#B7BEA9]/50">
                <span className="text-xs font-bold uppercase tracking-wider text-[#282B27]/70 block mb-2">
                  Seleziona calibro vaso:
                </span>
                <div className="flex flex-wrap gap-2">
                  {elencoVarianti.map((v, idx) => {
                    const isSelected = v.vaso_cm === vasoCorrente;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setVarianteAttiva(v)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
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
            ) : (
              vasoCorrente && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#25570A]/5 border border-[#25570A]/15 text-[#25570A] text-xs font-semibold">
                  <Ruler className="w-3.5 h-3.5 text-[#25570A]/70" />
                  <span>Calibro vaso principale: <strong>Ø {vasoCorrente} cm</strong></span>
                </div>
              )
            )
          )}

          {/* Tabella Dati e Logistica aggiornata per il vaso selezionato */}
          <div className="pt-2 border-t border-[#B7BEA9]/30">
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              {/* Disponibilità Vendita (se visibile) */}
              {vis.disponibile && (
                <div className={`p-3 rounded-xl border border-[#25570A]/20 bg-[#25570A]/10 ${!vis.giacenza ? 'col-span-2' : ''}`}>
                  <span className="text-[#25570A] block text-[11px] font-bold flex items-center justify-between gap-1">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#6BB221]" />
                      {`Disponibilità ${vasoCorrente && vis.vaso_cm ? `(Ø ${vasoCorrente} cm)` : ''}`}
                    </span>
                  </span>
                  <span className="font-extrabold text-[#25570A] text-base mt-0.5 block">
                    {dispCorrente !== null ? `${Number(dispCorrente).toLocaleString('it-IT')} pz` : 'Disponibile su richiesta'}
                  </span>
                  {validoFino && (
                    <span className="text-[10px] text-[#25570A]/85 font-bold block mt-1">
                      Valide fino al {validoFino}
                    </span>
                  )}
                </div>
              )}

              {/* Giacenza Magazzino (se visibile) */}
              {vis.giacenza && (
                <div className={`p-3 rounded-xl border border-amber-300 bg-amber-50/70 ${!vis.disponibile ? 'col-span-2' : ''}`}>
                  <span className="text-amber-900 block text-[11px] font-semibold flex items-center gap-1">
                    <Warehouse className="w-3.5 h-3.5 text-amber-700" />
                    Giacenza magazzino
                  </span>
                  <span className="font-bold text-amber-950 text-base mt-0.5 block">
                    {giacCorrente !== null ? `${Number(giacCorrente).toLocaleString('it-IT')} pz` : 'In vivaio'}
                  </span>
                </div>
              )}

              {/* Se né disponibilità vendita né giacenza sono visibili: Stato Fornitura */}
              {!vis.disponibile && !vis.giacenza && (
                <div className="col-span-2 p-3 rounded-xl border border-[#25570A]/20 bg-[#25570A]/10">
                  <span className="text-[#25570A] block text-[11px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#6BB221]" />
                    {`Stato Fornitura ${vasoCorrente && vis.vaso_cm ? `(Ø ${vasoCorrente} cm)` : ''}`}
                  </span>
                  <span className="font-extrabold text-[#25570A] text-base mt-0.5 block">
                    Pronto in serra per il carico
                  </span>
                  {validoFino && (
                    <span className="text-[10px] text-[#25570A]/85 font-bold block mt-1">
                      Listino valido fino al {validoFino}
                    </span>
                  )}
                </div>
              )}

              {/* Diametro Vaso */}
              {vis.vaso_cm && (
                <div className="bg-[#F2F3EB] p-3 rounded-xl border border-[#B7BEA9]/40">
                  <span className="text-[#282B27]/60 block text-[11px]">Diametro vaso</span>
                  <span className="font-bold text-[#282B27] text-sm mt-0.5 block">
                    {vasoCorrente ? `Ø ${vasoCorrente} cm` : 'Standard'}
                  </span>
                </div>
              )}

              {/* Pezzi per Carrello CC */}
              {vis.pz_carrello && (
                <div className="bg-[#F2F3EB] p-3 rounded-xl border border-[#B7BEA9]/40">
                  <span className="text-[#282B27]/60 block text-[11px]">Pezzi per carrello CC</span>
                  <span className="font-bold text-[#282B27] text-sm mt-0.5 block">
                    {pz_carrello ? `${pz_carrello} pz` : 'Standard CC'}
                  </span>
                </div>
              )}

              {/* Pezzi per Pianale */}
              {vis.pz_pianale && (
                <div className="bg-[#F2F3EB] p-3 rounded-xl border border-[#B7BEA9]/40">
                  <span className="text-[#282B27]/60 block text-[11px]">Pezzi per pianale</span>
                  <span className="font-bold text-[#282B27] text-sm mt-0.5 block">
                    {pz_pianale ? `${pz_pianale} pz` : 'Standard'}
                  </span>
                </div>
              )}

              {/* Disponibilità Carrelli */}
              {vis.disponibilita_carrelli && (
                <div className="bg-[#25570A]/10 p-3 rounded-xl border border-[#25570A]/20">
                  <span className="text-[#25570A] block text-[11px] font-semibold">Carrelli pronti</span>
                  <span className="font-bold text-[#25570A] text-sm mt-0.5 block">
                    {disponibilita_carrelli ? `${disponibilita_carrelli}` : 'Su richiesta'}
                  </span>
                </div>
              )}

              {/* Altezza Pianta */}
              {vis.altezza_cm && (
                <div className="bg-[#F2F3EB] p-3 rounded-xl border border-[#B7BEA9]/40">
                  <span className="text-[#282B27]/60 block text-[11px] flex items-center gap-1">
                    <Ruler className="w-3.5 h-3.5 text-[#25570A]" />
                    Altezza pianta
                  </span>
                  <span className="font-bold text-[#282B27] text-sm mt-0.5 block">
                    {altezza_cm ? (String(altezza_cm).includes('cm') ? altezza_cm : `${altezza_cm} cm`) : 'Calibrata serra'}
                  </span>
                </div>
              )}

              {/* Peso Stimato */}
              {vis.peso_kg && (
                <div className="bg-[#F2F3EB] p-3 rounded-xl border border-[#B7BEA9]/40">
                  <span className="text-[#282B27]/60 block text-[11px]">Peso stimato</span>
                  <span className="font-bold text-[#282B27] text-sm mt-0.5 block">
                    {peso_kg ? `${peso_kg} kg` : 'Standard'}
                  </span>
                </div>
              )}

              {/* Prezzo Unitario */}
              {vis.prezzo && (
                <div className="bg-[#25570A]/10 p-3 rounded-xl border border-[#25570A]/20">
                  <span className="text-[#25570A] block text-[11px] font-semibold">Prezzo unitario</span>
                  <span className="font-bold text-[#25570A] text-sm mt-0.5 block">
                    {prezzo ? `€ ${Number(prezzo).toFixed(2)} + IVA` : 'Quotazione riservata'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Descrizione Botanica e Commerciale */}
          <div className="pt-2 border-t border-[#B7BEA9]/30">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#282B27]/50 block mb-1">
              Dettagli Fornitura & Coltivazione:
            </span>
            <p className="text-[#282B27]/80 text-xs sm:text-sm leading-relaxed">
              {descrizione || 'Lotto selezionato e acclimatato alle pendici dell\'Etna con radici solide e chioma vigorosa. Imballaggio professionale su carrelli CC e consegna concordata per garden center e grossisti.'}
            </p>
          </div>

          {/* Note di Fornitura se presenti */}
          {vis.note && note && (
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
              {vis.disponibile
                ? `Disponibilità ${vasoCorrente && vis.vaso_cm ? `(Ø ${vasoCorrente} cm)` : ''}`
                : vis.giacenza
                ? `Giacenza ${vasoCorrente && vis.vaso_cm ? `(Ø ${vasoCorrente} cm)` : ''}`
                : `Stato fornitura ${vasoCorrente && vis.vaso_cm ? `(Ø ${vasoCorrente} cm)` : ''}`}
            </span>
            <div className="flex items-baseline gap-2">
              {vis.disponibile ? (
                <span className="text-xl sm:text-2xl font-extrabold text-[#25570A]">
                  {dispCorrente !== null ? `${Number(dispCorrente).toLocaleString('it-IT')} pz` : 'In vivaio'}
                </span>
              ) : vis.giacenza ? (
                <span className="text-xl sm:text-2xl font-extrabold text-amber-800">
                  {giacCorrente !== null ? `${Number(giacCorrente).toLocaleString('it-IT')} pz` : 'In vivaio'}
                </span>
              ) : (
                <span className="text-lg sm:text-xl font-extrabold text-[#25570A] flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6BB221] animate-pulse inline-block"></span>
                  Pronto in serra
                </span>
              )}
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
            className="inline-flex items-center gap-2 px-5 py-3 bg-[#EA4707] hover:bg-[#CF3B02] text-white rounded-xl text-sm font-bold shadow-md shadow-black/15 transition-all touch-target active:scale-95"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Richiedi su WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}

