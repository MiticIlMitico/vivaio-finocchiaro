import React from 'react';
import { MessageCircle, Sprout, ArrowUpRight } from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function CardPianta({ pianta, onOpenLightbox, onOpenDetail }) {
  const {
    nome,
    nome_comune,
    categoria,
    vaso_cm,
    pz_carrello,
    pz_pianale,
    disponibilita_carrelli,
    prezzo,
    foto_url
  } = pianta;

  // Link WhatsApp con messaggio chiaro
  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');
  const testoMessaggio = encodeURIComponent(
    `Salve Vivaio Finocchiaro, vorrei ordinare o richiedere disponibilità per: ${nome}${nome_comune ? ` (${nome_comune})` : ''} - Vaso Ø ${vaso_cm || '-'} cm`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${testoMessaggio}`;

  return (
    <article 
      onClick={() => onOpenDetail(pianta)}
      className="group bg-white rounded-2xl border border-stone-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col h-full cursor-pointer overflow-hidden"
    >
      {/* Immagine Pianta pulita, senza elementi che la coprono */}
      <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
        {foto_url ? (
          <img
            src={foto_url}
            alt={nome}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-300">
            <Sprout className="w-12 h-12 stroke-[1.5]" />
          </div>
        )}
      </div>

      {/* Contenuto sotto la foto con gerarchia chiara e naturale */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Categoria discreta */}
          {categoria && (
            <span className="text-[11px] font-medium text-emerald-800 tracking-wide uppercase block mb-1">
              {categoria}
            </span>
          )}

          {/* Nome botanico e comune */}
          <h3 className="font-semibold text-lg sm:text-xl text-stone-900 leading-snug group-hover:text-emerald-800 transition-colors">
            {nome}
          </h3>
          {nome_comune && (
            <p className="text-stone-500 text-xs sm:text-sm mt-0.5">
              {nome_comune}
            </p>
          )}

          {/* Specifiche tecniche ordinate sotto il titolo */}
          <div className="mt-3.5 pt-3 border-t border-stone-100 space-y-1.5 text-xs text-stone-600">
            <div className="flex items-center justify-between">
              <span className="text-stone-400">Diametro vaso</span>
              <span className="font-semibold text-stone-800">
                {vaso_cm ? `Ø ${vaso_cm} cm` : '-'}
              </span>
            </div>

            {pz_carrello && (
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Pezzi per carrello</span>
                <span className="font-semibold text-stone-800">{pz_carrello} pz</span>
              </div>
            )}

            {disponibilita_carrelli && (
              <div className="flex items-center justify-between">
                <span className="text-stone-400">Disponibilità</span>
                <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                  {disponibilita_carrelli}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Prezzo e Tasto Ordina */}
        <div className="mt-4 pt-3.5 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] uppercase font-semibold text-stone-400 block leading-none mb-1">
              Prezzo ingrosso
            </span>
            <span className="text-xl sm:text-2xl font-bold text-stone-900 leading-none">
              {prezzo ? `€ ${Number(prezzo).toFixed(2)}` : 'Su richiesta'}
            </span>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white rounded-xl text-xs font-semibold shadow-sm transition-all touch-target"
            aria-label={`Ordina ${nome} su WhatsApp`}
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Ordina</span>
          </a>
        </div>
      </div>
    </article>
  );
}
