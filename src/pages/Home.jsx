import React, { useEffect, useState, useMemo } from 'react';
import { supabase } from '../lib/supabase';
import { AZIENDA } from '../content/azienda';
import CategoriaAccordion from '../components/CategoriaAccordion';
import Lightbox from '../components/Lightbox';
import { 
  Search, 
  Sprout, 
  Phone, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Mail, 
  Building, 
  CheckCircle, 
  Layers, 
  SlidersHorizontal,
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export default function Home() {
  const [piante, setPiante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(null);

  // Filtri
  const [ricerca, setRicerca] = useState('');
  const [vasoFiltro, setVasoFiltro] = useState(null);

  // Stato categorie aperte nella fisarmonica
  const [openCategories, setOpenCategories] = useState({});

  // Lightbox
  const [lightboxData, setLightboxData] = useState({ isOpen: false, src: '', title: '' });

  // Caricamento dati da Supabase (solo visibile = true per anon RLS)
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

      // Inizializza categorie: apri la prima categoria di default
      if (data && data.length > 0) {
        const primeCategorie = {};
        const primaCat = data[0].categoria || 'Altre piante';
        primeCategorie[primaCat] = true;
        setOpenCategories(primeCategorie);
      }
    } catch (err) {
      console.error('Errore nel caricamento del catalogo:', err);
      setErrore('Impossibile caricare il catalogo in questo momento. Verifica la connessione e riprova.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    caricaPiante();
  }, []);

  // Lista diametri vaso unici per i filtri rapidi a chip
  const diametriVasoDisponibili = useMemo(() => {
    const setVasi = new Set();
    piante.forEach(p => {
      if (p.vaso_cm) setVasi.add(Number(p.vaso_cm));
    });
    return Array.from(setVasi).sort((a, b) => a - b);
  }, [piante]);

  // Piante filtrate per ricerca testuale e chip diametro vaso
  const pianteFiltrate = useMemo(() => {
    return piante.filter((p) => {
      const matchTesto = ricerca.trim() === '' || 
        p.nome.toLowerCase().includes(ricerca.toLowerCase()) ||
        (p.nome_comune && p.nome_comune.toLowerCase().includes(ricerca.toLowerCase())) ||
        (p.tipologia && p.tipologia.toLowerCase().includes(ricerca.toLowerCase()));

      const matchVaso = vasoFiltro === null || Number(p.vaso_cm) === Number(vasoFiltro);

      return matchTesto && matchVaso;
    });
  }, [piante, ricerca, vasoFiltro]);

  // Raggruppamento piante per categoria
  const gruppiCategoria = useMemo(() => {
    const gruppi = {};
    pianteFiltrate.forEach((p) => {
      const cat = p.categoria || 'Altre piante';
      if (!gruppi[cat]) {
        gruppi[cat] = [];
      }
      gruppi[cat].push(p);
    });
    return gruppi;
  }, [pianteFiltrate]);

  // Se l'utente scrive nella barra di ricerca, espandi automaticamente le categorie corrispondenti
  useEffect(() => {
    if (ricerca.trim() !== '') {
      const allOpen = {};
      Object.keys(gruppiCategoria).forEach((cat) => {
        allOpen[cat] = true;
      });
      setOpenCategories(allOpen);
    }
  }, [ricerca, gruppiCategoria]);

  const toggleCategoria = (cat) => {
    setOpenCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const apriLightbox = (src, title) => {
    setLightboxData({ isOpen: true, src, title });
  };

  const chiudiLightbox = () => {
    setLightboxData({ isOpen: false, src: '', title: '' });
  };

  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');

  return (
    <div className="min-h-screen flex flex-col">
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-b from-moss-900 via-moss-800 to-moss-900 text-white overflow-hidden pt-12 pb-20 sm:pt-16 sm:pb-28">
        {/* Sfondo decorativo con pattern organico */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-moss-200 text-xs font-semibold mb-6 border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Listino Forniture Vivaio &bull; Canale Professionale
            </div>

            <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-6">
              {AZIENDA.nome}
            </h1>

            <p className="text-moss-100/90 text-base sm:text-xl font-normal leading-relaxed mb-8 max-w-2xl">
              {AZIENDA.claim}. {AZIENDA.descrizioneBreve}
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <a
                href="#catalogo"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-colors shadow-lg shadow-emerald-950/20 flex items-center gap-2 touch-target"
              >
                <Sprout className="w-4 h-4" />
                <span>Consulta il Catalogo</span>
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Salve Vivaio Finocchiaro, vorrei richiedere informazioni sulle forniture.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-xl transition-colors border border-white/15 backdrop-blur-md flex items-center gap-2 touch-target"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contatto Commerciale WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATALOGO VETRINA (Cuore dell'App) */}
      <main id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20 flex-1 w-full pb-20">
        {/* Pannello Filtri e Ricerca */}
        <div className="bg-white rounded-2xl border border-stone-200 shadow-md p-4 sm:p-6 mb-8">
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            {/* Input Ricerca Testuale */}
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ricerca}
                onChange={(e) => setRicerca(e.target.value)}
                placeholder="Cerca pianta per nome botanico o comune (es: Crassula, Limone, Olivo)..."
                className="w-full pl-11 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white transition-all"
              />
              {ricerca && (
                <button
                  onClick={() => setRicerca('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 hover:text-stone-700 p-1"
                >
                  Azzera
                </button>
              )}
            </div>

            {/* Conteggio Risultati */}
            <div className="text-xs font-medium text-stone-500 whitespace-nowrap self-end md:self-center">
              Trovate <strong className="text-stone-900">{pianteFiltrate.length}</strong> varietà
            </div>
          </div>

          {/* Filtro Diametri Vaso (Chip cliccabili) */}
          {diametriVasoDisponibili.length > 0 && (
            <div className="mt-4 pt-4 border-t border-stone-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              <span className="text-xs font-semibold text-stone-500 flex items-center gap-1.5 flex-shrink-0 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Vaso:
              </span>

              <button
                type="button"
                onClick={() => setVasoFiltro(null)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 touch-target ${
                  vasoFiltro === null
                    ? 'bg-moss-800 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Tutti i vasi
              </button>

              {diametriVasoDisponibili.map((diametro) => (
                <button
                  key={diametro}
                  type="button"
                  onClick={() => setVasoFiltro(vasoFiltro === diametro ? null : diametro)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0 touch-target ${
                    vasoFiltro === diametro
                      ? 'bg-moss-800 text-white font-semibold'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  Ø {diametro} cm
                </button>
              ))}
            </div>
          )}
        </div>

        {/* STATO DI CARICAMENTO SKELETON */}
        {loading && (
          <div className="space-y-6">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-stone-200 rounded w-1/4 mb-6"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3].map((j) => (
                    <div key={j} className="h-72 bg-stone-100 rounded-xl"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* STATO ERRORE */}
        {errore && (
          <div className="bg-clay-50 border border-clay-200 rounded-2xl p-6 text-center text-clay-900 my-8">
            <AlertCircle className="w-10 h-10 mx-auto text-clay-600 mb-3" />
            <h3 className="font-display font-semibold text-lg mb-1">Si è verificato un errore</h3>
            <p className="text-sm text-clay-700 mb-4 max-w-md mx-auto">{errore}</p>
            <button
              onClick={caricaPiante}
              className="inline-flex items-center gap-2 px-4 py-2 bg-clay-700 hover:bg-clay-800 text-white text-xs font-semibold rounded-lg transition-colors touch-target"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ricarica catalogo</span>
            </button>
          </div>
        )}

        {/* STATO VUOTO */}
        {!loading && !errore && pianteFiltrate.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center my-8">
            <Sprout className="w-12 h-12 mx-auto text-stone-300 mb-3" />
            <h3 className="font-display font-semibold text-lg text-stone-800 mb-1">
              Nessuna pianta trovata
            </h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mb-4">
              Nessuna varietà corrisponde ai filtri impostati. Prova a rimuovere i termini di ricerca o il filtro vaso.
            </p>
            <button
              onClick={() => { setRicerca(''); setVasoFiltro(null); }}
              className="px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-lg transition-colors touch-target"
            >
              Mostra tutte le piante
            </button>
          </div>
        )}

        {/* LISTA CATEGORIE A FISARMONICA FLUIDA */}
        {!loading && !errore && Object.keys(gruppiCategoria).length > 0 && (
          <div>
            {Object.entries(gruppiCategoria).map(([categoria, listaPiante]) => (
              <CategoriaAccordion
                key={categoria}
                categoria={categoria}
                piante={listaPiante}
                isOpen={!!openCategories[categoria]}
                onToggle={() => toggleCategoria(categoria)}
                onOpenLightbox={apriLightbox}
              />
            ))}
          </div>
        )}
      </main>

      {/* 3. SEZIONE CHI SIAMO / AZIENDA */}
      <section id="chi-siamo" className="bg-stone-100 border-t border-stone-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-2">
              Esperienza vivaistica
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-stone-900 tracking-tight mb-4">
              {AZIENDA.chiSiamo.titolo}
            </h2>
            <p className="text-stone-600 text-base leading-relaxed mb-4">
              {AZIENDA.chiSiamo.testo1}
            </p>
            <p className="text-stone-600 text-base leading-relaxed">
              {AZIENDA.chiSiamo.testo2}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {AZIENDA.chiSiamo.puntiForza.map((punto, idx) => (
              <div key={idx} className="bg-white p-5 rounded-xl border border-stone-200/80 shadow-sm flex items-start gap-3.5">
                <CheckCircle className="w-5 h-5 text-moss-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-stone-800 leading-snug">
                  {punto}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. SEZIONE CONTATTI & LOGISTICA */}
      <section id="contatti" className="bg-white border-t border-stone-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-2">
                Logistica & Forniture
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 tracking-tight mb-4">
                Contatta il nostro ufficio commerciale
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                Riceviamo ordini settimanali e concordiamo le spedizioni su carrelli CC e pianali dedicati. Per quotazioni di grandi volumi o richieste speciali, scrivici su WhatsApp o contattaci ai seguenti recapiti.
              </p>
              
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Salve Vivaio Finocchiaro, vorrei richiedere informazioni su un ordine.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm touch-target"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Messaggio WhatsApp Diretto</span>
              </a>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="w-10 h-10 rounded-xl bg-moss-100 text-moss-800 flex items-center justify-center mb-3">
                  <Phone className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Telefono</h4>
                <p className="text-sm font-semibold text-stone-900">{AZIENDA.contatti.telefono}</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="w-10 h-10 rounded-xl bg-moss-100 text-moss-800 flex items-center justify-center mb-3">
                  <Mail className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Email</h4>
                <p className="text-sm font-semibold text-stone-900">{AZIENDA.contatti.email}</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="w-10 h-10 rounded-xl bg-moss-100 text-moss-800 flex items-center justify-center mb-3">
                  <MapPin className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Sede & Carico</h4>
                <p className="text-sm font-semibold text-stone-900">{AZIENDA.contatti.indirizzo}</p>
              </div>

              <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200">
                <div className="w-10 h-10 rounded-xl bg-moss-100 text-moss-800 flex items-center justify-center mb-3">
                  <Clock className="w-5 h-5" />
                </div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Orari di Carico</h4>
                <p className="text-sm font-semibold text-stone-900">{AZIENDA.contatti.orari}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-stone-900 text-stone-400 py-8 border-t border-stone-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-stone-300 font-semibold">{AZIENDA.nome} &bull; P.IVA {AZIENDA.contatti.piva}</p>
            <p className="text-stone-500 mt-0.5">Vendita riservata esclusivamente ad operatori professionali con P.IVA</p>
          </div>

          <div className="text-stone-500">
            &copy; {new Date().getFullYear()} {AZIENDA.nome}. Tutti i diritti riservati.
          </div>
        </div>
      </footer>

      {/* Lightbox per ingrandire la foto */}
      {lightboxData.isOpen && (
        <Lightbox
          src={lightboxData.src}
          title={lightboxData.title}
          onClose={chiudiLightbox}
        />
      )}
    </div>
  );
}
