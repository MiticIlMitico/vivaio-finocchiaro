import React from 'react';
import { MessageCircle, Sprout, ArrowUpRight, Truck, Package } from 'lucide-react';
import { AZIENDA } from '../content/azienda';

export default function CardPianta({ pianta, onOpenLightbox, onOpenDetail }) {
  const {
    nome,
    nome_comune,
    vaso_cm,
    pz_carrello,
    disponibilita_carrelli,
    prezzo,
    foto_url
  } = pianta;

  // Link WhatsApp diretto con messaggio semplice
  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');
  const testoMessaggio = encodeURIComponent(
    `Salve, vorrei ordinare o avere informazioni per: ${nome} (Vaso Ø ${vaso_cm || '-'} cm)`
  );
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${testoMessaggio}`;

  return (
    <article 
      onClick={() => onOpenDetail(pianta)}
      className="group bg-white rounded-3xl border border-stone-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col h-full cursor-pointer"
    >
      {/* Immagine Pianta Grande */}
      <div className="relative aspect-[4/3] w-full bg-stone-100 overflow-hidden">
        {foto_url ? (
          <img
            src={foto_url}
            alt={nome}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-stone-300 bg-stone-100">
            <Sprout className="w-14 h-14 mb-1" />
          </div>
        )}

        {/* Badge Vaso Grande in alto a sinistra */}
        {vaso_cm && (
          <div className="absolute top-3.5 left-3.5 bg-stone-900/90 backdrop-blur-md text-white font-bold text-sm px-3.5 py-1.5 rounded-xl shadow-md border border-white/10">
            Vaso Ø {vaso_cm} cm
          </div>
        )}

        {/* Disponibilità Carrelli in basso */}
        {disponibilita_carrelli && (
          <div className="absolute bottom-3.5 left-3.5 bg-emerald-700/95 backdrop-blur-md text-white font-bold text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-200" />
            <span>{disponibilita_carrelli}</span>
          </div>
        )}
      </div>

      {/* Contenuto Essenziale con Testi Grandi */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Nome Pianta Grande */}
          <div className="mb-3">
            <h3 className="font-display font-bold text-xl sm:text-2xl text-stone-900 leading-snug group-hover:text-emerald-800 transition-colors">
              {nome}
            </h3>
            {nome_comune && (
              <p className="text-stone-500 text-sm font-medium mt-0.5">
                {nome_comune}
              </p>
            )}
          </div>

          {/* Dati Carrello sintetici e grandi */}
          {pz_carrello && (
            <div className="inline-flex items-center gap-2 bg-stone-100 text-stone-800 text-xs font-semibold px-3 py-1.5 rounded-xl mb-4">
              <Package className="w-4 h-4 text-emerald-700" />
              <span>{pz_carrello} pezzi / carrello</span>
            </div>
          )}
        </div>

        {/* Prezzo Grande e Pulsante Diretto WhatsApp */}
        <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
          <div>
            <div className="text-2xl sm:text-3xl font-display font-extrabold text-stone-900">
              {prezzo ? `€ ${Number(prezzo).toFixed(2)}` : 'Su richiesta'}
            </div>
          </div>

          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md shadow-emerald-950/20 transition-all touch-target"
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
