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
  Warehouse
} from 'lucide-react';
import Toast from '../components/Toast';

export default function AdminLista() {
  const [piante, setPiante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ricerca, setRicerca] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [eliminaModal, setEliminaModal] = useState({ isOpen: false, pianta: null, loading: false });

  // Periodo di validità listino
  const [validoFino, setValidoFino] = useState('31 Agosto 2026');
  const [salvataggioValidoFino, setSalvataggioValidoFino] = useState(false);

  const navigate = useNavigate();

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
    <div className="min-h-screen bg-[#F2F3EB] pb-24 sm:pb-16 text-[#282B27]">
      {/* Header Unico e Pulito Gestione */}
      <header className="sticky top-0 z-30 bg-[#25570A] text-white shadow-md border-b border-[#357C0E]/40">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          {/* Brand con Link Diretto alla Home */}
          <Link to="/" className="flex items-center gap-2.5 min-w-0 group" title="Vai al Catalogo Pubblico">
            <img
              src="/brand/logo-mark.webp"
              alt="Logo Campo dei Fiori"
              decoding="async"
              className="h-8 w-auto object-contain drop-shadow group-hover:scale-105 transition-transform"
            />
            <div className="min-w-0">
              <h1 className="font-display font-bold text-base sm:text-lg text-white leading-tight truncate">
                {AZIENDA.nome}
              </h1>
              <p className="text-[10px] text-[#6BB221] font-bold uppercase tracking-wider leading-none mt-0.5">
                Pannello Gestione
              </p>
            </div>
          </Link>

          {/* Azioni Barra */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Tasto esplicito e visibile per tornare al sito normale */}
            <Link
              to="/"
              className="px-3 py-2 rounded-xl bg-[#183806] hover:bg-[#122A04] text-[#6BB221] border border-[#6BB221]/30 text-xs font-bold flex items-center gap-1.5 transition-all touch-target active:scale-95"
              title="Esci dalla gestione e torna al sito per i clienti"
            >
              <Store className="w-4 h-4 text-[#6BB221]" />
              <span>Vedi Sito</span>
            </Link>

            <Link
              to="/admin/nuova"
              className="inline-flex items-center gap-1 px-3 py-2 bg-[#EA4707] hover:bg-[#CF3B02] active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm touch-target"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nuova Pianta</span>
              <span className="sm:hidden">Nuova</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-stone-400 hover:text-red-400 hover:bg-white/10 rounded-xl transition-colors touch-target"
              title="Disconnetti"
              aria-label="Disconnetti"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4">
        {/* Banner Evidente di Navigazione Mobile: "Sei nell'area privata" + "Vai al Catalogo" */}
        <div className="mb-4 bg-emerald-900 text-white p-3 rounded-2xl border border-emerald-700/50 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2 min-w-0">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0"></span>
            <span className="text-xs text-emerald-100 truncate">
              Sei nella gestione vivaio
            </span>
          </div>
          <Link
            to="/"
            className="px-3 py-1.5 bg-white text-emerald-950 hover:bg-stone-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm touch-target flex-shrink-0"
          >
            <span>Vedi Sito Clienti</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Box Modifica Periodo di Validità Listino */}
        <div className="mb-4 bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2 text-stone-900 font-bold text-xs sm:text-sm">
              <Calendar className="w-4 h-4 text-emerald-800" />
              <span>Periodo di validità listino (visibile ai clienti)</span>
            </div>
            <span className="text-[10px] text-stone-400 font-medium hidden sm:inline">Modifica con un tocco</span>
          </div>
          <form onSubmit={handleSalvaValidoFino} className="flex items-center gap-2">
            <input
              type="text"
              value={validoFino}
              onChange={(e) => setValidoFino(e.target.value)}
              placeholder="Es. 31 Agosto 2026 oppure Fine Settimana..."
              className="flex-1 px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-emerald-800"
            />
            <button
              type="submit"
              disabled={salvataggioValidoFino}
              className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-700 active:scale-95 text-white font-semibold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 touch-target flex-shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{salvataggioValidoFino ? 'Salvataggio...' : 'Salva'}</span>
            </button>
          </form>
        </div>

        {/* Statistiche */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
              Totali
            </span>
            <span className="text-xl font-bold text-stone-900">
              {stats.totale}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block mb-0.5">
              Visibili
            </span>
            <span className="text-xl font-bold text-emerald-800">
              {stats.visibili}
            </span>
          </div>

          <div className="bg-white p-3 rounded-xl border border-stone-200 shadow-sm text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-0.5">
              Nascoste
            </span>
            <span className="text-xl font-bold text-stone-500">
              {stats.nascoste}
            </span>
          </div>
        </div>

        {/* Ricerca */}
        <div className="relative mb-4">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
            placeholder="Cerca per nome botanico o comune..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-800 shadow-sm"
          />
        </div>

        {/* Lista Piante */}
        {loading ? (
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-xl p-4 border border-stone-200 animate-pulse h-20"></div>
            ))}
          </div>
        ) : pianteFiltrate.length === 0 ? (
          <div className="bg-white rounded-xl border border-stone-200 p-8 text-center text-stone-500">
            <p className="text-sm font-medium">Nessuna pianta trovata nel gestionale.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pianteFiltrate.map((pianta) => {
              const isVisibile = pianta.visibile;
              return (
                <div
                  key={pianta.id}
                  className={`bg-white rounded-xl border transition-all p-3 flex items-center justify-between gap-3 shadow-sm ${
                    isVisibile ? 'border-stone-200' : 'border-stone-200/60 opacity-60 bg-stone-50/70'
                  }`}
                >
                  {/* Miniatura Foto con dimensioni rigorosamente FISSE (64px x 64px) */}
                  <div className="w-16 h-16 min-w-[64px] max-w-[64px] rounded-lg bg-stone-100 flex-shrink-0 overflow-hidden border border-stone-200 relative">
                    {pianta.foto_url ? (
                      <img
                        src={pianta.foto_url}
                        alt={pianta.nome}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-stone-300">
                        <Sprout className="w-6 h-6" />
                      </div>
                    )}
                  </div>

                  {/* Testi Pianta */}
                  <div className="min-w-0 flex-1 py-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="font-bold text-sm sm:text-base text-stone-900 leading-snug truncate">
                        {pianta.nome}
                      </h3>
                      {!isVisibile && (
                        <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.5 rounded font-medium">
                          Nascosta
                        </span>
                      )}
                    </div>

                    {pianta.nome_comune && (
                      <p className="text-xs text-stone-500 truncate">
                        {pianta.nome_comune}
                      </p>
                    )}

                    {/* Varianti / Vasi e disponibilità */}
                    {Array.isArray(pianta.varianti) && pianta.varianti.length > 1 ? (
                      <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                        {pianta.varianti.map((v, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-1 bg-stone-100 border border-stone-200 text-stone-800 text-[11px] font-medium px-2 py-0.5 rounded-lg"
                          >
                            <span className="font-bold">Ø {v.vaso_cm} cm:</span>
                            <span className="text-emerald-800 font-bold">{Number(v.disponibile).toLocaleString('it-IT')} pz</span>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-stone-600 mt-1">
                        {pianta.vaso_cm && (
                          <span className="font-medium text-stone-700 bg-stone-100 px-1.5 py-0.5 rounded">
                            Ø {pianta.vaso_cm} cm
                          </span>
                        )}
                        {pianta.disponibile !== null && pianta.disponibile !== undefined && (
                          <span className="text-emerald-900 font-bold bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                            Disp: {Number(pianta.disponibile).toLocaleString('it-IT')} pz
                          </span>
                        )}
                        {pianta.giacenza !== null && pianta.giacenza !== undefined && (
                          <span className="text-stone-600 font-medium bg-stone-100 px-1.5 py-0.5 rounded flex items-center gap-1">
                            <Warehouse className="w-3 h-3 text-stone-400" />
                            Giac: {Number(pianta.giacenza).toLocaleString('it-IT')}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Azioni Tattili (Occhio, Matita, Cestino) */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    {/* Occhio: visibilità */}
                    <button
                      onClick={() => handleToggleVisibilita(pianta)}
                      className={`touch-target p-2 rounded-lg transition-colors ${
                        isVisibile
                          ? 'text-emerald-800 hover:bg-emerald-50'
                          : 'text-stone-400 hover:bg-stone-100'
                      }`}
                      title={isVisibile ? 'Nascondi dal catalogo' : 'Rendi visibile'}
                      aria-label={`Visibilità ${pianta.nome}`}
                    >
                      {isVisibile ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>

                    {/* Matita: modifica */}
                    <Link
                      to={`/admin/${pianta.id}`}
                      className="touch-target p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Modifica"
                      aria-label={`Modifica ${pianta.nome}`}
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>

                    {/* Cestino: elimina */}
                    <button
                      onClick={() => setEliminaModal({ isOpen: true, pianta, loading: false })}
                      className="touch-target p-2 text-stone-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* Modale Eliminazione */}
      {eliminaModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-xs w-full shadow-xl border border-stone-200">
            <h3 className="font-bold text-base text-stone-900 mb-1.5">
              Eliminare {eliminaModal.pianta?.nome}?
            </h3>
            <p className="text-xs text-stone-600 mb-5 leading-relaxed">
              La pianta verrà rimossa definitivamente dal database e dallo spazio foto.
            </p>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEliminaModal({ isOpen: false, pianta: null, loading: false })}
                disabled={eliminaModal.loading}
                className="px-3.5 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors touch-target"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={eseguiEliminazione}
                disabled={eliminaModal.loading}
                className="px-4 py-2 text-xs font-semibold bg-red-700 hover:bg-red-800 text-white rounded-xl transition-colors shadow-sm touch-target"
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
