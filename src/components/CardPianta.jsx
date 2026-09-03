import React from 'react';
import { MessageCircle, Maximize2, Layers, Truck, Package, Scale, Sprout } from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function CardPianta({ pianta, onOpenLightbox }) {
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

  // Generazione del messaggio WhatsApp precompilato
  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');
  const testoMessaggio = encodeURIComponent(
    `Salve Vivaio Finocchiaro, vorrei richiedere informazioni e disponibilità per:\n• ${nome}${nome_comune ? ` (${nome_comune})` : ''}\n• Vaso: Ø ${vaso_cm || '-'} cm\n• Prezzo di listino: € ${prezzo ? Number(prezzo).toFixed(2) : '-'}`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${testoMessaggio}`;

  return (
    <article className="bg-white rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full group">
      {/* Immagine Pianta */}
      <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
        {foto_url ? (
          <img
            src={foto_url}
            alt={`Foto botanica di ${nome}`}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
            onClick={() => onOpenLightbox(foto_url, nome)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-400 bg-stone-100">
            <Sprout className="w-10 h-10 stroke-[1.5] mb-1 opacity-50" />
            <span className="text-xs font-medium">Nessuna foto</span>
          </div>
        )}

        {/* Badge Vaso sovrapposto */}
        {vaso_cm && (
          <div className="absolute top-3 left-3 bg-stone-900/85 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
            Vaso Ø {vaso_cm} cm
          </div>
        )}

        {/* Pulsante ingrandimento foto */}
        {foto_url && (
          <button
            onClick={() => onOpenLightbox(foto_url, nome)}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/85 hover:bg-white text-stone-700 hover:text-stone-900 backdrop-blur-md shadow-sm transition-all opacity-90 sm:opacity-0 sm:group-hover:opacity-100"
            aria-label={`Ingrandisci foto di ${nome}`}
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Corpo della Card */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Titoli */}
          <div className="mb-3">
            <h3 className="font-display font-semibold text-lg text-stone-900 leading-snug group-hover:text-moss-800 transition-colors">
              {nome}
            </h3>
            {nome_comune && (
              <p className="text-stone-500 text-xs mt-0.5 italic">
                {nome_comune}
              </p>
            )}
            {tipologia && (
              <p className="text-xs font-medium text-moss-700 mt-1">
                {tipologia}
              </p>
            )}
          </div>

          {/* Griglia Dati Tecnici Commerciali */}
          <div className="grid grid-cols-2 gap-2 py-3 border-y border-stone-100 text-xs text-stone-600 mb-3 bg-stone-50/60 rounded-lg p-2.5">
            <div className="flex items-center gap-1.5" title="Pezzi per pianale">
              <Layers className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span>Pz/Pianale: <strong className="text-stone-800">{pz_pianale || '-'}</strong></span>
            </div>
            
            <div className="flex items-center gap-1.5" title="Pezzi per carrello CC">
              <Package className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span>Pz/Carrello: <strong className="text-stone-800">{pz_carrello || '-'}</strong></span>
            </div>

            <div className="flex items-center gap-1.5" title="Disponibilità carrelli">
              <Truck className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span>Disponibilità: <strong className="text-stone-800">{disponibilita_carrelli || '-'}</strong></span>
            </div>

            <div className="flex items-center gap-1.5" title="Peso stimato">
              <Scale className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
              <span>Peso: <strong className="text-stone-800">{peso_kg ? `${peso_kg} kg` : '-'}</strong></span>
            </div>
          </div>

          {altezza_cm && (
            <div className="text-[11px] text-stone-500 mb-2">
              Altezza media: <span className="font-medium text-stone-700">{altezza_cm} cm</span>
            </div>
          )}

          {note && (
            <p className="text-[11px] text-clay-700 bg-clay-50/70 p-2 rounded border border-clay-100/70 mb-3">
              {note}
            </p>
          )}
        </div>

        {/* Footer Card: Prezzo e CTA WhatsApp */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <span className="block text-[10px] uppercase tracking-wider font-semibold text-stone-400">
              Listino Ingrosso
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-display font-bold text-stone-900">
                {prezzo ? `€ ${Number(prezzo).toFixed(2)}` : 'Su richiesta'}
              </span>
              {prezzo && <span className="text-[10px] text-stone-400 font-medium">+ IVA</span>}
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 touch-target"
            aria-label={`Ordina ${nome} su WhatsApp`}
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Ordina</span>
          </a>
        </div>
      </div>
    </article>
  );
}
