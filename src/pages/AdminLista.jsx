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

  // Filtro ricerca
  const pianteFiltrate = useMemo(() => {
    if (!ricerca.trim()) return piante;
    const q = ricerca.toLowerCase();
    return piante.filter((p) =>
      p.nome.toLowerCase().includes(q) ||
      (p.nome_comune && p.nome_comune.toLowerCase().includes(q)) ||
      (p.categoria && p.categoria.toLowerCase().includes(q))
    );
  }, [piante, ricerca]);

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 sm:pb-16 text-[#1C201C] font-sans antialiased">
      {/* Header Unico e Pulito Gestione */}
      <header className="sticky top-0 z-30 bg-[#1C201C] text-white shadow-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          {/* Brand con Link Diretto alla Home (Solo icona logo ufficiale) */}
          <Link to="/" className="flex items-center gap-3 min-w-0 group" title="Vai al Catalogo Pubblico">
            <img
              src="/brand/logo-mark.webp"
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
              <span className="text-xs font-medium text-white/95 block truncate">
                Gestionale Serra & Vivaio
              </span>
              <span className="text-[10px] text-white/70 block">
                Tocca un formato vaso per aggiornare giacenza e disponibilità
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

        {/* Statistiche */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="bg-white p-3 rounded-2xl border border-[#1C201C]/10 shadow-xs text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C201C]/50 block mb-0.5">
              Totali
            </span>
            <span className="text-xl font-bold text-[#1C201C]">
              {stats.totale}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#1C201C]/10 shadow-xs text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#25570A] block mb-0.5">
              Visibili
            </span>
            <span className="text-xl font-bold text-[#25570A]">
              {stats.visibili}
            </span>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-[#1C201C]/10 shadow-xs text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1C201C]/50 block mb-0.5">
              Nascoste
            </span>
            <span className="text-xl font-bold text-[#1C201C]/50">
              {stats.nascoste}
            </span>
          </div>
        </div>

        {/* Ricerca */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-[#1C201C]/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
            placeholder="Cerca per nome botanico o comune..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] placeholder-[#1C201C]/40 focus:outline-none focus:ring-2 focus:ring-[#25570A] shadow-xs"
          />
        </div>

        {/* Lista Piante */}
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-2xl p-4 border border-[#1C201C]/10 animate-pulse h-20"></div>
            ))}
          </div>
        ) : pianteFiltrate.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#1C201C]/10 p-8 text-center text-[#1C201C]/60">
            <p className="text-sm font-medium">Nessuna pianta trovata nel gestionale.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pianteFiltrate.map((pianta) => {
              const isVisibile = pianta.visibile;
              const hasVarianti = Array.isArray(pianta.varianti) && pianta.varianti.length > 0;

              return (
                <div
                  key={pianta.id}
                  className={`bg-white rounded-2xl border transition-all p-3.5 flex items-center justify-between gap-3 shadow-xs ${
                    isVisibile ? 'border-[#1C201C]/10 hover:border-[#25570A]/30' : 'border-[#1C201C]/5 opacity-60 bg-[#FAF9F6]'
                  }`}
                >
                  {/* Miniatura Foto con dimensioni rigorosamente FISSE (64px x 64px) */}
                  <div className="w-16 h-16 min-w-[64px] max-w-[64px] rounded-xl bg-[#FAF9F6] flex-shrink-0 overflow-hidden border border-[#1C201C]/10 relative">
                    {pianta.foto_url ? (
                      <img
                        src={pianta.foto_url}
                        alt={pianta.nome}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#1C201C]/30">
                        <Sprout className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Testi Pianta */}
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-[#1C201C] leading-snug truncate">
                        {pianta.nome}
                      </h3>
                      {!isVisibile && (
                        <span className="text-[10px] bg-[#1C201C]/10 text-[#1C201C]/70 px-1.5 py-0.5 rounded-md font-medium">
                          Nascosta
                        </span>
                      )}
                    </div>

                    {pianta.nome_comune && (
                      <p className="text-xs text-[#1C201C]/60 truncate">
                        {pianta.nome_comune}
                      </p>
                    )}

                    {/* Varianti / Vasi e disponibilità - Interattivi con un tocco */}
                    {hasVarianti && pianta.varianti.length > 1 ? (
                      <div className="flex flex-wrap items-center gap-1.5 mt-2">
                        {pianta.varianti.map((v, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => openVasiModal(pianta)}
                            className="inline-flex items-center gap-1 bg-[#FAF9F6] hover:bg-[#25570A]/10 border border-[#1C201C]/10 hover:border-[#25570A]/30 text-[#1C201C] text-[11px] font-medium px-2 py-0.5 rounded-lg transition-colors cursor-pointer group"
                            title="Tocca per modificare le disponibilità per vaso"
                          >
                            <span className="font-bold text-[#1C201C]/80">Ø {v.vaso_cm} cm:</span>
                            <span className="text-[#25570A] font-bold group-hover:underline">
                              {Number(v.disponibile).toLocaleString('it-IT')} pz
                            </span>
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => openVasiModal(pianta)}
                          className="inline-flex items-center gap-1 text-[10px] font-bold text-[#D34816] hover:underline px-1 py-0.5"
                          title="Gestisci formati vaso"
                        >
                          <Layers className="w-3 h-3" />
                          <span>Modifica Vasi</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[#1C201C]/70 mt-1.5">
                        {pianta.vaso_cm && (
                          <button
                            type="button"
                            onClick={() => openVasiModal(pianta)}
                            className="font-medium text-[#1C201C] bg-[#FAF9F6] hover:bg-[#25570A]/10 border border-[#1C201C]/10 px-2 py-0.5 rounded-md flex items-center gap-1 cursor-pointer transition-colors"
                            title="Tocca per gestire i formati vaso"
                          >
                            <Layers className="w-3 h-3 text-[#25570A]" />
                            <span>Ø {pianta.vaso_cm} cm</span>
                          </button>
                        )}
                        {pianta.disponibile !== null && pianta.disponibile !== undefined && (
                          <span className="text-[#25570A] font-bold bg-[#25570A]/10 border border-[#25570A]/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#25570A]" />
                            Disp: {Number(pianta.disponibile).toLocaleString('it-IT')} pz
                          </span>
                        )}
                        {pianta.giacenza !== null && pianta.giacenza !== undefined && (
                          <span className="text-[#1C201C]/60 font-medium bg-[#FAF9F6] border border-[#1C201C]/10 px-1.5 py-0.5 rounded-md flex items-center gap-1">
                            <Warehouse className="w-3 h-3 text-[#1C201C]/40" />
                            Giac: {Number(pianta.giacenza).toLocaleString('it-IT')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Azioni Tattili (Vasi, Occhio, Matita, Cestino) */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {/* Tasto rapido gestione vasi */}
                    <button
                      type="button"
                      onClick={() => openVasiModal(pianta)}
                      className="touch-target p-2 rounded-xl text-[#1C201C]/60 hover:text-[#25570A] hover:bg-[#25570A]/10 transition-colors"
                      title="Gestione vasi e scorte per formato"
                      aria-label={`Formati vaso ${pianta.nome}`}
                    >
                      <Layers className="w-5 h-5" />
                    </button>

                    {/* Occhio: visibilità */}
                    <button
                      onClick={() => handleToggleVisibilita(pianta)}
                      className={`touch-target p-2 rounded-xl transition-colors ${
                        isVisibile
                          ? 'text-[#25570A] hover:bg-[#25570A]/10'
                          : 'text-[#1C201C]/30 hover:bg-[#1C201C]/10'
                      }`}
                      title={isVisibile ? 'Nascondi dal catalogo' : 'Rendi visibile'}
                      aria-label={`Visibilità ${pianta.nome}`}
                    >
                      {isVisibile ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>

                    {/* Matita: modifica scheda */}
                    <Link
                      to={`/admin/${pianta.id}`}
                      className="touch-target p-2 text-[#1C201C]/60 hover:text-[#1C201C] hover:bg-[#1C201C]/10 rounded-xl transition-colors"
                      title="Modifica scheda completa"
                      aria-label={`Modifica ${pianta.nome}`}
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>

                    {/* Cestino: elimina */}
                    <button
                      onClick={() => setEliminaModal({ isOpen: true, pianta, loading: false })}
                      className="touch-target p-2 text-[#1C201C]/40 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                      title="Elimina"
                      aria-label={`Elimina ${pianta.nome}`}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

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
              La pianta resta una sola nel catalogo. Qui imposti i diversi formati di vaso con le rispettive quantità disponibili e le giacenze.
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
                        className="w-full px-2.5 py-2 bg-white border border-[#1C201C]/15 rounded-xl text-sm font-bold text-[#1C201C] text-center focus:outline-none focus:ring-2 focus:ring-[#25570A]"
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
                        className="w-full px-2.5 py-2 bg-white border border-[#25570A]/40 rounded-xl text-sm font-bold text-[#25570A] text-center focus:outline-none focus:ring-2 focus:ring-[#25570A]"
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
                        className="w-full px-2.5 py-2 bg-white border border-[#1C201C]/15 rounded-xl text-sm font-medium text-[#1C201C]/70 text-center focus:outline-none focus:ring-2 focus:ring-[#25570A]"
                      />
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

