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
  AlertCircle
} from 'lucide-react';
import Toast from '../components/Toast';

export default function AdminLista() {
  const [piante, setPiante] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ricerca, setRicerca] = useState('');
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [eliminaModal, setEliminaModal] = useState({ isOpen: false, pianta: null, loading: false });

  const navigate = useNavigate();

  // Caricamento completo delle piante
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
        message: `"${pianta.nome}" eliminata.`,
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
    <div className="min-h-screen bg-stone-100 pb-24 sm:pb-16 text-stone-800">
      {/* Header Gestione pulito per Smartphone */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          {/* Titolo e Stemma */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center flex-shrink-0">
              <Sprout className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <h1 className="font-bold text-base sm:text-lg text-stone-900 leading-tight truncate">
                Gestione Vivaio
              </h1>
              <p className="text-[10px] text-stone-500 font-medium leading-none">
                Pannello per smartphone
              </p>
            </div>
          </div>

          {/* Azioni Header */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <Link
              to="/admin/nuova"
              className="inline-flex items-center gap-1 px-3 py-2 bg-emerald-800 hover:bg-emerald-900 active:scale-95 text-white text-xs font-semibold rounded-xl transition-all shadow-sm touch-target"
            >
              <Plus className="w-4 h-4" />
              <span>Nuova</span>
            </Link>

            <button
              onClick={handleLogout}
              className="p-2 text-stone-600 hover:text-red-700 hover:bg-stone-100 rounded-xl transition-colors touch-target"
              title="Esci"
              aria-label="Esci dall'account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pt-5">
        {/* Statistiche leggere */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
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
            <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-0.5">
              Nascoste
            </span>
            <span className="text-xl font-bold text-stone-500">
              {stats.nascoste}
            </span>
          </div>
        </div>

        {/* Input Ricerca */}
        <div className="relative mb-5">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={ricerca}
            onChange={(e) => setRicerca(e.target.value)}
            placeholder="Cerca pianta per nome o categoria..."
            className="w-full pl-10 pr-4 py-3 bg-white border border-stone-200 rounded-xl text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-800 shadow-sm"
          />
        </div>

        {/* Elenco Piante */}
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
                  className={`bg-white rounded-xl border transition-all p-3 sm:p-4 flex items-center justify-between gap-3 shadow-sm ${
                    isVisibile ? 'border-stone-200' : 'border-stone-200 opacity-60 bg-stone-50'
                  }`}
                >
                  {/* Foto + Dati Pianta */}
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="w-13 h-13 sm:w-16 sm:h-16 rounded-lg bg-stone-100 flex-shrink-0 overflow-hidden border border-stone-200">
                      {pianta.foto_url ? (
                        <img
                          src={pianta.foto_url}
                          alt={pianta.nome}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <Sprout className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-stone-900 leading-snug">
                          {pianta.nome}
                        </h3>
                        {!isVisibile && (
                          <span className="text-[10px] bg-stone-200 text-stone-700 px-1.5 py-0.2 rounded font-medium">
                            Nascosta
                          </span>
                        )}
                      </div>

                      {pianta.nome_comune && (
                        <p className="text-xs text-stone-500 truncate">
                          {pianta.nome_comune}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-stone-600 mt-1">
                        {pianta.vaso_cm && <span>Ø {pianta.vaso_cm} cm</span>}
                        {pianta.disponibilita_carrelli && (
                          <span className="text-emerald-800 font-semibold">
                            Disp: {pianta.disponibilita_carrelli}
                          </span>
                        )}
                        <span className="font-bold text-stone-900">
                          {pianta.prezzo ? `€ ${Number(pianta.prezzo).toFixed(2)}` : '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Pulsanti Azione (Occhio, Matita, Cestino) */}
                  <div className="flex items-center gap-0.5 flex-shrink-0">
                    <button
                      onClick={() => handleToggleVisibilita(pianta)}
                      className={`touch-target p-2 rounded-lg transition-colors ${
                        isVisibile
                          ? 'text-emerald-800 hover:bg-emerald-50'
                          : 'text-stone-400 hover:bg-stone-100'
                      }`}
                      title={isVisibile ? 'Nascondi dal catalogo' : 'Rendi visibile'}
                      aria-label={`Toggle visibilità ${pianta.nome}`}
                    >
                      {isVisibile ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </button>

                    <Link
                      to={`/admin/${pianta.id}`}
                      className="touch-target p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      title="Modifica"
                      aria-label={`Modifica ${pianta.nome}`}
                    >
                      <Pencil className="w-5 h-5" />
                    </Link>

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
      </div>

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
