import React, { useState } from 'react';
import { Sprout, Warehouse, Eye, Layers } from 'lucide-react';

export default function CardPianta({ pianta, onOpenDetail }) {
  const {
    nome,
    nome_comune,
    categoria,
    vaso_cm,
    giacenza,
    disponibile,
    varianti,
    foto_url
  } = pianta;

  // Lista varianti normalizzata
  const elencoVarianti = Array.isArray(varianti) && varianti.length > 0
    ? varianti
    : [{ vaso_cm, giacenza, disponibile }];

  // Stato variante attiva (default: prima variante disponibile)
  const [varianteAttiva, setVarianteAttiva] = useState(elencoVarianti[0]);
  const [imgLoaded, setImgLoaded] = useState(false);

  const vasoCorrente = varianteAttiva?.vaso_cm ?? vaso_cm;
  const dispCorrente = varianteAttiva?.disponibile ?? disponibile ?? 0;
  const giacCorrente = varianteAttiva?.giacenza ?? giacenza ?? 0;

  const handleSelectVaso = (e, v) => {
    e.stopPropagation(); // Non scatena il click dell'intera card
    setVarianteAttiva(v);
  };

  const handleCardClick = () => {
    onOpenDetail({
      ...pianta,
      vaso_cm: vasoCorrente,
      disponibile: dispCorrente,
      giacenza: giacCorrente,
      varianteSelezionata: varianteAttiva
    });
  };

  const imgSource = varianteAttiva?.foto_url || foto_url;

  return (
    <article 
      onClick={handleCardClick}
      className="group bg-white rounded-2xl sm:rounded-3xl border border-[#25570A]/10 shadow-[0_4px_20px_-4px_rgba(37,87,10,0.06)] hover:shadow-[0_16px_32px_-8px_rgba(37,87,10,0.12)] hover:-translate-y-1 transition-all duration-500 flex flex-col h-full cursor-pointer overflow-hidden relative select-none animate-in fade-in-50 duration-500"
    >
      {/* 1. ZONA FOTO CON OVERLAY & BADGE MINIMALE */}
      <div className="relative aspect-[4/3] w-full bg-[#E5E7DC]/50 overflow-hidden">
        {imgSource ? (
          <img
            key={imgSource}
            src={imgSource}
            alt={nome}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 ${
              imgLoaded ? 'opacity-100 scale-100 blur-0' : 'opacity-0 scale-98 blur-xs'
            }`}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#B7BEA9] bg-[#E5E7DC]/30">
            <Sprout className="w-12 h-12 stroke-[1.2] text-[#25570A]/40 group-hover:scale-110 transition-transform duration-300" />
            <span className="text-[10px] font-bold tracking-[0.15em] text-[#25570A]/60 mt-2 uppercase">Lotto in serra</span>
          </div>
        )}

        {/* Gradiente sfumato morbido */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />

        {/* Categoria minimale */}
        {categoria && (
          <div className="absolute top-3 left-3 bg-[#1A3E07]/80 backdrop-blur-md text-white text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full border border-white/15">
            {categoria}
          </div>
        )}

        {/* Indicatore Stato Disponibilità */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-[#25570A] text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-xs">
          <span className="w-1.5 h-1.5 rounded-full bg-[#6BB221] animate-pulse"></span>
          <span>Pronto</span>
        </div>
      </div>

      {/* 2. CORPO SCHEDA BOTANICA */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Nome Botanico in Cormorant Garamond */}
          <h3 className="font-display font-semibold text-2xl text-[#25570A] leading-snug tracking-tight group-hover:text-[#6BB221] transition-colors">
            {nome}
          </h3>

          {nome_comune && (
            <p className="text-[#282B27]/65 text-xs sm:text-sm mt-0.5 line-clamp-1 italic font-serif">
              {nome_comune}
            </p>
          )}

          {/* Formati Vaso: capsule minimali */}
          <div className="mt-4 pt-3 border-t border-[#25570A]/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#282B27]/50">
                {elencoVarianti.length > 1 ? 'Formati disponibili' : 'Diametro vaso'}
              </span>
              {elencoVarianti.length > 1 && (
                <span className="text-[10px] font-bold text-[#25570A] bg-[#25570A]/5 px-2 py-0.5 rounded-md">
                  {elencoVarianti.length} calibri
                </span>
              )}
            </div>

            {/* Pulsanti vaso */}
            {elencoVarianti.length > 1 ? (
              <div className="flex flex-wrap items-center gap-1.5">
                {elencoVarianti.map((v, idx) => {
                  const isSelected = v.vaso_cm === vasoCorrente;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={(e) => handleSelectVaso(e, v)}
                      className={`min-h-[34px] px-3 py-1 rounded-lg text-xs font-semibold transition-all active:scale-95 flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#25570A] text-white shadow-xs'
                          : 'bg-[#F2F3EB] hover:bg-[#E5E7DC] text-[#282B27]/80'
                      }`}
                    >
                      <span>{v.vaso_cm ? `Ø ${v.vaso_cm} cm` : 'Std'}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#F2F3EB] text-[#282B27] text-xs font-semibold">
                <span>{vasoCorrente ? `Ø ${vasoCorrente} cm` : 'Calibro standard'}</span>
              </div>
            )}
          </div>
        </div>

        {/* 3. FOOTER DISPONIBILITÀ E SCHEDA TECNICA */}
        <div className="mt-5 pt-3 border-t border-[#25570A]/10 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-[#282B27]/50 block tracking-wider leading-none mb-1">
              Disponibili {elencoVarianti.length > 1 && vasoCorrente ? `Ø ${vasoCorrente}` : ''}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl sm:text-2xl font-bold text-[#25570A] leading-none">
                {dispCorrente !== null ? Number(dispCorrente).toLocaleString('it-IT') : '0'}
              </span>
              <span className="text-xs font-semibold text-[#25570A]/70">esemplari</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold text-[#25570A] bg-[#25570A]/5 group-hover:bg-[#25570A] group-hover:text-white transition-all duration-300">
            <span>Dettagli</span>
            <Eye className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </article>
  );
}
