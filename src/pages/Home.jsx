import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AZIENDA } from '../content/azienda';
import CardPianta from '../components/CardPianta';
import DettaglioPiantaModal from '../components/DettaglioPiantaModal';
import Lightbox from '../components/Lightbox';
import SectionReveal from '../components/SectionReveal';
import { 
  Search, 
  Sprout, 
  MessageCircle, 
  Phone, 
  MapPin, 
  AlertCircle,
  ChevronDown,
  ArrowDown,
  Plus,
  Mail,
  Building2,
  Truck,
  Calendar,
  X,
  ArrowRight
} from 'lucide-react';

export default function Home() {
  const [piante, setPiante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(null);
  const [validoFino, setValidoFino] = useState('31 Agosto 2026');
  const [mostraGiacenze, setMostraGiacenze] = useState(true);

  // Filtri catalogo
  const [ricerca, setRicerca] = useState('');
  const [categoriaAttiva, setCategoriaAttiva] = useState('tutte');
  const [vasoFiltro, setVasoFiltro] = useState(null);

  // Paginazione progressiva (6 piante alla volta)
  const [visibiliCount, setVisibiliCount] = useState(6);

  // Modali e Menu Mobile
  const [piantaDettaglio, setPiantaDettaglio] = useState(null);
  const [lightboxData, setLightboxData] = useState({ isOpen: false, src: '', title: '' });
  const [fabMenuOpen, setFabMenuOpen] = useState(false);

  // Galleria Paesaggi Vivaio
  const fotoPaesaggi = [
    { src: '/brand/paesaggio-1.jpg', alt: 'Serre di coltivazione alle pendici dell\'Etna', caption: 'Serre e coltivazioni alle pendici dell\'Etna' },
    { src: '/brand/paesaggio-2.jpg', alt: 'Panoramica vivaio Campo dei Fiori a Santa Venerina', caption: 'Panoramica vivaio a Santa Venerina' },
    { src: '/brand/paesaggio-3.jpg', alt: 'Appezzamenti e filari di piante ornamentali', caption: 'Appezzamenti e filari piante' },
    { src: '/brand/paesaggio-4.jpg', alt: 'Vista collinare del vivaio Campo dei Fiori', caption: 'Vista collinare della tenuta' },
    { src: '/brand/paesaggio-5.jpg', alt: 'Aree di coltivazione ed esposizione solare', caption: 'Campi di coltivazione in pieno sole' },
  ];
  const [paesaggioIndex, setPaesaggioIndex] = useState(0);

  const caricaDati = async () => {
    setLoading(true);
    setErrore(null);
    try {
      // 1. Carica catalogo piante visibili
      const { data, error } = await supabase
        .from('piante')
        .select('*')
        .eq('visibile', true)
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      setPiante(data || []);

      // 2. Carica periodo di validità listino e visibilità giacenze
      const { data: impData } = await supabase
        .from('impostazioni')
        .select('chiave, valore');

      if (impData && Array.isArray(impData)) {
        const vf = impData.find(i => i.chiave === 'valido_fino');
        if (vf?.valore) setValidoFino(vf.valore);

        const mg = impData.find(i => i.chiave === 'mostra_giacenze');
        if (mg?.valore !== undefined) {
          setMostraGiacenze(mg.valore === 'true');
        }
      }
    } catch (err) {
      console.error('Errore nel caricamento del catalogo:', err);
      setErrore('Impossibile caricare il catalogo in questo momento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    caricaDati();
  }, []);

  // Categorie univoche
  const categorie = useMemo(() => {
    const set = new Set();
    piante.forEach(p => {
      if (p.categoria) set.add(p.categoria);
    });
    return Array.from(set);
  }, [piante]);

  // Diametri vasi disponibili
  const diametriVaso = useMemo(() => {
    const setVasi = new Set();
    piante.forEach(p => {
      if (p.vaso_cm) setVasi.add(Number(p.vaso_cm));
      if (Array.isArray(p.varianti)) {
        p.varianti.forEach(v => {
          if (v.vaso_cm) setVasi.add(Number(v.vaso_cm));
        });
      }
    });
    return Array.from(setVasi).sort((a, b) => a - b);
  }, [piante]);

  // Reset del contatore visibili ogni volta che cambiano i filtri (sempre 6 di base)
  useEffect(() => {
    setVisibiliCount(6);
  }, [ricerca, categoriaAttiva, vasoFiltro]);

  // Piante filtrate
  const pianteFiltrate = useMemo(() => {
    return piante.filter((p) => {
      const matchCategoria = categoriaAttiva === 'tutte' || p.categoria === categoriaAttiva;

      const q = ricerca.trim().toLowerCase();
      const matchTesto = q === '' ||
        p.nome.toLowerCase().includes(q) ||
        (p.nome_comune && p.nome_comune.toLowerCase().includes(q));

      let matchVaso = true;
      if (vasoFiltro !== null) {
        const haNelVasoPrincipale = Number(p.vaso_cm) === Number(vasoFiltro);
        const haNelleVarianti = Array.isArray(p.varianti) && p.varianti.some(v => Number(v.vaso_cm) === Number(vasoFiltro));
        matchVaso = haNelVasoPrincipale || haNelleVarianti;
      }

      return matchCategoria && matchTesto && matchVaso;
    });
  }, [piante, categoriaAttiva, ricerca, vasoFiltro]);

  // Piante visibili correnti (6 di base + 6 alla volta)
  const pianteVisibili = useMemo(() => {
    return pianteFiltrate.slice(0, visibiliCount);
  }, [pianteFiltrate, visibiliCount]);

  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252824]">
      
      {/* 1. SEZIONE HERO: ESATTAMENTE 100DVH / 100VH A TUTTO SCHERMO SU QUALSIASI DISPOSITIVO */}
      <section id="hero" className="relative w-full h-screen h-[100dvh] min-h-[100dvh] max-h-[100dvh] flex flex-col justify-between items-center text-white overflow-hidden bg-stone-950">
        {/* Foto reale del vivaio ultra-ottimizzata con srcset e WebP responsive */}
        <div className="absolute inset-0 z-0">
          <picture>
            <source media="(max-width: 768px)" srcSet="/brand/hero-cover-mobile.webp" type="image/webp" />
            <source srcSet="/brand/hero-cover.webp" type="image/webp" />
            <img
              src="/brand/hero-cover.jpg"
              alt="Vivaio Campo dei Fiori a Santa Venerina"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-center"
            />
          </picture>
          {/* Sfumatura cinematografica neutra in basso */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-transparent" />
          {/* Sfumatura morbida superiore direttamente sulla foto (più compatta rispetto a sotto) */}
          <div className="absolute top-0 inset-x-0 h-36 sm:h-44 bg-gradient-to-b from-black/65 via-black/25 to-transparent pointer-events-none" />
        </div>

        {/* Spaziatore superiore calibrato sull'altezza della Navbar fissa */}
        <div className="w-full h-20 sm:h-24 flex-shrink-0" />

        {/* Contenuto Centrale della Hero - Focus Assoluto sul Logo Ufficiale White Grande */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex-1 flex flex-col items-center justify-center">
          
          <h1 className="sr-only">Campo dei Fiori — Floricoltura e Vivaio All'Ingrosso</h1>

          {/* Logo Ufficiale White Grande al Centro */}
          <div className="mb-6 sm:mb-8 flex items-center justify-center w-full">
            <picture>
              <source srcSet="/brand/logo-horizontal-white.svg" type="image/svg+xml" />
              <img
                src="/brand/logo-horizontal-white.webp"
                alt="Campo dei Fiori — Ornamental Plants Sicily"
                className="w-[88vw] max-w-[340px] sm:max-w-[520px] md:max-w-[640px] lg:max-w-[720px] h-auto object-contain drop-shadow-[0_4px_24px_rgba(0,0,0,0.7)] transform hover:scale-[1.01] transition-transform duration-500"
                width="720"
                height="136"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
          </div>

          <p className="text-white/95 text-sm sm:text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed mb-8 drop-shadow-md">
            Forniture e catalogo piante all'ingrosso per garden center, grossisti e professionisti del verde.
          </p>

          {/* Azioni Rapide */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 w-full max-w-md mx-auto">
            <a
              href="#catalogo"
              className="w-full sm:w-auto px-8 py-3.5 bg-[#D34816] hover:bg-[#B83E12] active:scale-95 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-full transition-all shadow-lg flex items-center justify-center gap-2 touch-target"
            >
              <span>Esplora il Listino</span>
              <ArrowDown className="w-4 h-4" />
            </a>

            <a
              href="#contatti"
              className="w-full sm:w-auto px-7 py-3.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-full transition-all border border-white/30 flex items-center justify-center gap-2 touch-target"
            >
              <Phone className="w-4 h-4" />
              <span>Contatto Ordini</span>
            </a>
          </div>
        </div>

        {/* Indicatore discreto di scorrimento a fondo schermata */}
        <div className="relative z-10 h-16 sm:h-20 flex-shrink-0 flex items-center justify-center pb-2">
          <a
            href="#storia"
            className="inline-flex flex-col items-center gap-1 text-xs uppercase tracking-widest text-white/70 hover:text-white transition-colors"
            aria-label="Scorri per scoprire il vivaio"
          >
            <span className="text-[10px] font-semibold">Scopri il vivaio</span>
            <ChevronDown className="w-4 h-4 animate-bounce" />
          </a>
        </div>
      </section>


      {/* 2. SEZIONE IL VIVAIO & IL TERRITORIO (Editoriale pulito, colori naturali e rilassanti) */}
      <section id="storia" className="py-20 sm:py-28 px-5 sm:px-8 max-w-7xl mx-auto w-full">
        <SectionReveal>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Immagini Autentiche (Su mobile appare DOPO il testo) */}
            <div className="lg:col-span-5 space-y-4 order-2 lg:order-1">
              <div 
                className="rounded-3xl overflow-hidden shadow-lg aspect-[4/3] sm:aspect-[4/5] bg-stone-100 border border-stone-200/80 relative group cursor-pointer"
                onClick={() => setLightboxData({ 
                  isOpen: true, 
                  src: fotoPaesaggi[paesaggioIndex].src, 
                  title: `${fotoPaesaggi[paesaggioIndex].caption} • Campo dei Fiori` 
                })}
              >
                <img
                  key={fotoPaesaggi[paesaggioIndex].src}
                  src={fotoPaesaggi[paesaggioIndex].src}
                  alt={fotoPaesaggi[paesaggioIndex].alt}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-103"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-4 inset-x-4 flex items-center justify-between text-white">
                  <span className="text-xs sm:text-sm font-medium drop-shadow-sm">
                    {fotoPaesaggi[paesaggioIndex].caption}
                  </span>
                  <span className="text-[10px] font-bold bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full uppercase tracking-wider border border-white/30">
                    {paesaggioIndex + 1} / {fotoPaesaggi.length}
                  </span>
                </div>
              </div>

              {/* 5 Miniature per navigare le foto autentiche del vivaio */}
              <div className="grid grid-cols-5 gap-2">
                {fotoPaesaggi.map((item, idx) => (
                  <button
                    key={item.src}
                    type="button"
                    onClick={() => setPaesaggioIndex(idx)}
                    className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all duration-200 touch-target ${
                      paesaggioIndex === idx
                        ? 'border-[#25570A] ring-2 ring-[#25570A]/30 scale-102 shadow-sm'
                        : 'border-stone-200 opacity-60 hover:opacity-100'
                    }`}
                    aria-label={`Visualizza foto vivaio ${idx + 1}`}
                  >
                    <img
                      src={item.src}
                      alt={item.alt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>

              <p className="text-xs text-[#252824]/60 italic text-center">
                Tenuta e serre di coltivazione a Santa Venerina (Catania) &bull; Pendici dell'Etna
              </p>
            </div>

            {/* Racconto Aziendale Naturale (Su mobile appare PRIMA) */}
            <div className="lg:col-span-7 space-y-6 order-1 lg:order-2">
              <span className="text-[#25570A] text-xs font-bold tracking-[0.2em] uppercase block">
                Santa Venerina &bull; Sicilia
              </span>

              <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#25570A] leading-[1.15] tracking-tight">
                Dalla terra minerale dell'Etna ai mercati di tutta Europa.
              </h2>

              <div className="space-y-4 text-[#252824]/80 text-sm sm:text-base leading-relaxed">
                <p>
                  Il microclima delle pendici dell'Etna offre una combinazione unica di soleggiamento costante ed escursione termica equilibrata: le piante sviluppano radici solide, chiome vigorose e colorazioni intense, perfette per una tenuta impeccabile durante il trasporto refrigerato e nei garden center.
                </p>
              </div>

              {/* Punti Guida di Produzione */}
              <div className="pt-6 border-t border-stone-200 space-y-5">
                <div className="flex items-start gap-4">
                  <span className="font-display font-bold text-xl text-[#25570A] pt-0.5">01</span>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-[#252824]">Terra Vulcanica Minerale</h3>
                    <p className="text-xs text-[#252824]/70 mt-0.5">Il suolo etneo stimola apparati radicali compatti e longevi.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="font-display font-bold text-xl text-[#25570A] pt-0.5">02</span>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-[#252824]">Lotti Calibrati e Uniformi</h3>
                    <p className="text-xs text-[#252824]/70 mt-0.5">Forniture uniformi per diametro vaso, altezza e sviluppo fogliare.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </SectionReveal>
      </section>


      {/* 3. SEZIONE CATALOGO & LISTINO ALL'INGROSSO */}
      <section id="catalogo" className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        
        {/* Intestazione Catalogo con Validità Disponibilità in Grande Risalto */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 mb-8 pb-6 border-b border-stone-200">
          <div>
            <span className="text-[#25570A] text-xs font-bold tracking-[0.2em] uppercase block mb-1">
              Giacenze & Magazzino
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#25570A] tracking-tight">
              Listino Piante
            </h2>
          </div>

          {/* Banner Evidente Validità Disponibilità */}
          <div className="inline-flex items-center gap-3.5 px-5 py-3.5 rounded-2xl bg-gradient-to-r from-[#25570A]/10 via-[#6BB221]/15 to-[#25570A]/5 border-2 border-[#25570A]/30 shadow-xs">
            <div className="w-11 h-11 rounded-xl bg-[#25570A] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Calendar className="w-6 h-6 text-[#FAF9F6]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#252824]/60 block">
                  Periodo di Validità
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#25570A] text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6BB221] animate-pulse"></span>
                  Attivo
                </span>
              </div>
              <p className="text-base sm:text-lg font-black text-[#25570A] mt-0.5 tracking-tight">
                Disponibili fino al <span className="underline decoration-[#6BB221] decoration-2 underline-offset-2">{validoFino}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Filtri & Ricerca Puliti */}
        <div className="space-y-4 mb-10">
          {/* Input di Ricerca */}
          <div className="relative">
            <Search className="w-5 h-5 text-[#252824]/40 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder="Cerca specie botanica o nome comune (es. Olivo, Bougainvillea, Limone, Crassula...)"
              className="w-full pl-12 pr-12 py-3.5 bg-white border border-stone-200 rounded-full text-sm sm:text-base text-[#252824] placeholder-[#252824]/40 focus:outline-none focus:ring-2 focus:ring-[#25570A] transition-all shadow-xs"
            />
            {ricerca && (
              <button
                onClick={() => setRicerca('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[#252824]/50 hover:text-[#252824] p-1 font-bold"
              >
                Azzera
              </button>
            )}
          </div>

          {/* Filtro Categorie */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              type="button"
              onClick={() => setCategoriaAttiva('tutte')}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                categoriaAttiva === 'tutte'
                  ? 'bg-[#25570A] text-white shadow-xs'
                  : 'bg-white text-[#252824]/75 hover:bg-stone-100 border border-stone-200'
              }`}
            >
              Tutte le varietà ({piante.length})
            </button>

            {categorie.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategoriaAttiva(cat)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  categoriaAttiva === cat
                    ? 'bg-[#25570A] text-white shadow-xs'
                    : 'bg-white text-[#252824]/75 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Filtro Diametro Vasi */}
          {diametriVaso.length > 0 && (
            <div className="pt-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#252824]/50 mr-1 flex-shrink-0">
                Calibro:
              </span>

              <button
                type="button"
                onClick={() => setVasoFiltro(null)}
                className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                  vasoFiltro === null
                    ? 'bg-[#25570A] text-white'
                    : 'bg-white text-[#252824]/70 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                Tutti i diametri
              </button>

              {diametriVaso.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setVasoFiltro(vasoFiltro === d ? null : d)}
                  className={`px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-colors flex-shrink-0 ${
                    vasoFiltro === d
                      ? 'bg-[#25570A] text-white'
                      : 'bg-white text-[#252824]/70 hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  Ø {d} cm
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Conteggio Risultati */}
        <div className="flex items-center justify-between mb-8 px-1">
          <span className="text-xs sm:text-sm font-medium text-[#252824]/70">
            Trovate <strong>{pianteFiltrate.length}</strong> varietà botaniche
          </span>

          {(ricerca || categoriaAttiva !== 'tutte' || vasoFiltro !== null) && (
            <button
              onClick={() => { setRicerca(''); setCategoriaAttiva('tutte'); setVasoFiltro(null); }}
              className="text-xs text-[#25570A] hover:underline font-bold"
            >
              Azzera filtri
            </button>
          )}
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-5 animate-pulse border border-stone-200">
                <div className="aspect-[4/3] bg-stone-200 rounded-2xl mb-4"></div>
                <div className="h-6 bg-stone-200 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-stone-100 rounded w-1/3 mb-4"></div>
                <div className="h-10 bg-stone-100 rounded-xl"></div>
              </div>
            ))}
          </div>
        )}

        {/* Errore */}
        {errore && (
          <div className="bg-white rounded-3xl border border-red-200 p-8 text-center my-6 shadow-sm">
            <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-red-700 mb-3">{errore}</p>
            <button
              onClick={caricaDati}
              className="px-5 py-2.5 bg-[#25570A] text-white rounded-xl text-xs font-bold"
            >
              Ricarica Catalogo
            </button>
          </div>
        )}

        {/* Nessun Risultato */}
        {!loading && !errore && pianteFiltrate.length === 0 && (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center my-6">
            <Sprout className="w-10 h-10 text-[#25570A] mx-auto mb-2" />
            <h3 className="font-display font-bold text-xl text-[#25570A] mb-1">
              Nessuna varietà trovata
            </h3>
            <p className="text-xs sm:text-sm text-[#252824]/60 mb-4">
              Nessuna pianta corrisponde ai parametri impostati.
            </p>
            <button
              onClick={() => { setRicerca(''); setCategoriaAttiva('tutte'); setVasoFiltro(null); }}
              className="px-5 py-2 bg-[#25570A] text-white text-xs font-bold rounded-full"
            >
              Mostra tutte le varietà
            </button>
          </div>
        )}

        {/* Griglia Card Piante */}
        {!loading && !errore && pianteVisibili.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {pianteVisibili.map((pianta) => (
              <CardPianta
                key={pianta.id}
                pianta={pianta}
                mostraGiacenze={mostraGiacenze}
                onOpenLightbox={(src, title) => setLightboxData({ isOpen: true, src, title })}
                onOpenDetail={(p) => setPiantaDettaglio(p)}
              />
            ))}
          </div>
        )}

        {/* PULSANTE CARICA ALTRE PIANTE (Paginazione a 6 alla volta) */}
        {!loading && !errore && pianteFiltrate.length > visibiliCount && (
          <div className="mt-14 text-center">
            <button
              onClick={() => setVisibiliCount(prev => prev + 6)}
              className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-[#25570A] hover:bg-[#1A3E07] active:scale-95 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-full shadow-md transition-all touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>
                Carica altre varietà (+6) &bull; visualizzate {visibiliCount} di {pianteFiltrate.length}
              </span>
            </button>
          </div>
        )}
      </section>





      {/* 5. SEZIONE CONTATTA IL VIVAIO */}
      <section id="contatti" className="py-20 sm:py-28 px-5 sm:px-8 max-w-6xl mx-auto w-full">
        <SectionReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#25570A] text-xs font-bold tracking-[0.2em] uppercase block mb-1">
              Recapiti & Reparti
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#25570A]">
              Contatta il Vivaio
            </h2>
            <p className="text-xs sm:text-sm text-[#252824]/70 mt-2">
              Richiesta quotazioni all'ingrosso, disponibilità lotti, amministrazione e logistica.
            </p>
          </div>

          {/* I 4 Quadratini / Caselle dei Reparti (interamente cliccabili) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            
            {/* 1. Ufficio Vendite */}
            <a
              href={`tel:${AZIENDA.contatti.ufficioVendite.telefono.replace(/\s+/g, '')}`}
              className="p-6 rounded-3xl bg-white border border-stone-200/80 hover:border-[#25570A] hover:shadow-lg transition-all shadow-xs flex flex-col justify-between group cursor-pointer active:scale-98"
              title="Tocca per chiamare l'Ufficio Vendite"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#25570A]/8 group-hover:bg-[#25570A] group-hover:text-white transition-colors flex items-center justify-center text-[#25570A]">
                    <Phone className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#25570A] bg-[#25570A]/8 px-2.5 py-1 rounded-full group-hover:bg-[#25570A] group-hover:text-white transition-colors flex items-center gap-1">
                    <span>Chiama</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#252824]/50 block">
                  Commerciale
                </span>
                <h3 className="text-base font-bold text-[#25570A] mt-0.5 group-hover:text-[#1A3E07]">
                  Ufficio Vendite
                </h3>
                <p className="text-xs text-[#252824]/60 mt-1 mb-4">
                  Listino ingrosso e disponibilità piante
                </p>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-stone-100 text-xs">
                <span className="font-bold text-[#25570A] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#25570A]/70" />
                  <span>{AZIENDA.contatti.ufficioVendite.telefono}</span>
                </span>
              </div>
            </a>

            {/* 2. Ufficio Amministrazione */}
            <div
              className="p-6 rounded-3xl bg-white border border-stone-200/80 hover:border-[#25570A] hover:shadow-lg transition-all shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#25570A]/8 group-hover:bg-[#25570A] group-hover:text-white transition-colors flex items-center justify-center text-[#25570A]">
                    <Building2 className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>
                  <a
                    href={`tel:${AZIENDA.contatti.ufficioAmministrazione.telefono.replace(/\s+/g, '')}`}
                    className="text-[10px] font-bold uppercase tracking-wider text-[#25570A] bg-[#25570A]/8 px-2.5 py-1 rounded-full group-hover:bg-[#25570A] group-hover:text-white transition-colors flex items-center gap-1"
                    title="Chiama telefono fisso amministrazione"
                  >
                    <span>Chiama</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#252824]/50 block">
                  Contabilità
                </span>
                <h3 className="text-base font-bold text-[#25570A] mt-0.5 group-hover:text-[#1A3E07]">
                  Ufficio Amministrazione
                </h3>
                <p className="text-xs text-[#252824]/60 mt-1 mb-4">
                  Fatturazione elettronica e pagamenti
                </p>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-stone-100 text-xs">
                <a
                  href={`tel:${AZIENDA.contatti.ufficioAmministrazione.telefono.replace(/\s+/g, '')}`}
                  className="font-bold text-[#25570A] hover:underline flex items-center justify-between group/t1 py-0.5"
                  title="Chiama linea fissa amministrazione"
                >
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#25570A]/70" />
                    <span>{AZIENDA.contatti.ufficioAmministrazione.telefono}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-stone-400 group-hover/t1:text-[#25570A]">Fisso</span>
                </a>
                <a
                  href={`tel:${AZIENDA.contatti.ufficioAmministrazione.telefono2.replace(/\s+/g, '')}`}
                  className="font-bold text-[#25570A] hover:underline flex items-center justify-between group/t2 py-0.5"
                  title="Chiama cellulare amministrazione"
                >
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#25570A]/70" />
                    <span>{AZIENDA.contatti.ufficioAmministrazione.telefono2}</span>
                  </span>
                  <span className="text-[10px] font-semibold text-stone-400 group-hover/t2:text-[#25570A]">Cellulare</span>
                </a>
                <a 
                  href={`mailto:${AZIENDA.contatti.ufficioAmministrazione.email}`}
                  className="text-stone-600 hover:text-[#25570A] flex items-center gap-1.5 truncate hover:underline pt-0.5"
                  title="Invia email all'amministrazione"
                >
                  <Mail className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="truncate">{AZIENDA.contatti.ufficioAmministrazione.email}</span>
                </a>
              </div>
            </div>

            {/* 3. Produzione Interna */}
            <div
              className="p-6 rounded-3xl bg-white border border-stone-200/80 hover:border-[#25570A] hover:shadow-lg transition-all shadow-xs flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#25570A]/8 group-hover:bg-[#25570A] group-hover:text-white transition-colors flex items-center justify-center text-[#25570A]">
                    <Sprout className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>
                  <a
                    href={`tel:${AZIENDA.contatti.produzioneInterna.telefono.replace(/\s+/g, '')}`}
                    className="text-[10px] font-bold uppercase tracking-wider text-[#25570A] bg-[#25570A]/8 px-2.5 py-1 rounded-full group-hover:bg-[#25570A] group-hover:text-white transition-colors flex items-center gap-1"
                    title="Chiama Produzione Interna"
                  >
                    <span>Chiama</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#252824]/50 block">
                  Coltivazioni
                </span>
                <h3 className="text-base font-bold text-[#25570A] mt-0.5 group-hover:text-[#1A3E07]">
                  Produzione Interna
                </h3>
                <p className="text-xs text-[#252824]/60 mt-1 mb-4">
                  Gestione coltivazioni, serre e lotti
                </p>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-stone-100 text-xs">
                <a
                  href={`tel:${AZIENDA.contatti.produzioneInterna.telefono.replace(/\s+/g, '')}`}
                  className="font-bold text-[#25570A] hover:underline flex items-center gap-1.5 py-0.5"
                  title="Chiama telefono produzione"
                >
                  <Phone className="w-3.5 h-3.5 text-[#25570A]/70" />
                  <span>{AZIENDA.contatti.produzioneInterna.telefono}</span>
                </a>
                <a 
                  href={`mailto:${AZIENDA.contatti.produzioneInterna.email}`}
                  className="text-stone-600 hover:text-[#25570A] flex items-center gap-1.5 truncate hover:underline pt-0.5"
                  title="Invia email alla produzione"
                >
                  <Mail className="w-3.5 h-3.5 text-stone-400 flex-shrink-0" />
                  <span className="truncate">{AZIENDA.contatti.produzioneInterna.email}</span>
                </a>
              </div>
            </div>

            {/* 4. Logistica & Spedizioni */}
            <a
              href={`tel:${AZIENDA.contatti.logisticaSpedizioni.telefono.replace(/\s+/g, '')}`}
              className="p-6 rounded-3xl bg-white border border-stone-200/80 hover:border-[#25570A] hover:shadow-lg transition-all shadow-xs flex flex-col justify-between group cursor-pointer active:scale-98"
              title="Tocca per chiamare Logistica & Spedizioni"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#25570A]/8 group-hover:bg-[#25570A] group-hover:text-white transition-colors flex items-center justify-center text-[#25570A]">
                    <Truck className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#25570A] bg-[#25570A]/8 px-2.5 py-1 rounded-full group-hover:bg-[#25570A] group-hover:text-white transition-colors flex items-center gap-1">
                    <span>Chiama</span>
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#252824]/50 block">
                  Trasporti
                </span>
                <h3 className="text-base font-bold text-[#25570A] mt-0.5 group-hover:text-[#1A3E07]">
                  Logistica & Spedizioni
                </h3>
                <p className="text-xs text-[#252824]/60 mt-1 mb-4">
                  Pianificazione carichi e partenze
                </p>
              </div>
              <div className="space-y-1.5 pt-3 border-t border-stone-100 text-xs">
                <span className="font-bold text-[#25570A] flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#25570A]/70" />
                  <span>{AZIENDA.contatti.logisticaSpedizioni.telefono}</span>
                </span>
              </div>
            </a>

          </div>

          {/* Sedi Aziendali: Sede Legale & Sito Produttivo + Tasto WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            {/* Sede Legale */}
            <div className="md:col-span-4 p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 flex items-start gap-4 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#25570A]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-[#25570A]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#252824]/50 block">
                  Sede Legale
                </span>
                <h4 className="text-sm font-bold text-[#25570A] mt-0.5">
                  Santa Venerina (CT)
                </h4>
                <p className="text-xs text-[#252824]/70 mt-1">
                  {AZIENDA.sedi.legale.indirizzo}
                </p>
              </div>
            </div>

            {/* Sito Produttivo */}
            <div className="md:col-span-4 p-5 sm:p-6 rounded-3xl bg-white border border-stone-200/80 flex items-start gap-4 shadow-xs">
              <div className="w-10 h-10 rounded-2xl bg-[#25570A]/8 flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-5 h-5 text-[#25570A]" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#252824]/50 block">
                  Sito Produttivo
                </span>
                <h4 className="text-sm font-bold text-[#25570A] mt-0.5">
                  Pasteria (CT)
                </h4>
                <p className="text-xs text-[#252824]/70 mt-1">
                  {AZIENDA.sedi.produzione.indirizzo} &bull; Serre e vivai di coltivazione
                </p>
              </div>
            </div>

            {/* WhatsApp Diretto */}
            <div className="md:col-span-4">
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Salve, vorrei richiedere informazioni e disponibilità piante all'ingrosso.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="h-full p-5 sm:p-6 rounded-3xl bg-[#D34816] hover:bg-[#B83E12] text-white flex items-center justify-between transition-all shadow-md active:scale-98 group"
              >
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 block">
                    Canale Diretto
                  </span>
                  <span className="text-base font-bold text-white block mt-0.5">
                    WhatsApp Vendite
                  </span>
                  <span className="text-xs text-white/80 block mt-0.5">
                    Risposta rapida ordini e lotti
                  </span>
                </div>
                <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 text-white fill-white/20" />
                </div>
              </a>
            </div>

          </div>
        </SectionReveal>
      </section>


      {/* 6. FOOTER EDITORIALE (Con logo orizzontale autentico e dettagli societari) */}
      <footer className="bg-[#141714] text-[#FAF9F6] border-t border-stone-800 py-16 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-800 items-start">
            
            {/* Logo ufficiale con scritta inclusa in versione bianca per fondo scuro */}
            <div className="md:col-span-4 space-y-4">
              <a
                href="#hero"
                onClick={(e) => {
                  e.preventDefault();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-block group focus:outline-none cursor-pointer"
                title="Torna all'inizio - Campo dei Fiori"
              >
                <picture>
                  <source srcSet="/brand/logo-horizontal-white.svg" type="image/svg+xml" />
                  <img
                    src="/brand/logo-horizontal-white.webp"
                    alt="Campo dei Fiori - Ornamental Plants Sicily"
                    loading="lazy"
                    decoding="async"
                    className="h-11 w-auto object-contain transition-transform duration-300 group-hover:scale-103"
                  />
                </picture>
              </a>
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
                Coltivazione e vendita all'ingrosso riservata esclusivamente a garden center, grossisti e operatori professionali con Partita IVA.
              </p>
            </div>

            {/* Dati Societari & Sedi */}
            <div className="md:col-span-3 space-y-2 text-xs text-stone-400">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6BB221] block mb-2">
                Dati Societari
              </span>
              <p><strong className="text-white font-semibold">Ragione Sociale:</strong><br />{AZIENDA.ragioneSociale}</p>
              <p><strong className="text-white font-semibold">Sede Legale:</strong><br />{AZIENDA.sedi.legale.indirizzo}</p>
              <p><strong className="text-white font-semibold">Sito Produttivo:</strong><br />{AZIENDA.sedi.produzione.indirizzo}</p>
              <p><strong className="text-white font-semibold">Partita IVA:</strong> {AZIENDA.contatti.piva}</p>
              <p><strong className="text-white font-semibold">PEC:</strong><br /><span className="break-all">{AZIENDA.contatti.pec}</span></p>
            </div>

            {/* Recapiti Reparti Diretti */}
            <div className="md:col-span-5 space-y-3 text-xs text-stone-400">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6BB221] block mb-2">
                Recapiti Reparti
              </span>
              
              <div className="space-y-0.5">
                <span className="text-white font-semibold block text-[11px]">Ufficio Vendite:</span>
                <p className="flex flex-wrap items-center gap-x-2">
                  <a href={`tel:${AZIENDA.contatti.ufficioVendite.telefono.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                    {AZIENDA.contatti.ufficioVendite.telefono}
                  </a>
                  <span className="text-stone-600">&bull;</span>
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:underline">
                    WhatsApp
                  </a>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-white font-semibold block text-[11px]">Ufficio Amministrazione:</span>
                <p className="flex flex-wrap items-center gap-x-2">
                  <a href={`tel:${AZIENDA.contatti.ufficioAmministrazione.telefono.replace(/\s+/g, '')}`} className="hover:text-white transition-colors" title="Telefono Fisso">
                    Tel. {AZIENDA.contatti.ufficioAmministrazione.telefono}
                  </a>
                  <span className="text-stone-600">&bull;</span>
                  <a href={`tel:${AZIENDA.contatti.ufficioAmministrazione.telefono2.replace(/\s+/g, '')}`} className="hover:text-white transition-colors" title="Cellulare">
                    Cell. {AZIENDA.contatti.ufficioAmministrazione.telefono2}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${AZIENDA.contatti.ufficioAmministrazione.email}`} className="text-stone-300 hover:text-white transition-colors">
                    {AZIENDA.contatti.ufficioAmministrazione.email}
                  </a>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-white font-semibold block text-[11px]">Produzione Interna:</span>
                <p className="flex flex-wrap items-center gap-x-2">
                  <a href={`tel:${AZIENDA.contatti.produzioneInterna.telefono.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                    Tel. {AZIENDA.contatti.produzioneInterna.telefono}
                  </a>
                  <span className="text-stone-600">&bull;</span>
                  <a href={`mailto:${AZIENDA.contatti.produzioneInterna.email}`} className="text-stone-300 hover:text-white transition-colors">
                    {AZIENDA.contatti.produzioneInterna.email}
                  </a>
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-white font-semibold block text-[11px]">Logistica &amp; Spedizioni:</span>
                <p>
                  <a href={`tel:${AZIENDA.contatti.logisticaSpedizioni.telefono.replace(/\s+/g, '')}`} className="hover:text-white transition-colors">
                    Tel. {AZIENDA.contatti.logisticaSpedizioni.telefono}
                  </a>
                </p>
              </div>

              <div className="pt-1.5 border-t border-stone-800 text-[11px]">
                <span className="text-stone-400">Email Generale: </span>
                <a href={`mailto:${AZIENDA.contatti.email}`} className="text-stone-300 hover:text-white transition-colors">
                  {AZIENDA.contatti.email}
                </a>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-stone-500 gap-4">
            <p>&copy; {new Date().getFullYear()} {AZIENDA.ragioneSociale}. Tutti i diritti riservati.</p>
            <p className="text-[11px] uppercase tracking-widest font-mono text-[#6BB221]">
              Coltivato alle pendici dell'Etna &bull; Sicilia
            </p>
          </div>
        </div>
      </footer>


      {/* FAB MULTI-REPARTO MOBILE A VENTAGLIO (Speed Dial) */}
      <div className="fixed bottom-5 right-5 z-40 sm:hidden flex flex-col items-end pointer-events-none">
        {/* Backdrop quando aperto */}
        {fabMenuOpen && (
          <div 
            onClick={() => setFabMenuOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 pointer-events-auto animate-in fade-in duration-200"
            aria-hidden="true"
          />
        )}

        {/* I Bottoni a Ventaglio che si aprono verso l'alto */}
        {fabMenuOpen && (
          <div className="relative z-50 flex flex-col items-end gap-3 mb-3 pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-300">
            
            {/* 1. Ufficio Vendite */}
            <div className="flex items-center gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-200 fill-mode-both" style={{ animationDelay: '50ms' }}>
              <span className="bg-white/95 backdrop-blur-md text-[#25570A] text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-stone-200">
                1. Ufficio Vendite
              </span>
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Salve, vorrei mettermi in contatto con l'Ufficio Vendite di Campo dei Fiori.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setFabMenuOpen(false)}
                className="w-12 h-12 rounded-full bg-[#25D366] text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Contatta Ufficio Vendite su WhatsApp"
              >
                <MessageCircle className="w-5 h-5 fill-white/20" />
              </a>
            </div>

            {/* 2. Ufficio Amministrazione Fisso */}
            <div className="flex items-center gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-200 fill-mode-both" style={{ animationDelay: '80ms' }}>
              <span className="bg-white/95 backdrop-blur-md text-[#25570A] text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-stone-200">
                2. Amministrazione ({AZIENDA.contatti.ufficioAmministrazione.telefono})
              </span>
              <a
                href={`tel:${AZIENDA.contatti.ufficioAmministrazione.telefono.replace(/\s+/g, '')}`}
                onClick={() => setFabMenuOpen(false)}
                className="w-12 h-12 rounded-full bg-[#25570A] text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Chiama Ufficio Amministrazione Fisso"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>

            {/* 2b. Ufficio Amministrazione Mobile */}
            <div className="flex items-center gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-200 fill-mode-both" style={{ animationDelay: '110ms' }}>
              <span className="bg-white/95 backdrop-blur-md text-[#25570A] text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-stone-200">
                2. Amministrazione ({AZIENDA.contatti.ufficioAmministrazione.telefono2})
              </span>
              <a
                href={`tel:${AZIENDA.contatti.ufficioAmministrazione.telefono2.replace(/\s+/g, '')}`}
                onClick={() => setFabMenuOpen(false)}
                className="w-12 h-12 rounded-full bg-[#25570A] text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Chiama Ufficio Amministrazione Cellulare"
              >
                <Building2 className="w-5 h-5" />
              </a>
            </div>

            {/* 3. Produzione Interna */}
            <div className="flex items-center gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-200 fill-mode-both" style={{ animationDelay: '140ms' }}>
              <span className="bg-white/95 backdrop-blur-md text-[#25570A] text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-stone-200">
                3. Produzione ({AZIENDA.contatti.produzioneInterna.telefono})
              </span>
              <a
                href={`tel:${AZIENDA.contatti.produzioneInterna.telefono.replace(/\s+/g, '')}`}
                onClick={() => setFabMenuOpen(false)}
                className="w-12 h-12 rounded-full bg-[#3B821A] text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Chiama Produzione Interna"
              >
                <Sprout className="w-5 h-5" />
              </a>
            </div>

            {/* 4. Logistica & Spedizioni */}
            <div className="flex items-center gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-200 fill-mode-both" style={{ animationDelay: '170ms' }}>
              <span className="bg-white/95 backdrop-blur-md text-[#25570A] text-xs font-bold px-3 py-1.5 rounded-full shadow-md border border-stone-200">
                4. Logistica ({AZIENDA.contatti.logisticaSpedizioni.telefono})
              </span>
              <a
                href={`tel:${AZIENDA.contatti.logisticaSpedizioni.telefono.replace(/\s+/g, '')}`}
                onClick={() => setFabMenuOpen(false)}
                className="w-12 h-12 rounded-full bg-[#1A3E07] text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform"
                aria-label="Chiama Logistica e Spedizioni"
              >
                <Truck className="w-5 h-5" />
              </a>
            </div>

          </div>
        )}

        {/* Pulsante Principale FAB */}
        <button
          type="button"
          onClick={() => setFabMenuOpen(!fabMenuOpen)}
          className={`relative z-50 w-14 h-14 rounded-full text-white shadow-xl shadow-black/40 flex items-center justify-center active:scale-95 transition-all duration-300 pointer-events-auto touch-target ${
            fabMenuOpen ? 'bg-stone-900 rotate-90 scale-95' : 'bg-[#D34816] hover:bg-[#B83E12]'
          }`}
          aria-label={fabMenuOpen ? "Chiudi menu contatti" : "Apri opzioni contatti vivaio"}
        >
          {fabMenuOpen ? (
            <X className="w-6 h-6 transition-transform" />
          ) : (
            <MessageCircle className="w-7 h-7 fill-white/20 transition-transform" />
          )}
        </button>
      </div>

      {/* MODALE DETTAGLIO PIANTA */}
      {piantaDettaglio && (
        <DettaglioPiantaModal
          pianta={piantaDettaglio}
          validoFino={validoFino}
          mostraGiacenze={mostraGiacenze}
          onClose={() => setPiantaDettaglio(null)}
          onOpenLightbox={(src, title) => setLightboxData({ isOpen: true, src, title })}
        />
      )}

      {/* LIGHTBOX PER INGRANDIRE FOTO */}
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
