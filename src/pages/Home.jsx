import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AZIENDA } from '../content/azienda';
import CardPianta from '../components/CardPianta';
import DettaglioPiantaModal from '../components/DettaglioPiantaModal';
import Lightbox from '../components/Lightbox';
import { 
  Search, 
  Sprout, 
  MessageCircle, 
  Phone, 
  MapPin, 
  Mail, 
  RefreshCw, 
  AlertCircle,
  Clock
} from 'lucide-react';

export default function Home() {
  const [piante, setPiante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(null);

  // Filtri
  const [ricerca, setRicerca] = useState('');
  const [categoriaAttiva, setCategoriaAttiva] = useState('tutte');
  const [vasoFiltro, setVasoFiltro] = useState(null);

  // Modali
  const [piantaDettaglio, setPiantaDettaglio] = useState(null);
  const [lightboxData, setLightboxData] = useState({ isOpen: false, src: '', title: '' });

  const caricaPiante = async () => {
    setLoading(true);
    setErrore(null);
    try {
      const { data, error } = await supabase
        .from('piante')
        .select('*')
        .eq('visibile', true)
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      setPiante(data || []);
    } catch (err) {
      console.error('Errore nel caricamento del catalogo:', err);
      setErrore('Impossibile caricare il catalogo in questo momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    caricaPiante();
  }, []);

  // Categorie
  const categorie = useMemo(() => {
    const set = new Set();
    piante.forEach(p => {
      if (p.categoria) set.add(p.categoria);
    });
    return Array.from(set);
  }, [piante]);

  // Vasi
  const diametriVaso = useMemo(() => {
    const setVasi = new Set();
    piante.forEach(p => {
      if (p.vaso_cm) setVasi.add(Number(p.vaso_cm));
    });
    return Array.from(setVasi).sort((a, b) => a - b);
  }, [piante]);

  // Piante filtrate
  const pianteFiltrate = useMemo(() => {
    return piante.filter((p) => {
      const matchCategoria = categoriaAttiva === 'tutte' || p.categoria === categoriaAttiva;

      const q = ricerca.trim().toLowerCase();
      const matchTesto = q === '' ||
        p.nome.toLowerCase().includes(q) ||
        (p.nome_comune && p.nome_comune.toLowerCase().includes(q));

      const matchVaso = vasoFiltro === null || Number(p.vaso_cm) === Number(vasoFiltro);

      return matchCategoria && matchTesto && matchVaso;
    });
  }, [piante, categoriaAttiva, ricerca, vasoFiltro]);

  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-stone-800">
      {/* 1. HERO ACCOGLIENTE E NATURALE (Non AI-based) */}
      <section className="pt-10 pb-12 sm:pt-16 sm:pb-16 px-4 sm:px-6 max-w-4xl mx-auto text-center">
        <span className="text-xs font-semibold uppercase tracking-widest text-emerald-800 block mb-2">
          Listino all'ingrosso
        </span>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight leading-tight mb-3">
          {AZIENDA.nome}
        </h1>
        <p className="text-stone-600 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Produzione e fornitura professionale di piante per rivenditori, garden center e paesaggisti.
        </p>

        {/* Pulsante rapido WhatsApp discreto */}
        <div className="mt-5 flex items-center justify-center gap-3">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Salve Vivaio Finocchiaro, vorrei richiedere informazioni.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-full text-xs font-medium transition-colors shadow-sm touch-target"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>Contattaci su WhatsApp</span>
          </a>
        </div>
      </section>

      {/* 2. SEZIONE RICERCA INTERATTIVA: "Hai una pianta in mente?" */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 mb-8">
        <div className="bg-white rounded-2xl border border-stone-200/80 p-5 sm:p-6 shadow-sm">
          <div className="text-center sm:text-left mb-3">
            <h2 className="text-base sm:text-lg font-semibold text-stone-900">
              Hai una pianta in mente?
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Cercala per nome botanico o comune, oppure filtra per categoria e vaso.
            </p>
          </div>

          {/* Campo di Ricerca a Pillola Pulito */}
          <div className="relative mb-4">
            <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder="Es. Olivo, Limone, Crassula, Strelitzia..."
              className="w-full pl-10 pr-10 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white transition-all"
            />
            {ricerca && (
              <button
                onClick={() => setRicerca('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 p-1 font-medium"
              >
                Azzera
              </button>
            )}
          </div>

          {/* Filtro Categorie Pulito */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setCategoriaAttiva('tutte')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors touch-target flex-shrink-0 ${
                categoriaAttiva === 'tutte'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Tutte le piante ({piante.length})
            </button>

            {categorie.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaAttiva(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors touch-target flex-shrink-0 ${
                  categoriaAttiva === cat
                    ? 'bg-emerald-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filtro Diametri Vaso */}
          {diametriVaso.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <span className="text-[11px] font-medium text-stone-400 flex-shrink-0 mr-1">
                Vaso:
              </span>

              <button
                type="button"
                onClick={() => setVasoFiltro(null)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 touch-target ${
                  vasoFiltro === null
                    ? 'bg-stone-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Tutti
              </button>

              {diametriVaso.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setVasoFiltro(vasoFiltro === d ? null : d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 touch-target ${
                    vasoFiltro === d
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Ø {d} cm
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. GRIGLIA PIANTE (Spaziosa, ordinata, non ammassata) */}
      <main id="catalogo" className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex-1 pb-16">
        {/* Intestazione risultati */}
        <div className="flex items-center justify-between mb-4 px-1">
          <span className="text-xs font-medium text-stone-500">
            Mostrando <strong>{pianteFiltrate.length}</strong> {pianteFiltrate.length === 1 ? 'pianta' : 'piante'}
          </span>
          {(ricerca || categoriaAttiva !== 'tutte' || vasoFiltro !== null) && (
            <button
              onClick={() => { setRicerca(''); setCategoriaAttiva('tutte'); setVasoFiltro(null); }}
              className="text-xs text-emerald-800 hover:underline font-medium"
            >
              Rimuovi filtri
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-stone-200 p-4 animate-pulse">
                <div className="aspect-[4/3] bg-stone-200 rounded-xl mb-4"></div>
                <div className="h-5 bg-stone-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-stone-100 rounded w-1/3 mb-4"></div>
                <div className="h-10 bg-stone-100 rounded-lg"></div>
              </div>
            ))}
          </div>
        )}

        {/* Errore */}
        {errore && (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center my-6">
            <AlertCircle className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-stone-700 mb-3">{errore}</p>
            <button
              onClick={caricaPiante}
              className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-medium"
            >
              Ricarica
            </button>
          </div>
        )}

        {/* Stato Vuoto */}
        {!loading && !errore && pianteFiltrate.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center my-6">
            <Sprout className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="font-semibold text-lg text-stone-800 mb-1">
              Nessuna pianta trovata
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Nessuna varietà corrisponde ai filtri impostati.
            </p>
            <button
              onClick={() => { setRicerca(''); setCategoriaAttiva('tutte'); setVasoFiltro(null); }}
              className="px-4 py-2 bg-stone-800 text-white text-xs font-medium rounded-lg"
            >
              Mostra tutte le piante
            </button>
          </div>
        )}

        {/* Griglia Card Piante */}
        {!loading && !errore && pianteFiltrate.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
            {pianteFiltrate.map((pianta) => (
              <CardPianta
                key={pianta.id}
                pianta={pianta}
                onOpenLightbox={(src, title) => setLightboxData({ isOpen: true, src, title })}
                onOpenDetail={(p) => setPiantaDettaglio(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* 4. SEZIONE CONTATTI PULITA E DISCRETA */}
      <section className="bg-white border-t border-stone-200/80 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="font-semibold text-xl sm:text-2xl text-stone-900 mb-1">
              Informazioni & Logistica
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Spedizioni e carichi su carrelli CC e pianali standard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 text-center">
              <Phone className="w-5 h-5 text-emerald-800 mx-auto mb-1.5" />
              <span className="text-[11px] uppercase font-semibold text-stone-400 block">Telefono</span>
              <span className="text-sm font-semibold text-stone-800 block mt-0.5">{AZIENDA.contatti.telefono}</span>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-200/60 text-center transition-colors block"
            >
              <MessageCircle className="w-5 h-5 text-emerald-800 mx-auto mb-1.5" />
              <span className="text-[11px] uppercase font-semibold text-emerald-800 block">WhatsApp</span>
              <span className="text-sm font-semibold text-emerald-950 block mt-0.5">Scrivici per ordini</span>
            </a>

            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200/60 text-center">
              <MapPin className="w-5 h-5 text-emerald-800 mx-auto mb-1.5" />
              <span className="text-[11px] uppercase font-semibold text-stone-400 block">Località</span>
              <span className="text-xs font-semibold text-stone-800 block mt-0.5">{AZIENDA.contatti.indirizzo}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-stone-400 py-6 text-center text-xs">
        <p className="text-stone-300 font-medium">{AZIENDA.nome} &bull; P.IVA {AZIENDA.contatti.piva}</p>
        <p className="text-stone-500 text-[11px] mt-0.5">Vendita riservata esclusivamente a possessori di Partita IVA</p>
      </footer>

      {/* FAB WHATSAPP MOBILE */}
      <div className="fixed bottom-5 right-5 z-40 sm:hidden">
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Salve Vivaio Finocchiaro, vorrei informazioni sulle piante.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-13 h-13 p-3.5 rounded-full bg-emerald-800 text-white shadow-lg flex items-center justify-center active:scale-95 transition-transform touch-target"
          aria-label="Contatta su WhatsApp"
        >
          <MessageCircle className="w-6 h-6 fill-white/20" />
        </a>
      </div>

      {/* MODALE DETTAGLIO */}
      {piantaDettaglio && (
        <DettaglioPiantaModal
          pianta={piantaDettaglio}
          onClose={() => setPiantaDettaglio(null)}
          onOpenLightbox={(src, title) => setLightboxData({ isOpen: true, src, title })}
        />
      )}

      {/* LIGHTBOX */}
      {lightboxData.isOpen && (
        <Lightbox
          src={lightboxData.src}
          title={lightboxData.title}
          onClose={() => setLightboxData({ isOpen: false, src: '', title: '' })}
        />
      )}
    </div>
  );
}
