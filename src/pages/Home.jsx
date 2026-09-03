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
  AlertCircle,
  ChevronDown
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
      {/* 1. SEZIONE HERO A SCHERMO INTERO (100vh da telefono con foto di sfondo suggestiva) */}
      <section className="relative min-h-[calc(100svh-4rem)] sm:min-h-[90vh] flex flex-col justify-between items-center text-white px-5 py-12 sm:py-20 overflow-hidden">
        {/* Immagine di sfondo ad alta risoluzione (Serra / Vivaio) */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=2000&q=85"
            alt="Serra Vivaio Finocchiaro"
            className="w-full h-full object-cover"
          />
          {/* Gradiente elegante per garantire leggibilità assoluta ai testi */}
          <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/65 to-stone-900/50" />
        </div>

        {/* Spazio superiore per centratura verticale */}
        <div className="w-full"></div>

        {/* Contenuto Centrale della Hero */}
        <div className="relative z-10 max-w-2xl mx-auto text-center py-6">
          <span className="inline-block px-3.5 py-1 rounded-full bg-emerald-900/70 border border-emerald-500/30 text-emerald-200 text-xs font-semibold tracking-wider uppercase mb-4 backdrop-blur-md">
            Catalogo & Listino Professionale
          </span>

          <h1 className="font-display text-4xl sm:text-6xl font-bold tracking-tight leading-[1.15] mb-4 text-white">
            {AZIENDA.nome}
          </h1>

          <p className="text-stone-200 text-base sm:text-lg max-w-lg mx-auto leading-relaxed mb-8 font-normal">
            Forniture di piante all'ingrosso per garden center, rivenditori e professionisti del verde.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm mx-auto">
            <a
              href="#ricerca"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-sm rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 touch-target"
            >
              <span>Esplora il Catalogo</span>
              <ChevronDown className="w-4 h-4" />
            </a>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Salve Vivaio Finocchiaro, vorrei richiedere informazioni sulle piante.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-semibold text-sm rounded-xl transition-all border border-white/20 backdrop-blur-md flex items-center justify-center gap-2 touch-target"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Contatta su WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Indicatore di scorrimento in fondo alla prima schermata */}
        <div className="relative z-10 text-center pb-2 animate-bounce">
          <a
            href="#ricerca"
            className="text-stone-300 hover:text-white text-xs font-medium flex flex-col items-center gap-1 transition-colors"
            aria-label="Scorri per cercare"
          >
            <span>Scorri per cercare</span>
            <ChevronDown className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* 2. SECONDA SEZIONE: "HAI UNA PIANTA IN MENTE?" (Ben spaziata e pulita) */}
      <section id="ricerca" className="py-14 sm:py-20 px-4 sm:px-6 max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight mb-2">
            Hai una pianta in mente?
          </h2>
          <p className="text-stone-500 text-sm sm:text-base max-w-md mx-auto">
            Cercala per nome botanico o comune, oppure filtra rapidamente per categoria e vaso.
          </p>
        </div>

        {/* Box di Ricerca Elegante */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-4 sm:p-5 space-y-4">
          {/* Barra Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder="Es. Olivo, Limone, Crassula, Sansevieria..."
              className="w-full pl-11 pr-10 py-3.5 bg-stone-50 border border-stone-200 rounded-xl text-sm sm:text-base text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-800 focus:bg-white transition-all"
            />
            {ricerca && (
              <button
                onClick={() => setRicerca('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-stone-400 hover:text-stone-700 p-1 font-semibold"
              >
                Azzera
              </button>
            )}
          </div>

          {/* Filtro Categorie */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setCategoriaAttiva('tutte')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors touch-target flex-shrink-0 ${
                categoriaAttiva === 'tutte'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Tutte ({piante.length})
            </button>

            {categorie.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaAttiva(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors touch-target flex-shrink-0 ${
                  categoriaAttiva === cat
                    ? 'bg-emerald-800 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filtro Vasi */}
          {diametriVaso.length > 0 && (
            <div className="pt-3 border-t border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
              <span className="text-[11px] font-medium text-stone-400 flex-shrink-0 mr-1">
                Vaso:
              </span>

              <button
                type="button"
                onClick={() => setVasoFiltro(null)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 touch-target ${
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
                  className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex-shrink-0 touch-target ${
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
      </section>

      {/* 3. TERZA SEZIONE: VISUALIZZAZIONE DELLE CARD PIANTE (Con ampi spazi) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 w-full flex-1 pb-20 sm:pb-24">
        {/* Intestazione e Conteggio Risultati */}
        <div className="flex items-center justify-between mb-6 px-1">
          <span className="text-xs font-medium text-stone-500">
            Disponibili <strong>{pianteFiltrate.length}</strong> varietà
          </span>

          {(ricerca || categoriaAttiva !== 'tutte' || vasoFiltro !== null) && (
            <button
              onClick={() => { setRicerca(''); setCategoriaAttiva('tutte'); setVasoFiltro(null); }}
              className="text-xs text-emerald-800 hover:underline font-medium"
            >
              Azzera tutti i filtri
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

        {/* Nessun Risultato */}
        {!loading && !errore && pianteFiltrate.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center my-6">
            <Sprout className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <h3 className="font-semibold text-lg text-stone-800 mb-1">
              Nessuna pianta trovata
            </h3>
            <p className="text-xs text-stone-500 mb-4">
              Nessuna varietà corrisponde alla ricerca impostata.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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

      {/* 4. SEZIONE CONTATTI E LOGISTICA */}
      <section id="contatti" className="bg-white border-t border-stone-200/80 py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-semibold text-2xl text-stone-900 mb-1">
              Informazioni & Spedizioni
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Carichi veloci e consegne settimanali su carrelli CC e pianali standard.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/60 text-center">
              <Phone className="w-5 h-5 text-emerald-800 mx-auto mb-2" />
              <span className="text-[11px] uppercase font-semibold text-stone-400 block">Telefono</span>
              <span className="text-sm font-semibold text-stone-800 block mt-1">{AZIENDA.contatti.telefono}</span>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-5 rounded-2xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200/60 text-center transition-colors block"
            >
              <MessageCircle className="w-5 h-5 text-emerald-800 mx-auto mb-2" />
              <span className="text-[11px] uppercase font-semibold text-emerald-800 block">WhatsApp</span>
              <span className="text-sm font-semibold text-emerald-950 block mt-1">Scrivici per ordini</span>
            </a>

            <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200/60 text-center">
              <MapPin className="w-5 h-5 text-emerald-800 mx-auto mb-2" />
              <span className="text-[11px] uppercase font-semibold text-stone-400 block">Sede & Carico</span>
              <span className="text-xs font-semibold text-stone-800 block mt-1">{AZIENDA.contatti.indirizzo}</span>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-stone-400 py-6 text-center text-xs">
        <p className="text-stone-300 font-medium">{AZIENDA.nome} &bull; P.IVA {AZIENDA.contatti.piva}</p>
        <p className="text-stone-500 text-[11px] mt-0.5">Vendita riservata esclusivamente ad operatori professionali con Partita IVA</p>
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
