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
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  ArrowDown
} from 'lucide-react';

export default function Home() {
  const [piante, setPiante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(null);

  // Filtri semplici
  const [ricerca, setRicerca] = useState('');
  const [categoriaAttiva, setCategoriaAttiva] = useState('tutte');
  const [vasoFiltro, setVasoFiltro] = useState(null);

  // Modali
  const [piantaDettaglio, setPiantaDettaglio] = useState(null);
  const [lightboxData, setLightboxData] = useState({ isOpen: false, src: '', title: '' });

  // Caricamento piante visibili da Supabase
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
      setErrore('Impossibile caricare il catalogo. Riprova.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    caricaPiante();
  }, []);

  // Categorie uniche
  const categorie = useMemo(() => {
    const set = new Set();
    piante.forEach(p => {
      if (p.categoria) set.add(p.categoria);
    });
    return Array.from(set);
  }, [piante]);

  // Diametri vaso unici
  const diametriVaso = useMemo(() => {
    const setVasi = new Set();
    piante.forEach(p => {
      if (p.vaso_cm) setVasi.add(Number(p.vaso_cm));
    });
    return Array.from(setVasi).sort((a, b) => a - b);
  }, [piante]);

  // Filtraggio rapido
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
    <div className="min-h-screen flex flex-col bg-stone-100">
      {/* 1. HERO CHIARA, DIRETTA E CON TESTI GRANDI */}
      <section className="bg-stone-900 text-white pt-10 pb-16 sm:pt-16 sm:pb-24 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-emerald-800/80 text-emerald-200 text-xs sm:text-sm font-bold tracking-wide uppercase mb-4">
            Listino Ingrosso
          </span>

          <h1 className="font-display font-black text-4xl sm:text-6xl text-white tracking-tight leading-tight mb-4">
            {AZIENDA.nome}
          </h1>

          <p className="text-stone-300 text-lg sm:text-2xl font-medium mb-8">
            Piante all'ingrosso per rivenditori e garden center
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="#catalogo"
              className="px-6 py-4 bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-base rounded-2xl transition-all shadow-lg flex items-center gap-2 touch-target"
            >
              <span>Vedi le Piante ({piante.length})</span>
              <ArrowDown className="w-5 h-5" />
            </a>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Salve, vorrei informazioni sulle piante a listino.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-base rounded-2xl transition-all border border-white/20 flex items-center gap-2 touch-target"
            >
              <MessageCircle className="w-5 h-5" />
              <span>Ordina su WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* 2. CATALOGO PRINCIPALE (FILTRI SEMPLICI + MOSTRA SUBITO TUTTO) */}
      <main id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-20 flex-1 w-full pb-20">
        {/* Pannello Ricerca Semplice */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-md p-4 sm:p-6 mb-6">
          {/* Barra Ricerca Grande */}
          <div className="relative mb-4">
            <Search className="w-6 h-6 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder="Cerca per nome (es: Olivo, Limone, Crassula)..."
              className="w-full pl-14 pr-10 py-4 bg-stone-50 border border-stone-200 rounded-2xl text-base sm:text-lg font-medium text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
            />
            {ricerca && (
              <button
                onClick={() => setRicerca('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-stone-400 hover:text-stone-800 p-1"
              >
                Azzera
              </button>
            )}
          </div>

          {/* Filtro Categorie a Pulsanti Grandi */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setCategoriaAttiva('tutte')}
              className={`px-5 py-3 rounded-2xl text-sm sm:text-base font-bold whitespace-nowrap transition-all touch-target flex-shrink-0 ${
                categoriaAttiva === 'tutte'
                  ? 'bg-stone-900 text-white shadow-md'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              Tutte le piante ({piante.length})
            </button>

            {categorie.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaAttiva(cat)}
                className={`px-5 py-3 rounded-2xl text-sm sm:text-base font-bold whitespace-nowrap transition-all touch-target flex-shrink-0 ${
                  categoriaAttiva === cat
                    ? 'bg-stone-900 text-white shadow-md'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filtro Diametri Vaso a Chip Grandi */}
          {diametriVaso.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400 flex-shrink-0 mr-1">
                Vaso:
              </span>

              <button
                type="button"
                onClick={() => setVasoFiltro(null)}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors touch-target flex-shrink-0 ${
                  vasoFiltro === null
                    ? 'bg-emerald-800 text-white'
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
                  className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors touch-target flex-shrink-0 ${
                    vasoFiltro === d
                      ? 'bg-emerald-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Ø {d} cm
                </button>
              ))}
            </div>
          )}
        </div>

        {/* STATO CARICAMENTO */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-stone-200 animate-pulse">
                <div className="aspect-[4/3] bg-stone-200 rounded-2xl mb-4"></div>
                <div className="h-6 bg-stone-200 rounded w-2/3 mb-3"></div>
                <div className="h-10 bg-stone-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        )}

        {/* STATO ERRORE */}
        {errore && (
          <div className="bg-white rounded-3xl p-8 text-center text-stone-800 border border-stone-200 my-6">
            <AlertCircle className="w-10 h-10 text-stone-400 mx-auto mb-3" />
            <p className="text-base font-bold mb-3">{errore}</p>
            <button
              onClick={caricaPiante}
              className="px-5 py-2.5 bg-emerald-700 text-white rounded-xl font-bold text-sm"
            >
              Ricarica
            </button>
          </div>
        )}

        {/* STATO VUOTO */}
        {!loading && !errore && pianteFiltrate.length === 0 && (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 my-6">
            <Sprout className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <h3 className="font-display font-bold text-2xl text-stone-800 mb-2">
              Nessuna pianta trovata
            </h3>
            <button
              onClick={() => { setRicerca(''); setCategoriaAttiva('tutte'); setVasoFiltro(null); }}
              className="mt-2 px-6 py-3 bg-stone-900 text-white font-bold text-sm rounded-xl"
            >
              Mostra tutte le piante
            </button>
          </div>
        )}

        {/* GRIGLIA PIANTE DIRETTA (TUTTO VISIBILE SUBITO) */}
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

      {/* 3. SEZIONE CONTATTI SEMPLICE E DIRETTA */}
      <section id="contatti" className="bg-white border-t border-stone-200 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-stone-900 mb-3">
            Contatti & Spedizioni
          </h2>
          <p className="text-stone-600 text-base sm:text-lg mb-8 max-w-xl mx-auto">
            Ordini settimanali e consegne su carrelli CC e pianali standard.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <a 
              href={`tel:${AZIENDA.contatti.telefono}`}
              className="p-5 rounded-2xl bg-stone-50 hover:bg-stone-100 border border-stone-200 transition-colors flex flex-col items-center justify-center text-stone-900"
            >
              <Phone className="w-6 h-6 text-emerald-700 mb-2" />
              <span className="text-xs font-bold uppercase text-stone-400">Telefono</span>
              <span className="font-bold text-base mt-1">{AZIENDA.contatti.telefono}</span>
            </a>

            <a 
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors flex flex-col items-center justify-center text-emerald-950"
            >
              <MessageCircle className="w-6 h-6 text-emerald-700 mb-2" />
              <span className="text-xs font-bold uppercase text-emerald-700">WhatsApp</span>
              <span className="font-bold text-base mt-1">Scrivici su WhatsApp</span>
            </a>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 flex flex-col items-center justify-center text-stone-900">
              <MapPin className="w-6 h-6 text-emerald-700 mb-2" />
              <span className="text-xs font-bold uppercase text-stone-400">Sede</span>
              <span className="font-bold text-sm mt-1">{AZIENDA.contatti.indirizzo}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-stone-400 py-8 text-center text-xs">
        <p className="font-semibold text-stone-300">{AZIENDA.nome} &bull; P.IVA {AZIENDA.contatti.piva}</p>
        <p className="mt-1 text-stone-500">Listino riservato ad operatori professionali con P.IVA</p>
      </footer>

      {/* FAB WHATSAPP MOBILE */}
      <div className="fixed bottom-5 right-5 z-40 sm:hidden">
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Salve, vorrei informazioni sulle disponibilità.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-emerald-700 text-white shadow-2xl flex items-center justify-center active:scale-95 transition-transform touch-target"
          aria-label="Contatta su WhatsApp"
        >
          <MessageCircle className="w-7 h-7 fill-white/20" />
        </a>
      </div>

      {/* MODALE SCHEDA RAPIDA DETTAGLIO */}
      {piantaDettaglio && (
        <DettaglioPiantaModal
          pianta={piantaDettaglio}
          onClose={() => setPiantaDettaglio(null)}
          onOpenLightbox={(src, title) => setLightboxData({ isOpen: true, src, title })}
        />
      )}

      {/* LIGHTBOX SCHERMO INTERO */}
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
