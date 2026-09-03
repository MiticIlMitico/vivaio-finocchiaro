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
  Clock, 
  Mail, 
  CheckCircle2, 
  SlidersHorizontal,
  RefreshCw,
  AlertCircle,
  LayoutGrid,
  ListFilter,
  Sparkles,
  Truck,
  Layers,
  ArrowDown
} from 'lucide-react';

export default function Home() {
  const [piante, setPiante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errore, setErrore] = useState(null);

  // Filtri principali
  const [ricerca, setRicerca] = useState('');
  const [categoriaAttiva, setCategoriaAttiva] = useState('tutte'); // 'tutte' di default per mostrare tutto subito!
  const [vasoFiltro, setVasoFiltro] = useState(null);

  // Vista: 'griglia' (continua, mostra tutto) o 'raggruppata' (divisa per intestazione categoria)
  const [tipoVista, setTipoVista] = useState('griglia');

  // Modali
  const [piantaDettaglio, setPiantaDettaglio] = useState(null);
  const [lightboxData, setLightboxData] = useState({ isOpen: false, src: '', title: '' });

  // Caricamento piante visibili da Supabase (RLS anonima)
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
      setErrore('Impossibile caricare il catalogo in questo momento. Verifica la connessione e riprova.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    caricaPiante();
  }, []);

  // Lista categorie uniche con conteggio per le tab
  const categorieConConteggio = useMemo(() => {
    const map = {};
    piante.forEach(p => {
      const cat = p.categoria || 'Altre piante';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map).map(([nome, count]) => ({ nome, count }));
  }, [piante]);

  // Lista diametri vaso unici per i filtri rapidi
  const diametriVaso = useMemo(() => {
    const setVasi = new Set();
    piante.forEach(p => {
      if (p.vaso_cm) setVasi.add(Number(p.vaso_cm));
    });
    return Array.from(setVasi).sort((a, b) => a - b);
  }, [piante]);

  // Filtraggio dinamico
  const pianteFiltrate = useMemo(() => {
    return piante.filter((p) => {
      // Filtro categoria
      const matchCategoria = categoriaAttiva === 'tutte' || (p.categoria || 'Altre piante') === categoriaAttiva;

      // Filtro ricerca testuale
      const q = ricerca.trim().toLowerCase();
      const matchTesto = q === '' ||
        p.nome.toLowerCase().includes(q) ||
        (p.nome_comune && p.nome_comune.toLowerCase().includes(q)) ||
        (p.tipologia && p.tipologia.toLowerCase().includes(q));

      // Filtro diametro vaso
      const matchVaso = vasoFiltro === null || Number(p.vaso_cm) === Number(vasoFiltro);

      return matchCategoria && matchTesto && matchVaso;
    });
  }, [piante, categoriaAttiva, ricerca, vasoFiltro]);

  // Raggruppamento per categoria (se tipoVista === 'raggruppata')
  const gruppiCategoria = useMemo(() => {
    const gruppi = {};
    pianteFiltrate.forEach((p) => {
      const cat = p.categoria || 'Altre piante';
      if (!gruppi[cat]) gruppi[cat] = [];
      gruppi[cat].push(p);
    });
    return gruppi;
  }, [pianteFiltrate]);

  const whatsappNumber = AZIENDA.contatti.whatsapp.replace(/\D/g, '');

  return (
    <div className="min-h-screen flex flex-col bg-stone-50">
      {/* 1. HERO SECTION AD ALTO IMPATTO VISIVO */}
      <section className="relative bg-gradient-to-b from-stone-950 via-moss-950 to-moss-900 text-white overflow-hidden pt-12 pb-24 sm:pt-20 sm:pb-32">
        {/* Glow organico decorativo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-emerald-600/20 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[250px] bg-moss-500/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            {/* Pillola Status */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md text-emerald-300 text-xs font-semibold mb-6 border border-white/15 shadow-sm">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Listino Vivaio &bull; Canale Professionale</span>
            </div>

            {/* Titolo Principale */}
            <h1 className="font-display font-bold text-3xl sm:text-5xl lg:text-6xl text-white tracking-tight leading-[1.1] mb-5">
              {AZIENDA.nome}
            </h1>

            {/* Payoff */}
            <p className="text-stone-300 text-base sm:text-xl font-normal leading-relaxed mb-8 max-w-2xl">
              {AZIENDA.claim}. Forniture dirette e lotti selezionati per rivenditori, garden center e professionisti del verde.
            </p>

            {/* Statistiche Chiave / Punti Forza in evidenza */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 pb-6 max-w-xl text-xs sm:text-sm text-stone-200">
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-white/10">
                <Sprout className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{piante.length} Varietà Pronte</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-white/10">
                <Truck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Carrelli CC & Pianali</span>
              </div>
              <div className="col-span-2 sm:col-span-1 flex items-center gap-2 bg-white/5 backdrop-blur-sm px-3.5 py-2.5 rounded-xl border border-white/10">
                <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Prezzi Ingrosso Dedicati</span>
              </div>
            </div>

            {/* Azioni Hero */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#catalogo"
                className="px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl transition-all shadow-lg shadow-emerald-950/40 flex items-center gap-2 touch-target active:scale-95"
              >
                <span>Esplora Tutte le Piante</span>
                <ArrowDown className="w-4 h-4 animate-bounce" />
              </a>

              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Salve Vivaio Finocchiaro, vorrei richiedere informazioni e disponibilità sulle piante a listino.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition-all border border-white/15 backdrop-blur-md flex items-center gap-2 touch-target"
              >
                <MessageCircle className="w-4 h-4 fill-white/20" />
                <span>Contatto Rapido WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATALOGO PRINCIPALE (Mostra Tutte le Piante) */}
      <main id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20 flex-1 w-full pb-24">
        {/* Pannello Ricerca e Filtri Moderno */}
        <div className="bg-white rounded-3xl border border-stone-200 shadow-lg p-4 sm:p-6 mb-8">
          {/* Riga 1: Barra di Ricerca e Selettore Vista */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={ricerca}
                onChange={(e) => setRicerca(e.target.value)}
                placeholder="Cerca pianta (es. Crassula, Olivo, Limone, Strelitzia)..."
                className="w-full pl-12 pr-10 py-3.5 bg-stone-50 border border-stone-200/90 rounded-2xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white transition-all shadow-inner"
              />
              {ricerca && (
                <button
                  onClick={() => setRicerca('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 hover:text-stone-700 p-1"
                >
                  Azzera
                </button>
              )}
            </div>

            {/* Toggle Tipo Vista (Griglia Continua vs Raggruppata) */}
            <div className="flex items-center justify-between sm:justify-end gap-3">
              <span className="text-xs font-semibold text-stone-500">
                <strong className="text-stone-900">{pianteFiltrate.length}</strong> varietà trovate
              </span>

              <div className="flex items-center bg-stone-100 p-1 rounded-xl border border-stone-200/60">
                <button
                  type="button"
                  onClick={() => setTipoVista('griglia')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 touch-target ${
                    tipoVista === 'griglia'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Mostra tutte le piante in griglia continua"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Griglia</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoVista('raggruppata')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 touch-target ${
                    tipoVista === 'raggruppata'
                      ? 'bg-white text-stone-900 shadow-sm'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                  title="Raggruppa per categoria botanica"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Per Categoria</span>
                </button>
              </div>
            </div>
          </div>

          {/* Riga 2: Tab Categorie a Scorrimento Orizzontale (TUTTE LE PIANTE VISIBILI SUBITO) */}
          <div className="mt-5 pt-4 border-t border-stone-100">
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <button
                type="button"
                onClick={() => setCategoriaAttiva('tutte')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 touch-target flex-shrink-0 ${
                  categoriaAttiva === 'tutte'
                    ? 'bg-moss-800 text-white shadow-md shadow-moss-900/20 scale-[1.02]'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
              >
                <Sprout className="w-3.5 h-3.5" />
                <span>Tutte le piante ({piante.length})</span>
              </button>

              {categorieConConteggio.map(({ nome, count }) => (
                <button
                  key={nome}
                  type="button"
                  onClick={() => setCategoriaAttiva(nome)}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 touch-target flex-shrink-0 ${
                    categoriaAttiva === nome
                      ? 'bg-moss-800 text-white shadow-md shadow-moss-900/20 scale-[1.02]'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                  }`}
                >
                  <span>{nome}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    categoriaAttiva === nome ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {count}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Riga 3: Filtro Vasi Rapidi (Chip) */}
          {diametriVaso.length > 0 && (
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
              <span className="text-xs font-semibold text-stone-400 flex items-center gap-1 flex-shrink-0 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                Vaso:
              </span>

              <button
                type="button"
                onClick={() => setVasoFiltro(null)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0 touch-target ${
                  vasoFiltro === null
                    ? 'bg-stone-800 text-white font-semibold'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Tutti i vasi
              </button>

              {diametriVaso.map((diametro) => (
                <button
                  key={diametro}
                  type="button"
                  onClick={() => setVasoFiltro(vasoFiltro === diametro ? null : diametro)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0 touch-target ${
                    vasoFiltro === diametro
                      ? 'bg-stone-800 text-white font-semibold'
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-3xl p-4 animate-pulse">
                <div className="aspect-[4/3] bg-stone-200 rounded-2xl mb-4"></div>
                <div className="h-5 bg-stone-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-stone-100 rounded w-1/2 mb-4"></div>
                <div className="h-16 bg-stone-100 rounded-xl mb-4"></div>
                <div className="h-10 bg-stone-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        )}

        {/* STATO ERRORE */}
        {errore && (
          <div className="bg-clay-50 border border-clay-200 rounded-3xl p-8 text-center text-clay-900 my-8">
            <AlertCircle className="w-12 h-12 mx-auto text-clay-600 mb-3" />
            <h3 className="font-display font-semibold text-lg mb-1">Errore di caricamento</h3>
            <p className="text-sm text-clay-700 mb-4 max-w-md mx-auto">{errore}</p>
            <button
              onClick={caricaPiante}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-clay-700 hover:bg-clay-800 text-white text-xs font-semibold rounded-xl transition-colors touch-target"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Riprova</span>
            </button>
          </div>
        )}

        {/* STATO VUOTO */}
        {!loading && !errore && pianteFiltrate.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center my-8 shadow-sm">
            <Sprout className="w-14 h-14 mx-auto text-stone-300 mb-3" />
            <h3 className="font-display font-semibold text-xl text-stone-800 mb-1">
              Nessuna pianta trovata
            </h3>
            <p className="text-sm text-stone-500 max-w-md mx-auto mb-5">
              Nessuna varietà corrisponde ai filtri selezionati.
            </p>
            <button
              onClick={() => { setRicerca(''); setCategoriaAttiva('tutte'); setVasoFiltro(null); }}
              className="px-5 py-2.5 bg-moss-700 hover:bg-moss-800 text-white text-xs font-semibold rounded-xl transition-colors touch-target"
            >
              Mostra tutte le {piante.length} piante
            </button>
          </div>
        )}

        {/* MOSTRA TUTTE LE PIANTE — VISTA 1: GRIGLIA CONTINUA (DEFAULT) */}
        {!loading && !errore && tipoVista === 'griglia' && pianteFiltrate.length > 0 && (
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

        {/* MOSTRA LE PIANTE — VISTA 2: RAGGRUPPATA PER CATEGORIA */}
        {!loading && !errore && tipoVista === 'raggruppata' && pianteFiltrate.length > 0 && (
          <div className="space-y-10">
            {Object.entries(gruppiCategoria).map(([catNome, lista]) => (
              <section key={catNome} className="bg-white rounded-3xl border border-stone-200/90 shadow-sm p-5 sm:p-7">
                <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                    <h2 className="font-display font-bold text-xl sm:text-2xl text-stone-900 tracking-tight">
                      {catNome}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700">
                      {lista.length} varietà
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                  {lista.map((pianta) => (
                    <CardPianta
                      key={pianta.id}
                      pianta={pianta}
                      onOpenLightbox={(src, title) => setLightboxData({ isOpen: true, src, title })}
                      onOpenDetail={(p) => setPiantaDettaglio(p)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>

      {/* 3. SEZIONE AZIENDA & LOGISTICA */}
      <section id="chi-siamo" className="bg-stone-100/90 border-t border-stone-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-2">
              Esperienza & Affidabilità
            </span>
            <h2 className="font-display font-bold text-2xl sm:text-4xl text-stone-900 tracking-tight mb-4">
              {AZIENDA.chiSiamo.titolo}
            </h2>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed mb-4">
              {AZIENDA.chiSiamo.testo1}
            </p>
            <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
              {AZIENDA.chiSiamo.testo2}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AZIENDA.chiSiamo.puntiForza.map((punto, idx) => (
              <div key={idx} className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-sm flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-stone-800 leading-snug">
                  {punto}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CONTATTI COMMERCIALI */}
      <section id="contatti" className="bg-white border-t border-stone-200 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <div className="lg:col-span-5">
              <span className="text-xs font-bold uppercase tracking-wider text-moss-700 block mb-2">
                Logistica & Ricezione Ordini
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-stone-900 tracking-tight mb-4">
                Parla direttamente con il vivaio
              </h2>
              <p className="text-stone-600 text-sm leading-relaxed mb-6">
                Organizziamo carichi veloci e spedizioni su carrelli CC standard e pianali. Per quotazioni di grandi volumi o richieste su misura, scrivici su WhatsApp.
              </p>
              
              <a
                href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Salve Vivaio Finocchiaro, vorrei richiedere informazioni per un ordine.')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-sm font-semibold rounded-2xl transition-all shadow-md shadow-emerald-950/20 touch-target"
              >
                <MessageCircle className="w-5 h-5 fill-white/20" />
                <span>Messaggio WhatsApp Commerciale</span>
              </a>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-1">Orari</h4>
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

      {/* FLOATING ACTION BUTTON (FAB) WHATSAPP PER SMARTPHONE */}
      <div className="fixed bottom-5 right-5 z-40 sm:hidden">
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Salve Vivaio Finocchiaro, vorrei informazioni sulle disponibilità.')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xl flex items-center justify-center active:scale-95 transition-transform touch-target border-2 border-white/20"
          aria-label="Contatta su WhatsApp"
        >
          <MessageCircle className="w-7 h-7 fill-white/20" />
        </a>
      </div>

      {/* MODALE SCHEDA RAPIDA DETTAGLIO PIANTA */}
      {piantaDettaglio && (
        <DettaglioPiantaModal
          pianta={piantaDettaglio}
          onClose={() => setPiantaDettaglio(null)}
          onOpenLightbox={(src, title) => {
            setLightboxData({ isOpen: true, src, title });
          }}
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
