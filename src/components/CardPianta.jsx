import React from 'react';
import { MessageCircle, Maximize2, Layers, Truck, Package, Scale, Sprout, ArrowUpRight, Info } from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function CardPianta({ pianta, onOpenLightbox, onOpenDetail }) {
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
    note
  } = pianta;

  // Link WhatsApp con messaggio precompilato
  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');
  const testoMessaggio = encodeURIComponent(
    `Salve Vivaio Finocchiaro, vorrei richiedere informazioni e disponibilità per:\n• ${nome}${nome_comune ? ` (${nome_comune})` : ''}\n• Vaso: Ø ${vaso_cm || '-'} cm\n• Prezzo di listino: € ${prezzo ? Number(prezzo).toFixed(2) : '-'}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${testoMessaggio}`;

  return (
    <article className="group bg-white rounded-3xl border border-stone-200/90 shadow-sm hover:shadow-xl hover:border-moss-300 transition-all duration-300 overflow-hidden flex flex-col h-full">
      {/* Contenitore Immagine */}
      <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
        {foto_url ? (
          <img
            src={foto_url}
            alt={`Foto botanica di ${nome}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-pointer"
            onClick={() => onOpenDetail(pianta)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100">
            <Sprout className="w-12 h-12 stroke-[1.5] mb-1 text-stone-300" />
            <span className="text-xs font-medium">Nessuna foto caricata</span>
          </div>
        )}

        {/* Gradiente sfumato alla base della foto */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none opacity-60" />

        {/* Badge Vaso sovrapposto */}
        {vaso_cm && (
          <div className="absolute top-3 left-3 bg-stone-950/85 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-xl shadow-md border border-white/10 flex items-center gap-1">
            <span className="text-emerald-400">Ø</span>
            <span>{vaso_cm} cm</span>
          </div>
        )}

        {/* Badge Categoria in alto a destra */}
        {categoria && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md text-stone-800 text-[10px] font-semibold px-2.5 py-1 rounded-lg shadow-sm border border-stone-200/60 hidden sm:block">
            {categoria}
          </div>
        )}

        {/* Badge Disponibilità in basso a sinistra della foto */}
        {disponibilita_carrelli && (
          <div className="absolute bottom-3 left-3 bg-emerald-700/90 backdrop-blur-md text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-emerald-200" />
            <span>Disp: {disponibilita_carrelli}</span>
          </div>
        )}

        {/* Pulsante Ingrandisci Lightbox rapido */}
        {foto_url && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenLightbox(foto_url, nome);
            }}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 backdrop-blur-md shadow-sm transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100 touch-target"
            title="Ingrandisci foto"
            aria-label={`Ingrandisci foto di ${nome}`}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Contenuto Card */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Intestazione Pianta */}
          <div className="mb-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 
                  onClick={() => onOpenDetail(pianta)}
                  className="font-display font-bold text-lg text-stone-900 leading-snug group-hover:text-moss-700 transition-colors cursor-pointer"
                >
                  {nome}
                </h3>
                {nome_comune && (
                  <p className="text-stone-500 text-xs mt-0.5 italic">
                    {nome_comune}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={() => onOpenDetail(pianta)}
                className="p-1.5 rounded-lg text-stone-400 hover:text-moss-700 hover:bg-moss-50 transition-colors flex-shrink-0"
                title="Visualizza scheda completa"
                aria-label="Scheda dettagli"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {tipologia && (
              <span className="inline-block mt-2 text-[11px] font-semibold text-moss-800 bg-moss-50 px-2.5 py-0.5 rounded-md border border-moss-200/60">
                {tipologia}
              </span>
            )}
          </div>

          {/* Griglia Dati Tecnici all'Ingrosso */}
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-stone-50/80 border border-stone-100 text-xs text-stone-600 mb-3">
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-moss-700 flex-shrink-0" />
              <span className="truncate">Pz/Pianale: <strong className="text-stone-900 font-semibold">{pz_pianale || '-'}</strong></span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-moss-700 flex-shrink-0" />
              <span className="truncate">Pz/Carrello: <strong className="text-stone-900 font-semibold">{pz_carrello || '-'}</strong></span>
            </div>

            {altezza_cm && (
              <div className="flex items-center gap-1.5 col-span-2 text-stone-500 pt-1 border-t border-stone-200/40">
                <span>Altezza: <strong className="text-stone-800 font-medium">{altezza_cm} cm</strong></span>
                {peso_kg && (
                  <span className="ml-auto text-stone-500">Peso: <strong className="text-stone-800 font-medium">{peso_kg} kg</strong></span>
                )}
              </div>
            )}
          </div>

          {note && (
            <p className="text-[11px] text-amber-900 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60 mb-3 line-clamp-2">
              {note}
            </p>
          )}
        </div>

        {/* Footer: Prezzo & Ordina WhatsApp */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="block text-[9px] uppercase tracking-wider font-bold text-stone-400">
              Listino Ingrosso
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-display font-bold text-stone-900">
                {prezzo ? `€ ${Number(prezzo).toFixed(2)}` : 'Su richiesta'}
              </span>
              {prezzo && <span className="text-[10px] text-stone-400 font-medium">+ IVA</span>}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onOpenDetail(pianta)}
              className="p-2.5 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors touch-target"
              title="Dettagli fornitura"
              aria-label="Dettagli fornitura"
            >
              <Info className="w-4 h-4" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-95 text-white rounded-xl text-xs font-semibold transition-all shadow-sm shadow-emerald-950/20 touch-target"
              aria-label={`Ordina ${nome} su WhatsApp`}
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Ordina</span>
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
