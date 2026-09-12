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
  Plus
} from 'lucide-react';

export default function Home() {
  const [piante, setPiante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(null);
  const [validoFino, setValidoFino] = useState('31 Agosto 2026');

  // Filtri catalogo
  const [ricerca, setRicerca] = useState('');
  const [categoriaAttiva, setCategoriaAttiva] = useState('tutte');
  const [vasoFiltro, setVasoFiltro] = useState(null);

  // Paginazione progressiva (6 piante alla volta)
  const [visibiliCount, setVisibiliCount] = useState(6);

  // Modali
  const [piantaDettaglio, setPiantaDettaglio] = useState(null);
  const [lightboxData, setLightboxData] = useState({ isOpen: false, src: '', title: '' });

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

      // 2. Carica periodo di validità listino
      const { data: impData } = await supabase
        .from('impostazioni')
        .select('valore')
        .eq('chiave', 'valido_fino')
        .single();

      if (impData?.valore) {
        setValidoFino(impData.valore);
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

  // Reset del contatore visibili ogni volta che cambiano i filtri
  useEffect(() => {
    setVisibiliCount(12);
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

  // Piante visibili correnti (12 alla volta)
  const pianteVisibili = useMemo(() => {
    return pianteFiltrate.slice(0, visibiliCount);
  }, [pianteFiltrate, visibiliCount]);

  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F6] text-[#252824]">
      
      {/* 1. SEZIONE HERO: ESATTAMENTE 100DVH / 100VH A TUTTO SCHERMO SU QUALSIASI DISPOSITIVO */}
      <section className="relative w-full h-screen h-[100dvh] min-h-[100dvh] max-h-[100dvh] flex flex-col justify-between items-center text-white overflow-hidden bg-stone-950">
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
          {/* Sfumatura cinematografica neutra (nessun verde artificiale) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
        </div>

        {/* Spaziatore superiore calibrato sull'altezza della Navbar fissa */}
        <div className="w-full h-20 sm:h-24 flex-shrink-0" />

        {/* Contenuto Centrale della Hero - Perfettamente Centrato in Verticale */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center flex-1 flex flex-col items-center justify-center">
          
          <h1 className="font-display text-4xl sm:text-6xl md:text-7xl font-semibold tracking-tight text-white leading-[1.08] mb-5 drop-shadow-md">
            Coltivato in Sicilia.<br />
            <span className="font-normal italic text-[#FAF9F6]/90">Pronto per il mondo.</span>
          </h1>

          <p className="text-white/90 text-sm sm:text-lg max-w-xl mx-auto font-normal leading-relaxed mb-8 drop-shadow-xs">
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
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Salve, vorrei richiedere informazioni e quotazioni all'ingrosso.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-7 py-3.5 bg-white/15 hover:bg-white/25 active:scale-95 text-white font-semibold text-xs sm:text-sm uppercase tracking-wider rounded-full transition-all border border-white/30 backdrop-blur-md flex items-center justify-center gap-2 touch-target"
            >
              <MessageCircle className="w-4 h-4 fill-white/20" />
              <span>Contatto Ordini</span>
            </a>
          </div>
        </div>

        {/* Indicatore discreto di scorrimento a fondo schermata (contenuto esattamente nel 100vh) */}
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
            
            {/* Immagini Autentiche */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-3xl overflow-hidden shadow-md aspect-[4/5] bg-stone-100 border border-stone-200/60">
                <picture>
                  <source media="(max-width: 768px)" srcSet="/brand/storia-serra-mobile.webp" type="image/webp" />
                  <source srcSet="/brand/storia-serra.webp" type="image/webp" />
                  <img
                    src="/brand/storia-serra.jpg"
                    alt="Serre Campo dei Fiori a Santa Venerina"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-102"
                  />
                </picture>
              </div>
              <p className="text-xs text-[#252824]/60 italic text-center">
                Serre di coltivazione a Santa Venerina (Catania) &bull; Pendici dell'Etna
              </p>
            </div>

            {/* Racconto Aziendale Naturale */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-[#25570A] text-xs font-bold tracking-[0.2em] uppercase block">
                Santa Venerina &bull; Sicilia
              </span>

              <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#25570A] leading-[1.15] tracking-tight">
                Dalla terra minerale dell'Etna ai mercati di tutta Europa.
              </h2>

              <div className="space-y-4 text-[#252824]/80 text-sm sm:text-base leading-relaxed">
                <p>
                  Guidata da <strong>Marco Adornetto</strong> a Santa Venerina (Catania), <em>Campo dei Fiori</em> unisce la naturale fertilità della terra vulcanica con metodologie vivaistiche all'avanguardia.
                </p>
                <p>
                  Il microclima delle pendici dell'Etna offre una combinazione unica di soleggiamento costante ed escursione termica equilibrata: le piante sviluppano radici solide, chiome vigorose e colorazioni intense, perfette per una tenuta impeccabile durante il trasporto refrigerato e nei garden center.
                </p>
              </div>

              {/* I 3 Punti Guida di Produzione */}
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

                <div className="flex items-start gap-4">
                  <span className="font-display font-bold text-xl text-[#25570A] pt-0.5">03</span>
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-[#252824]">Logistica Roll CC Danesi</h3>
                    <p className="text-xs text-[#252824]/70 mt-0.5">Carichi rapidi e protetti su carrelli standard per consegne in tutta Italia ed Europa.</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </SectionReveal>
      </section>


      {/* 3. SEZIONE CATALOGO & LISTINO ALL'INGROSSO */}
      <section id="catalogo" className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full">
        
        {/* Intestazione Catalogo */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 pb-4 border-b border-stone-200">
          <div>
            <span className="text-[#25570A] text-xs font-bold tracking-[0.2em] uppercase block mb-1">
              Disponibilità Magazzino
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-medium text-[#25570A] tracking-tight">
              Listino Piante & Varietà
            </h2>
          </div>
          <div className="text-xs font-semibold text-[#252824]/70">
            Disponibilità valide fino al <strong className="text-[#25570A] font-bold">{validoFino}</strong>
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


      {/* 4. SEZIONE LOGISTICA CC & FORNITURE PROFESSIONALI */}
      <section id="logistica" className="bg-[#1C201C] text-white py-20 sm:py-28 px-5 sm:px-8">
        <SectionReveal>
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-6 space-y-5">
                <span className="text-[#6BB221] text-xs font-bold tracking-[0.25em] uppercase block">
                  Standard Logistico
                </span>
                <h2 className="font-display text-3xl sm:text-5xl font-medium tracking-tight leading-[1.15]">
                  Carichi veloci e protetti su roll carrelli CC danesi.
                </h2>
                <p className="text-sm sm:text-base text-stone-300 leading-relaxed">
                  Tutte le spedizioni di <em>Campo dei Fiori</em> sono allestite secondo i rigorosi standard europei di logistica vivaistica. Le piante vengono preparate con cura su carrelli roll CC e pianali dedicati per garantire ventilazione ottimale e protezione totale della vegetazione.
                </p>
                
                <div className="grid grid-cols-2 gap-6 pt-4 border-t border-stone-700">
                  <div>
                    <span className="font-display text-3xl font-bold text-white block">100%</span>
                    <span className="text-xs text-stone-400 mt-1 block">Passaporto Fitosanitario UE</span>
                  </div>
                  <div>
                    <span className="font-display text-3xl font-bold text-white block">Settimanali</span>
                    <span className="text-xs text-stone-400 mt-1 block">Carichi diretti e puntuali</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6">
                <div className="rounded-3xl overflow-hidden shadow-2xl border border-stone-700 aspect-[16/10]">
                  <picture>
                    <source media="(max-width: 768px)" srcSet="/brand/brand-action-mobile.webp" type="image/webp" />
                    <source srcSet="/brand/brand-action.webp" type="image/webp" />
                    <img
                      src="/brand/brand-action.jpg"
                      alt="Carrelli roll CC e imballaggi per garden center"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </picture>
                </div>
              </div>
            </div>
          </div>
        </SectionReveal>
      </section>


      {/* 5. SEZIONE CONTATTI COMMERCIALI */}
      <section id="contatti" className="py-20 sm:py-28 px-5 sm:px-8 max-w-5xl mx-auto w-full">
        <SectionReveal>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[#25570A] text-xs font-bold tracking-[0.2em] uppercase block mb-1">
              Ufficio Commerciale
            </span>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-[#25570A]">
              Contatta il Vivaio
            </h2>
            <p className="text-xs sm:text-sm text-[#252824]/70 mt-2">
              Richiesta quotazioni all'ingrosso, disponibilità lotti e visite in vivaio.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div className="p-6 rounded-3xl bg-white border border-stone-200 text-center shadow-xs">
              <Phone className="w-5 h-5 text-[#25570A] mx-auto mb-2" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#252824]/50 block">Ufficio Vendite</span>
              <span className="text-sm sm:text-base font-bold text-[#25570A] block mt-1">{AZIENDA.contatti.telefono}</span>
            </div>

            <a
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Salve, vorrei richiedere informazioni e quotazioni all'ingrosso.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-6 rounded-3xl bg-[#D34816] hover:bg-[#B83E12] text-white text-center transition-all shadow-md block active:scale-98"
            >
              <MessageCircle className="w-5 h-5 text-white mx-auto mb-2 fill-white/20" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-white/80 block">WhatsApp Diretto</span>
              <span className="text-sm sm:text-base font-bold text-white block mt-1">Richiedi Disponibilità</span>
            </a>

            <div className="p-6 rounded-3xl bg-white border border-stone-200 text-center shadow-xs">
              <MapPin className="w-5 h-5 text-[#25570A] mx-auto mb-2" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#252824]/50 block">Sede & Vivaio</span>
              <span className="text-xs sm:text-sm font-bold text-[#25570A] block mt-1">{AZIENDA.contatti.indirizzo}</span>
            </div>
          </div>
        </SectionReveal>
      </section>


      {/* 6. FOOTER EDITORIALE (Con logo orizzontale autentico e dettagli societari) */}
      <footer className="bg-[#141714] text-[#FAF9F6] border-t border-stone-800 py-16 px-5 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-stone-800 items-start">
            
            {/* Logo ufficiale con scritta inclusa in versione bianca per fondo scuro */}
            <div className="md:col-span-5 space-y-4">
              <img
                src="/brand/logo-horizontal-white.webp"
                alt="Campo dei Fiori - Ornamental Plants Sicily"
                loading="lazy"
                decoding="async"
                className="h-11 w-auto object-contain"
              />
              <p className="text-xs text-stone-400 leading-relaxed max-w-sm">
                Coltivazione e vendita all'ingrosso riservata esclusivamente a garden center, grossisti e operatori professionali con Partita IVA.
              </p>
            </div>

            {/* Dati Fiscali */}
            <div className="md:col-span-4 space-y-2 text-xs text-stone-400">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6BB221] block mb-2">
                Dati Societari
              </span>
              <p><strong className="text-white font-semibold">Ragione Sociale:</strong> {AZIENDA.ragioneSociale}</p>
              <p><strong className="text-white font-semibold">Sede Operativa:</strong> {AZIENDA.contatti.via}, {AZIENDA.contatti.cap} {AZIENDA.contatti.comune} ({AZIENDA.contatti.provincia})</p>
              <p><strong className="text-white font-semibold">Partita IVA:</strong> {AZIENDA.contatti.piva}</p>
              <p><strong className="text-white font-semibold">PEC:</strong> {AZIENDA.contatti.pec}</p>
            </div>

            {/* Recapiti Diretti */}
            <div className="md:col-span-3 space-y-2 text-xs text-stone-400">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#6BB221] block mb-2">
                Recapiti Diretti
              </span>
              <p><strong className="text-white font-semibold">Ufficio Vendite:</strong> {AZIENDA.contatti.telefono}</p>
              <p><strong className="text-white font-semibold">Email:</strong> {AZIENDA.contatti.email}</p>
              <p><strong className="text-white font-semibold">Orari Carico:</strong> {AZIENDA.contatti.orari}</p>
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


      {/* FAB WHATSAPP MOBILE */}
      <div className="fixed bottom-5 right-5 z-40 sm:hidden">
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Salve, vorrei richiedere informazioni sulle disponibilità piante.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-[#D34816] text-white shadow-xl shadow-black/40 flex items-center justify-center active:scale-95 transition-transform touch-target"
          aria-label="Contatta su WhatsApp"
        >
          <MessageCircle className="w-7 h-7 fill-white/20" />
        </a>
      </div>

      {/* MODALE DETTAGLIO PIANTA */}
      {piantaDettaglio && (
        <DettaglioPiantaModal
          pianta={piantaDettaglio}
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
