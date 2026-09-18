import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AZIENDA } from '../content/azienda';
import { 
  Plus, 
  Search, 
  Eye, 
  EyeOff, 
  Pencil, 
  Trash2, 
  LogOut, 
  Sprout, 
  ArrowRight,
  Store,
  Calendar,
  Save,
  CheckCircle2,
  Warehouse,
  Layers,
  X,
  Check
} from 'lucide-react';
import Toast from '../components/Toast';

export default function AdminLista() {
  const [piante, setPiante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ricerca, setRicerca] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [eliminaModal, setEliminaModal] = useState({ isOpen: false, pianta: null, loading: false });

  // Filtri rapidi per usabilità immediata da smartphone
  const [filtroStato, setFiltroStato] = useState('tutte'); // 'tutte' | 'visibili' | 'nascoste'
  const [filtroCategoria, setFiltroCategoria] = useState('tutte');

  // Modale gestione rapida disponibilità per calibro vaso
  const [vasiModal, setVasiModal] = useState({
    isOpen: false,
    pianta: null,
    varianti: [],
    loading: false
  });

  // Periodo di validità listino
  const [validoFino, setValidoFino] = useState('31 Agosto 2026');
  const [salvataggioValidoFino, setSalvataggioValidoFino] = useState(false);

  const navigate = useNavigate();

  // Apertura modale vasi per una specifica pianta
  const openVasiModal = (pianta) => {
    let elenco = [];
    if (Array.isArray(pianta.varianti) && pianta.varianti.length > 0) {
      elenco = pianta.varianti.map(v => ({
        vaso_cm: String(v.vaso_cm ?? ''),
        disponibile: String(v.disponibile ?? '0'),
        giacenza: String(v.giacenza ?? '0')
      }));
    } else {
      elenco = [{
        vaso_cm: String(pianta.vaso_cm ?? '14'),
        disponibile: String(pianta.disponibile ?? '0'),
        giacenza: String(pianta.giacenza ?? '0')
      }];
    }
    setVasiModal({
      isOpen: true,
      pianta,
      varianti: elenco,
      loading: false
    });
  };

  const handleVasoChange = (index, field, value) => {
    setVasiModal(prev => {
      const copy = [...prev.varianti];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, varianti: copy };
    });
  };

  // Modifica rapida quantità (+10, +50, +100, -10) senza tastiera
  const handleModificaQuantitaRapida = (index, field, delta) => {
    setVasiModal(prev => {
      const copy = [...prev.varianti];
      const valAttuale = parseInt(copy[index][field], 10) || 0;
      const nuovoVal = Math.max(0, valAttuale + delta);
      copy[index] = { ...copy[index], [field]: String(nuovoVal) };
      return { ...prev, varianti: copy };
    });
  };

  const handleAggiungiVaso = () => {
    setVasiModal(prev => ({
      ...prev,
      varianti: [...prev.varianti, { vaso_cm: '', disponibile: '0', giacenza: '0' }]
    }));
  };

  const handleRimuoviVaso = (index) => {
    if (vasiModal.varianti.length <= 1) return;
    setVasiModal(prev => ({
      ...prev,
      varianti: prev.varianti.filter((_, i) => i !== index)
    }));
  };

  const handleSalvaVasi = async () => {
    const { pianta, varianti } = vasiModal;
    if (!pianta) return;

    setVasiModal(prev => ({ ...prev, loading: true }));

    // Pulizia e normalizzazione varianti
    const variantiPulite = varianti
      .map(v => ({
        vaso_cm: Number(v.vaso_cm) || 0,
        disponibile: Math.max(0, parseInt(v.disponibile, 10) || 0),
        giacenza: Math.max(0, parseInt(v.giacenza, 10) || 0)
      }))
      .filter(v => v.vaso_cm > 0);

    if (variantiPulite.length === 0) {
      setToast({
        message: 'Inserisci almeno un formato vaso valido (diametro > 0 cm).',
        type: 'error'
      });
      setVasiModal(prev => ({ ...prev, loading: false }));
      return;
    }

    // Ordina per diametro crescente
    variantiPulite.sort((a, b) => a.vaso_cm - b.vaso_cm);

    const primario = variantiPulite[0];
    const totDisponibile = variantiPulite.reduce((sum, v) => sum + v.disponibile, 0);
    const totGiacenza = variantiPulite.reduce((sum, v) => sum + v.giacenza, 0);

    const updatePayload = {
      varianti: variantiPulite,
      vaso_cm: primario.vaso_cm,
      disponibile: variantiPulite.length > 1 ? totDisponibile : primario.disponibile,
      giacenza: variantiPulite.length > 1 ? totGiacenza : primario.giacenza,
      updated_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase
        .from('piante')
        .update(updatePayload)
        .eq('id', pianta.id);

      if (error) throw error;

      // Aggiornamento ottimistico dello state locale
      setPiante(prev => prev.map(p => p.id === pianta.id ? { ...p, ...updatePayload } : p));

      setToast({
        message: `Disponibilità vasi aggiornata per "${pianta.nome}"`,
        type: 'success'
      });
      setVasiModal({ isOpen: false, pianta: null, varianti: [], loading: false });
    } catch (err) {
      console.error('Errore salvataggio disponibilità vasi:', err);
      setToast({
        message: 'Impossibile salvare i formati vaso. Riprova.',
        type: 'error'
      });
      setVasiModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Caricamento completo delle piante e impostazioni
  const caricaDati = async () => {
    setLoading(true);
    try {
      // 1. Piante
      const { data, error } = await supabase
        .from('piante')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      setPiante(data || []);

      // 2. Impostazione valido_fino
      const { data: impData } = await supabase
        .from('impostazioni')
        .select('valore')
        .eq('chiave', 'valido_fino')
        .single();

      if (impData?.valore) {
        setValidoFino(impData.valore);
      }
    } catch (err) {
      console.error('Errore nel caricamento dati admin:', err);
      setToast({
        message: 'Errore nel caricamento del catalogo. Riprova.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    caricaDati();
  }, []);

  // Salvataggio rapido periodo di validità listino
  const handleSalvaValidoFino = async (e) => {
    e.preventDefault();
    if (!validoFino.trim()) return;

    setSalvataggioValidoFino(true);
    try {
      const { error } = await supabase
        .from('impostazioni')
        .upsert({
          chiave: 'valido_fino',
          valore: validoFino.trim(),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      setToast({
        message: 'Periodo di validità listino aggiornato con successo!',
        type: 'success'
      });
    } catch (err) {
      console.error('Errore salvataggio periodo validità:', err);
      setToast({
        message: 'Impossibile aggiornare la data di validità.',
        type: 'error'
      });
    } finally {
      setSalvataggioValidoFino(false);
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Errore durante il logout:', err);
    }
  };

  // Toggle visibilità rapido (Occhio)
  const handleToggleVisibilita = async (piantaTarget) => {
    const nuovoStato = !piantaTarget.visibile;
    
    // Aggiornamento ottimistico
    setPiante((prev) =>
      prev.map((p) => (p.id === piantaTarget.id ? { ...p, visibile: nuovoStato } : p))
    );

    try {
      const { error } = await supabase
        .from('piante')
        .update({ visibile: nuovoStato })
        .eq('id', piantaTarget.id);

      if (error) throw error;

      setToast({
        message: `${piantaTarget.nome} ${nuovoStato ? 'ora è visibile' : 'è stata nascosta'}`,
        type: 'success'
      });
    } catch (err) {
      console.error('Errore aggiornamento visibilità:', err);
      // Rollback
      setPiante((prev) =>
        prev.map((p) => (p.id === piantaTarget.id ? { ...p, visibile: piantaTarget.visibile } : p))
      );
      setToast({
        message: 'Impossibile aggiornare la visibilità.',
        type: 'error'
      });
    }
  };

  // Eliminazione
  const eseguiEliminazione = async () => {
    const { pianta } = eliminaModal;
    if (!pianta) return;

    setEliminaModal((prev) => ({ ...prev, loading: true }));

    try {
      const { error: dbError } = await supabase
        .from('piante')
        .delete()
        .eq('id', pianta.id);

      if (dbError) throw dbError;

      if (pianta.foto_path) {
        try {
          await supabase.storage.from('foto-piante').remove([pianta.foto_path]);
        } catch (storageErr) {
          console.warn('Errore rimozione foto da storage:', storageErr);
        }
      }

      setPiante((prev) => prev.filter((p) => p.id !== pianta.id));
      setToast({
        message: `"${pianta.nome}" eliminata con successo.`,
        type: 'success'
      });
      setEliminaModal({ isOpen: false, pianta: null, loading: false });
    } catch (err) {
      console.error('Errore eliminazione:', err);
      setToast({
        message: 'Impossibile eliminare la pianta.',
        type: 'error'
      });
      setEliminaModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Statistiche
  const stats = useMemo(() => {
    const totale = piante.length;
    const visibili = piante.filter((p) => p.visibile).length;
    const nascoste = totale - visibili;
    return { totale, visibili, nascoste };
  }, [piante]);

  // Elenco unico categorie
  const categorieDisponibili = useMemo(() => {
    const cats = Array.from(new Set(piante.map((p) => p.categoria).filter(Boolean)));
    return cats.sort();
  }, [piante]);

  // Filtro combinato ricerca + visibilità + categoria
  const pianteFiltrate = useMemo(() => {
    return piante.filter((p) => {
      // 1. Filtro visibilità
      if (filtroStato === 'visibili' && !p.visibile) return false;
      if (filtroStato === 'nascoste' && p.visibile) return false;

      // 2. Filtro categoria
      if (filtroCategoria !== 'tutte' && p.categoria !== filtroCategoria) return false;

      // 3. Ricerca testuale
      if (ricerca.trim()) {
        const q = ricerca.toLowerCase();
        const matchNome = p.nome?.toLowerCase().includes(q);
        const matchComune = p.nome_comune?.toLowerCase().includes(q);
        const matchCat = p.categoria?.toLowerCase().includes(q);
        if (!matchNome && !matchComune && !matchCat) return false;
      }

      return true;
    });
  }, [piante, ricerca, filtroStato, filtroCategoria]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-28 sm:pb-16 text-[#1C201C] font-sans antialiased">
      {/* Header Unico e Pulito Gestione */}
      <header className="sticky top-0 z-30 bg-[#1C201C] text-white shadow-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          {/* Brand con Link Diretto alla Home (Solo icona logo ufficiale) */}
          <Link to="/" className="flex items-center gap-3 min-w-0 group" title="Vai al Catalogo Pubblico">
            <img
              src="/brand/logo-mark.svg"
              alt="Logo Campo dei Fiori"
              decoding="async"
              className="h-9 w-auto object-contain drop-shadow group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <h1 className="font-serif font-semibold text-base sm:text-lg text-white leading-tight truncate">
                {AZIENDA.nome}
              </h1>
              <p className="text-[10px] text-[#6BB221] font-bold uppercase tracking-wider leading-none mt-0.5">
                Pannello Gestione
              </p>
            </div>
          </Link>

          {/* Azioni Barra */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Tasto esplicito per tornare al sito normale */}
            <Link
              to="/"
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 text-xs font-bold flex items-center gap-1.5 transition-all touch-target active:scale-95"
              title="Esci dalla gestione e torna al sito per i clienti"
            >
              <Store className="w-4 h-4 text-[#6BB221]" />
              <span className="hidden sm:inline">Vedi Sito</span>
            </Link>

            <Link
              to="/admin/nuova"
              className="inline-flex items-center gap-1 px-3.5 py-2 bg-[#D34816] hover:bg-[#B83D12] active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm touch-target"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuova Pianta</span>
              <span className="sm:hidden">Nuova</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-white/60 hover:text-red-400 hover:bg-white/10 rounded-xl transition-colors touch-target"
              title="Disconnetti"
              aria-label="Disconnetti"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4">
        {/* Banner Evidente di Navigazione Mobile */}
        <div className="mb-4 bg-[#25570A] text-white p-3.5 rounded-2xl border border-[#357C0E]/50 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-2.5 h-2.5 rounded-full bg-[#6BB221] animate-pulse flex-shrink-0"></span>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white/95 block truncate">
                Gestionale Vivaio & Serra
              </span>
              <span className="text-[10px] text-white/70 block">
                Tocca la disponibilità per aggiornare scorte e formati vaso
              </span>
            </div>
          </div>
          <Link
            to="/"
            className="px-3 py-1.5 bg-white text-[#1C201C] hover:bg-[#FAF9F6] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-xs touch-target flex-shrink-0"
          >
            <span>Vedi Sito</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#25570A]" />
          </Link>
        </div>

        {/* Box Modifica Periodo di Validità Listino */}
        <div className="mb-4 bg-white p-4 rounded-2xl border border-[#1C201C]/10 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-[#1C201C] font-bold text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-[#25570A]" />
              <span>Periodo di validità listino (visibile ai clienti)</span>
            </div>
            <span className="text-[10px] text-[#1C201C]/50 font-medium hidden sm:inline">Modifica con un tocco</span>
          </div>
          <form onSubmit={handleSalvaValidoFino} className="flex items-center gap-2">
            <input
              type="text"
              value={validoFino}
              onChange={(e) => setValidoFino(e.target.value)}
              placeholder="Es. 31 Agosto 2026 oppure Fine Settimana..."
              className="flex-1 px-3.5 py-2.5 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-xs sm:text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A]"
            />
            <button
              type="submit"
              disabled={salvataggioValidoFino}
              className="px-4 py-2.5 bg-[#25570A] hover:bg-[#1E4608] active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center gap-1.5 touch-target flex-shrink-0"
            >
              <Save className="w-3.5 h-3.5 text-[#6BB221]" />
              <span>{salvataggioValidoFino ? 'Salvataggio...' : 'Salva'}</span>
            </button>
          </form>
        </div>

        {/* Barra di Ricerca con Tasto Cancella Rapido (X) & Filtro Categoria */}
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#1C201C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder="Cerca pianta, varietà o categoria..."
              className="w-full pl-10 pr-10 py-3 bg-white border border-[#1C201C]/15 rounded-2xl text-sm text-[#1C201C] placeholder-[#1C201C]/40 focus:outline-none focus:ring-2 focus:ring-[#25570A] shadow-xs"
            />
            {ricerca && (
              <button
                type="button"
                onClick={() => setRicerca('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#1C201C]/40 hover:text-[#1C201C] rounded-full"
                title="Cancella ricerca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {categorieDisponibili.length > 0 && (
            <select
              value={filtroCategoria}
              onChange={(e) => setFiltroCategoria(e.target.value)}
              className="px-3 py-3 bg-white border border-[#1C201C]/15 rounded-2xl text-xs sm:text-sm text-[#1C201C] font-semibold focus:outline-none focus:ring-2 focus:ring-[#25570A] shadow-xs max-w-[130px] sm:max-w-[200px]"
              title="Filtra per categoria"
            >
              <option value="tutte">Tutte le Categorie</option>
              {categorieDisponibili.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          )}
        </div>

        {/* Filtri Rapidi di Stato (Tutte / Visibili Online / Nascoste) per uso col Pollice */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFiltroStato('tutte')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all touch-target flex items-center gap-1.5 flex-shrink-0 ${
              filtroStato === 'tutte'
                ? 'bg-[#1C201C] text-white shadow-xs'
                : 'bg-white text-[#1C201C]/70 border border-[#1C201C]/10 hover:bg-[#1C201C]/5'
            }`}
          >
            <span>Tutte</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${filtroStato === 'tutte' ? 'bg-white/20 text-white' : 'bg-[#1C201C]/10 text-[#1C201C]'}`}>
              {stats.totale}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroStato('visibili')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all touch-target flex items-center gap-1.5 flex-shrink-0 ${
              filtroStato === 'visibili'
                ? 'bg-[#25570A] text-white shadow-xs'
                : 'bg-white text-[#25570A] border border-[#25570A]/20 hover:bg-[#25570A]/5'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Visibili Online</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${filtroStato === 'visibili' ? 'bg-white/20 text-white' : 'bg-[#25570A]/10 text-[#25570A]'}`}>
              {stats.visibili}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setFiltroStato('nascoste')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all touch-target flex items-center gap-1.5 flex-shrink-0 ${
              filtroStato === 'nascoste'
                ? 'bg-[#1C201C]/80 text-white shadow-xs'
                : 'bg-white text-[#1C201C]/50 border border-[#1C201C]/10 hover:bg-[#1C201C]/5'
            }`}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Nascoste</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${filtroStato === 'nascoste' ? 'bg-white/20 text-white' : 'bg-[#1C201C]/10 text-[#1C201C]/70'}`}>
              {stats.nascoste}
            </span>
          </button>
        </div>

        {/* Lista Piante */}
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-4 border border-[#1C201C]/10 animate-pulse h-28"></div>
            ))}
          </div>
        ) : pianteFiltrate.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#1C201C]/10 p-8 text-center text-[#1C201C]/60">
            <p className="text-sm font-semibold">Nessuna pianta corrisponde ai filtri selezionati.</p>
            <button
              type="button"
              onClick={() => { setRicerca(''); setFiltroStato('tutte'); setFiltroCategoria('tutte'); }}
              className="mt-3 px-4 py-2 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-xs font-bold text-[#25570A] hover:bg-[#25570A]/10"
            >
              Azzera tutti i filtri
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {pianteFiltrate.map((pianta) => {
              const isVisibile = pianta.visibile;
              const hasVarianti = Array.isArray(pianta.varianti) && pianta.varianti.length > 0;

              return (
                <div
                  key={pianta.id}
                  className={`bg-white rounded-3xl border transition-all p-3.5 sm:p-4 shadow-xs ${
                    isVisibile ? 'border-[#1C201C]/10 hover:border-[#25570A]/30' : 'border-[#1C201C]/5 opacity-75 bg-[#FAF9F6]'
                  }`}
                >
                  <div className="flex items-start sm:items-center justify-between gap-3">
                    {/* Miniatura Foto (64px x 64px) con click per aprire modifica */}
                    <Link
                      to={`/admin/${pianta.id}`}
                      className="w-16 h-16 min-w-[64px] max-w-[64px] rounded-2xl bg-[#FAF9F6] flex-shrink-0 overflow-hidden border border-[#1C201C]/10 relative group block"
                      title="Tocca per modificare la pianta"
                    >
                      {pianta.foto_url ? (
                        <img
                          src={pianta.foto_url}
                          alt={pianta.nome}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#1C201C]/30">
                          <Sprout className="w-6 h-6" />
                        </div>
                      )}
                    </Link>

                    {/* Informazioni Pianta */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link
                          to={`/admin/${pianta.id}`}
                          className="font-bold text-sm sm:text-base text-[#1C201C] hover:text-[#25570A] leading-snug truncate transition-colors"
                        >
                          {pianta.nome}
                        </Link>
                        {!isVisibile && (
                          <span className="text-[10px] bg-[#1C201C]/10 text-[#1C201C]/70 px-2 py-0.5 rounded-full font-bold">
                            Nascosta
                          </span>
                        )}
                      </div>

                      {pianta.nome_comune && (
                        <p className="text-xs text-[#1C201C]/60 truncate mt-0.5">
                          {pianta.nome_comune}
                        </p>
                      )}

                      {/* Pill Vasi / Disponibilità Interattiva con un tocco */}
                      {hasVarianti && pianta.varianti.length > 1 ? (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          {pianta.varianti.map((v, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => openVasiModal(pianta)}
                              className="inline-flex items-center gap-1.5 bg-[#FAF9F6] active:scale-95 hover:bg-[#25570A]/10 border border-[#1C201C]/10 text-[#1C201C] text-[11px] font-semibold px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                              title="Tocca per aggiornare disponibilità"
                            >
                              <span className="text-[#1C201C]/70">Ø {v.vaso_cm} cm:</span>
                              <span className="text-[#25570A] font-bold">
                                {Number(v.disponibile).toLocaleString('it-IT')} pz
                              </span>
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => openVasiModal(pianta)}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#D34816] hover:underline px-1 py-1"
                          >
                            <Layers className="w-3.5 h-3.5" />
                            <span>Vasi</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-1.5 mt-2">
                          <button
                            type="button"
                            onClick={() => openVasiModal(pianta)}
                            className="inline-flex items-center gap-1.5 bg-[#25570A]/10 hover:bg-[#25570A]/20 active:scale-95 border border-[#25570A]/20 text-[#25570A] text-xs font-bold px-2.5 py-1 rounded-xl transition-all cursor-pointer"
                            title="Tocca per aggiornare la disponibilità"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#25570A]" />
                            <span>
                              {pianta.vaso_cm ? `Ø ${pianta.vaso_cm} cm · ` : ''}
                              {Number(pianta.disponibile || 0).toLocaleString('it-IT')} pz disp.
                            </span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Tasto Occhio Visibilità Immediato e Comodo (44x44px touch target) */}
                    <button
                      onClick={() => handleToggleVisibilita(pianta)}
                      className={`touch-target p-2.5 rounded-2xl transition-all flex items-center justify-center flex-shrink-0 active:scale-90 ${
                        isVisibile
                          ? 'bg-[#25570A]/10 text-[#25570A] hover:bg-[#25570A]/20'
                          : 'bg-[#1C201C]/5 text-[#1C201C]/40 hover:bg-[#1C201C]/10'
                      }`}
                      title={isVisibile ? 'Visibile ai clienti (Tocca per nascondere)' : 'Nascosta (Tocca per rendere visibile)'}
                      aria-label={`Visibilità ${pianta.nome}`}
                    >
                      {isVisibile ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Barra Azioni Secondarie in basso alla card: Modifica ed Elimina ben distanziate */}
                  <div className="mt-3 pt-2.5 border-t border-[#1C201C]/5 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/${pianta.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#1C201C]/5 active:scale-95 text-[#1C201C] rounded-xl text-xs font-bold border border-[#1C201C]/10 transition-all touch-target"
                      >
                        <Pencil className="w-3.5 h-3.5 text-[#25570A]" />
                        <span>Modifica Scheda</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => openVasiModal(pianta)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F6] hover:bg-[#25570A]/10 active:scale-95 text-[#25570A] rounded-xl text-xs font-bold border border-[#1C201C]/10 transition-all touch-target"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Disponibilità</span> Vasi
                      </button>
                    </div>

                    <button
                      onClick={() => setEliminaModal({ isOpen: true, pianta, loading: false })}
                      className="p-2 text-[#1C201C]/40 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors touch-target"
                      title="Elimina pianta"
                      aria-label={`Elimina ${pianta.nome}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Pulsante Fluttuante (FAB) per Mobile per aggiungere piante all'istante con il pollice */}
      <Link
        to="/admin/nuova"
        className="sm:hidden fixed bottom-6 right-4 z-40 bg-[#D34816] hover:bg-[#B83D12] active:scale-95 text-white font-bold px-4 py-3.5 rounded-full shadow-2xl flex items-center gap-2 border-2 border-white transition-transform touch-target"
        title="Aggiungi Nuova Pianta"
      >
        <Plus className="w-5 h-5 stroke-[2.5]" />
        <span className="text-xs font-extrabold tracking-wide">Nuova Pianta</span>
      </Link>

      {/* Modale Rapida Gestione Disponibilità per Calibro Vaso */}
      {vasiModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl border border-[#1C201C]/15 my-auto animate-in fade-in zoom-in-95 duration-200">
            {/* Intestazione Modale */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#1C201C]/10 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-[#25570A]/10 text-[#25570A] rounded-lg">
                    <Layers className="w-4 h-4" />
                  </span>
                  <h3 className="font-serif font-bold text-lg sm:text-xl text-[#1C201C] leading-tight">
                    Disponibilità per Vaso
                  </h3>
                </div>
                <p className="text-xs text-[#1C201C]/70 mt-1">
                  {vasiModal.pianta?.nome} {vasiModal.pianta?.nome_comune ? `(${vasiModal.pianta.nome_comune})` : ''}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setVasiModal({ isOpen: false, pianta: null, varianti: [], loading: false })}
                className="p-1.5 rounded-xl text-[#1C201C]/40 hover:text-[#1C201C] hover:bg-[#1C201C]/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Istruzione per l'operatore */}
            <div className="mb-4 bg-[#FAF9F6] p-3 rounded-xl border border-[#1C201C]/10 text-xs text-[#1C201C]/80 leading-relaxed">
              Tocca i tasti rapidi (+10, +50, +100) per aggiornare le quantità in serra senza digitare sulla tastiera.
            </div>

            {/* Elenco Formati Vaso */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1 mb-4">
              {vasiModal.varianti.map((v, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#1C201C]/10 space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-[#1C201C] flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-[#25570A] text-white flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                      Formato Vaso {v.vaso_cm ? `Ø ${v.vaso_cm} cm` : ''}
                    </span>

                    {vasiModal.varianti.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRimuoviVaso(idx)}
                        className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Rimuovi</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1C201C]/60 mb-1">
                        Diametro (cm) *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={v.vaso_cm}
                        onChange={(e) => handleVasoChange(idx, 'vaso_cm', e.target.value)}
                        placeholder="es. 16"
                        className="w-full px-2.5 py-2.5 bg-white border border-[#1C201C]/15 rounded-xl text-sm font-bold text-[#1C201C] text-center focus:outline-none focus:ring-2 focus:ring-[#25570A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#25570A] mb-1">
                        Disponibile (pz) *
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={v.disponibile}
                        onChange={(e) => handleVasoChange(idx, 'disponibile', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-2.5 bg-white border border-[#25570A]/40 rounded-xl text-sm font-bold text-[#25570A] text-center focus:outline-none focus:ring-2 focus:ring-[#25570A]"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1C201C]/60 mb-1">
                        Giacenza (pz)
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={v.giacenza}
                        onChange={(e) => handleVasoChange(idx, 'giacenza', e.target.value)}
                        placeholder="0"
                        className="w-full px-2.5 py-2.5 bg-white border border-[#1C201C]/15 rounded-xl text-sm font-medium text-[#1C201C]/70 text-center focus:outline-none focus:ring-2 focus:ring-[#25570A]"
                      />
                    </div>
                  </div>

                  {/* Tasti Rapidi Incremento/Decremento Pollice-Friendly */}
                  <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#1C201C]/5">
                    <span className="text-[10px] text-[#1C201C]/50 font-bold uppercase">Rapido Disp:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleModificaQuantitaRapida(idx, 'disponibile', -10)}
                        className="px-2 py-1 bg-white border border-[#1C201C]/15 hover:bg-[#1C201C]/5 text-[11px] font-bold text-[#1C201C] rounded-lg active:scale-95 touch-target"
                        title="Togli 10 pezzi"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModificaQuantitaRapida(idx, 'disponibile', 10)}
                        className="px-2 py-1 bg-[#25570A]/10 border border-[#25570A]/20 hover:bg-[#25570A]/20 text-[11px] font-bold text-[#25570A] rounded-lg active:scale-95 touch-target"
                        title="Aggiungi 10 pezzi"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModificaQuantitaRapida(idx, 'disponibile', 50)}
                        className="px-2 py-1 bg-[#25570A]/10 border border-[#25570A]/20 hover:bg-[#25570A]/20 text-[11px] font-bold text-[#25570A] rounded-lg active:scale-95 touch-target"
                        title="Aggiungi 50 pezzi"
                      >
                        +50
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModificaQuantitaRapida(idx, 'disponibile', 100)}
                        className="px-2 py-1 bg-[#25570A]/10 border border-[#25570A]/20 hover:bg-[#25570A]/20 text-[11px] font-bold text-[#25570A] rounded-lg active:scale-95 touch-target"
                        title="Aggiungi 100 pezzi"
                      >
                        +100
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Aggiungi Altro Formato */}
            <button
              type="button"
              onClick={handleAggiungiVaso}
              className="w-full py-2.5 mb-5 border-2 border-dashed border-[#25570A]/30 hover:border-[#25570A] bg-[#FAF9F6] hover:bg-[#25570A]/5 text-[#25570A] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Aggiungi Altro Calibro Vaso (es. Ø 19 cm, Ø 24 cm)</span>
            </button>

            {/* Azioni Modale */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#1C201C]/10">
              <button
                type="button"
                onClick={() => setVasiModal({ isOpen: false, pianta: null, varianti: [], loading: false })}
                disabled={vasiModal.loading}
                className="px-4 py-2.5 text-xs font-semibold text-[#1C201C]/70 hover:bg-[#1C201C]/5 rounded-xl transition-colors touch-target"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={handleSalvaVasi}
                disabled={vasiModal.loading}
                className="px-5 py-2.5 text-xs font-bold bg-[#D34816] hover:bg-[#B83D12] active:scale-95 text-white rounded-xl transition-all shadow-xs flex items-center gap-1.5 touch-target"
              >
                {vasiModal.loading ? (
                  <span>Salvataggio...</span>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Salva Disponibilità</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale Eliminazione */}
      {eliminaModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-xl border border-[#1C201C]/15 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-serif font-bold text-base text-[#1C201C] mb-1.5">
              Eliminare {eliminaModal.pianta?.nome}?
            </h3>
            <p className="text-xs text-[#1C201C]/70 mb-5 leading-relaxed">
              La pianta verrà rimossa definitivamente dal catalogo e dallo spazio foto.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEliminaModal({ isOpen: false, pianta: null, loading: false })}
                disabled={eliminaModal.loading}
                className="px-3.5 py-2 text-xs font-semibold text-[#1C201C]/70 hover:bg-[#1C201C]/5 rounded-xl transition-colors touch-target"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={eseguiEliminazione}
                disabled={eliminaModal.loading}
                className="px-4 py-2 text-xs font-bold bg-red-700 hover:bg-red-800 text-white rounded-xl transition-colors shadow-xs touch-target"
              >
                {eliminaModal.loading ? 'Eliminazione...' : 'Elimina'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}

