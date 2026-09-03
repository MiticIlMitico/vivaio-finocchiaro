import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  Plus, 
  Search, 
  Eye, 
  EyeOff, 
  Pencil, 
  Trash2, 
  LogOut, 
  Sprout, 
  RefreshCw, 
  AlertCircle,
  Package,
  Layers,
  CheckCircle,
  X
} from 'lucide-react';
import Toast from '../components/Toast';

export default function AdminLista() {
  const [piante, setPiante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ricerca, setRicerca] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [eliminaModal, setEliminaModal] = useState({ isOpen: false, pianta: null, loading: false });

  const navigate = useNavigate();

  // Caricamento completo di tutte le piante (visibili e nascoste) per utenti autenticati
  const caricaPiante = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('piante')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (error) throw error;
      setPiante(data || []);
    } catch (err) {
      console.error('Errore nel caricamento piante admin:', err);
      setToast({
        message: 'Errore nel caricamento del catalogo. Riprova.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    caricaPiante();
  }, []);

  // Logout
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (err) {
      console.error('Errore durante il logout:', err);
    }
  };

  // Toggle visibilità rapido (Occhio) con aggiornamento OTTIMISTICO e rollback
  const handleToggleVisibilita = async (piantaTarget) => {
    const nuovoStato = !piantaTarget.visibile;
    
    // Aggiornamento ottimistico locale immediato
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
        message: `${piantaTarget.nome} ${nuovoStato ? 'ora è visibile nel catalogo' : 'è stata nascosta'}`,
        type: 'success'
      });
    } catch (err) {
      console.error('Errore aggiornamento visibilità:', err);
      // Rollback stato locale
      setPiante((prev) =>
        prev.map((p) => (p.id === piantaTarget.id ? { ...p, visibile: piantaTarget.visibile } : p))
      );
      setToast({
        message: 'Impossibile aggiornare la visibilità. Riprova.',
        type: 'error'
      });
    }
  };

  // Conferma ed eliminazione definitiva pianta + foto da Storage
  const eseguiEliminazione = async () => {
    const { pianta } = eliminaModal;
    if (!pianta) return;

    setEliminaModal((prev) => ({ ...prev, loading: true }));

    try {
      // 1. Elimina riga dal database
      const { error: dbError } = await supabase
        .from('piante')
        .delete()
        .eq('id', pianta.id);

      if (dbError) throw dbError;

      // 2. Se ha una foto nel bucket Storage, rimuovila
      if (pianta.foto_path) {
        try {
          await supabase.storage.from('foto-piante').remove([pianta.foto_path]);
        } catch (storageErr) {
          console.warn('Errore rimozione foto da storage:', storageErr);
        }
      }

      // 3. Rimuovi dalla lista locale
      setPiante((prev) => prev.filter((p) => p.id !== pianta.id));
      setToast({
        message: `"${pianta.nome}" eliminata con successo`,
        type: 'success'
      });
      setEliminaModal({ isOpen: false, pianta: null, loading: false });
    } catch (err) {
      console.error('Errore eliminazione pianta:', err);
      setToast({
        message: 'Impossibile eliminare la pianta. Riprova.',
        type: 'error'
      });
      setEliminaModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // Statistiche riepilogative
  const stats = useMemo(() => {
    const totale = piante.length;
    const visibili = piante.filter((p) => p.visibile).length;
    const nascoste = totale - visibili;
    return { totale, visibili, nascoste };
  }, [piante]);

  // Piante filtrate dalla ricerca
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
    <div className="min-h-screen bg-stone-100 pb-28 sm:pb-16">
      {/* Header Admin */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-moss-700 text-white flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base sm:text-lg text-stone-900 leading-tight">
                Gestione Catalogo
              </h1>
              <p className="text-[10px] text-stone-500 hidden sm:block">
                Pannello vivaio mobile-first
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to="/admin/nuova"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 bg-moss-700 hover:bg-moss-800 text-white text-xs font-semibold rounded-xl transition-colors touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Nuova Pianta</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 sm:px-3 sm:py-2 text-stone-600 hover:text-clay-700 hover:bg-stone-100 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 touch-target"
              title="Disconnetti"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Esci</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">
        {/* Card Riepilogo Statistiche */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-400 block">
              Totali
            </span>
            <span className="text-xl sm:text-2xl font-display font-bold text-stone-900">
              {stats.totale}
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-moss-700 block">
              Pubblicate
            </span>
            <span className="text-xl sm:text-2xl font-display font-bold text-moss-700">
              {stats.visibili}
            </span>
          </div>

          <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-stone-200 shadow-sm">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-stone-500 block">
              Nascoste
            </span>
            <span className="text-xl sm:text-2xl font-display font-bold text-stone-500">
              {stats.nascoste}
            </span>
          </div>
        </div>

        {/* Barra di Ricerca */}
        <div className="relative mb-6">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
            placeholder="Cerca pianta nel gestionale..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-moss-600 shadow-sm"
          />
        </div>

        {/* Lista Piante Mobile-First */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-xl p-4 border border-stone-200 animate-pulse h-20"></div>
            ))}
          </div>
        ) : pianteFiltrate.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200 p-8 text-center text-stone-500">
            <p className="text-sm font-medium">Nessuna pianta trovata.</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {pianteFiltrate.map((pianta) => {
              const isVisibile = pianta.visibile;
              return (
                <div
                  key={pianta.id}
                  className={`bg-white rounded-xl border transition-all p-3 sm:p-4 flex items-center justify-between gap-3 shadow-sm ${
                    isVisibile ? 'border-stone-200/90' : 'border-stone-200/60 opacity-60 bg-stone-50/50'
                  }`}
                >
                  {/* Info Principale + Miniatura */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-stone-100 flex-shrink-0 overflow-hidden border border-stone-200">
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

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-semibold text-sm sm:text-base text-stone-900 truncate">
                          {pianta.nome}
                        </h3>
                        {!isVisibile && (
                          <span className="text-[10px] bg-stone-200 text-stone-600 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                            Nascosta
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-stone-500 mt-0.5">
                        {pianta.vaso_cm && <span>Vaso Ø {pianta.vaso_cm} cm</span>}
                        {pianta.disponibilita_carrelli && (
                          <span className="text-moss-800 font-medium">
                            Disp: {pianta.disponibilita_carrelli}
                          </span>
                        )}
                        <span className="font-bold text-stone-800">
                          {pianta.prezzo ? `€ ${Number(pianta.prezzo).toFixed(2)}` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 3 Azioni con touch-target >= 44x44 */}
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {/* Occhio: Toggle Visibilità */}
                    <button
                      onClick={() => handleToggleVisibilita(pianta)}
                      className={`touch-target p-2.5 rounded-xl transition-colors ${
                        isVisibile
                          ? 'text-moss-700 hover:bg-moss-50'
                          : 'text-stone-400 hover:bg-stone-100'
                      }`}
                      title={isVisibile ? 'Nascondi pianta dal catalogo pubblico' : 'Rendi pianta visibile nel catalogo'}
                      aria-label={isVisibile ? `Nascondi ${pianta.nome}` : `Pubblica ${pianta.nome}`}
                    >
                      {isVisibile ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>

                    {/* Matita: Modifica */}
                    <Link
                      to={`/admin/${pianta.id}`}
                      className="touch-target p-2.5 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors"
                      title="Modifica pianta"
                      aria-label={`Modifica ${pianta.nome}`}
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>

                    {/* Cestino: Elimina con conferma */}
                    <button
                      onClick={() => setEliminaModal({ isOpen: true, pianta, loading: false })}
                      className="touch-target p-2.5 rounded-xl text-stone-400 hover:text-clay-700 hover:bg-clay-50 transition-colors"
                      title="Elimina pianta"
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
      </div>

      {/* Pulsante Floating Mobile "Nuova Pianta" (Sempre raggiungibile col pollice in basso a destra) */}
      <div className="fixed bottom-6 right-6 sm:hidden z-40">
        <Link
          to="/admin/nuova"
          className="w-14 h-14 bg-moss-700 text-white rounded-full shadow-xl flex items-center justify-center hover:bg-moss-800 active:scale-95 transition-all touch-target"
          aria-label="Crea nuova pianta"
        >
          <Plus className="w-7 h-7" />
        </Link>
      </div>

      {/* Modale di Conferma Eliminazione Esplicita */}
      {eliminaModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-stone-200">
            <h3 className="font-display font-bold text-lg text-stone-900 mb-2">
              Vuoi eliminare {eliminaModal.pianta?.nome}?
            </h3>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">
              L'operazione non si annulla. La pianta e la relativa foto verranno cancellate definitivamente dal database e dallo spazio di archiviazione.
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEliminaModal({ isOpen: false, pianta: null, loading: false })}
                disabled={eliminaModal.loading}
                className="px-4 py-2.5 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors touch-target"
              >
                Annulla
              </button>
              <button
                type="button"
                onClick={eseguiEliminazione}
                disabled={eliminaModal.loading}
                className="px-4 py-2.5 text-xs font-semibold bg-clay-700 hover:bg-clay-800 text-white rounded-xl transition-colors shadow-sm touch-target"
              >
                {eliminaModal.loading ? 'Eliminazione...' : 'Sì, Elimina'}
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
