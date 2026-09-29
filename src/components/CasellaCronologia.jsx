import React, { useEffect, useState, useMemo } from 'react';
import { 
  X, 
  History, 
  Warehouse, 
  Eye, 
  EyeOff, 
  PlusCircle, 
  Trash2, 
  RefreshCw, 
  Search, 
  Calendar, 
  Clock, 
  SlidersHorizontal,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Info
} from 'lucide-react';
import { caricaStorico, formattaDataOra } from '../lib/storico';

export default function CasellaCronologia({ isOpen, onClose }) {
  const [eventi, setEventi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('tutti');
  const [ricerca, setRicerca] = useState('');

  const fetchStorico = async () => {
    setLoading(true);
    try {
      const dati = await caricaStorico({ limit: 100, filtroTipo: 'tutti' });
      setEventi(dati);
    } catch (err) {
      console.error('Errore fetch storico:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStorico();
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  // Conteggi per i badge
  const conteggi = useMemo(() => {
    const res = { tutti: eventi.length, giacenza: 0, visibilita: 0, inserimento: 0, eliminazione: 0 };
    eventi.forEach(ev => {
      if (res[ev.tipo] !== undefined) res[ev.tipo]++;
    });
    return res;
  }, [eventi]);

  // Filtraggio eventi
  const eventiFiltrati = useMemo(() => {
    return eventi.filter(ev => {
      const matchTipo = filtroTipo === 'tutti' || ev.tipo === filtroTipo;
      const q = ricerca.trim().toLowerCase();
      const matchTesto = q === '' || 
        ev.pianta_nome.toLowerCase().includes(q) || 
        ev.descrizione.toLowerCase().includes(q);
      return matchTipo && matchTesto;
    });
  }, [eventi, filtroTipo, ricerca]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#122A04]/75 backdrop-blur-sm flex justify-end transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-[#1C201C]/15 animate-in slide-in-from-right duration-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER CASELLA CRONOLOGIA */}
        <div className="bg-[#1C201C] text-white p-4 sm:p-6 flex-shrink-0 flex items-start justify-between gap-4 border-b border-white/10">
          <div className="flex items-start gap-3.5 min-w-0">
            <div className="w-11 h-11 rounded-2xl bg-[#25570A] text-[#6BB221] flex items-center justify-center flex-shrink-0 shadow-xs border border-[#6BB221]/30">
              <History className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-display font-bold text-lg sm:text-xl text-white tracking-tight">
                  Cronologia & Storico Modifiche
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#6BB221]/20 text-[#6BB221] border border-[#6BB221]/30">
                  {eventi.length} registrazioni
                </span>
              </div>
              <p className="text-xs text-white/70 mt-0.5 leading-relaxed">
                Tracciamento automatico di variazioni giacenze, visibilità (occhio), inserimenti ed eliminazioni.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={fetchStorico}
              disabled={loading}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors touch-target"
              title="Aggiorna cronologia"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#6BB221]' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors touch-target"
              title="Chiudi cronologia"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* FILTRI RAPIDI & RICERCA */}
        <div className="p-4 sm:px-6 bg-[#FAF9F6] border-b border-[#1C201C]/10 flex-shrink-0 space-y-3">
          {/* Barra di Ricerca */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={ricerca}
              onChange={(e) => setRicerca(e.target.value)}
              placeholder="Cerca pianta o dettaglio modifica..."
              className="w-full pl-9 pr-8 py-2.5 bg-white border border-[#1C201C]/15 rounded-xl text-xs sm:text-sm text-[#1C201C] placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#25570A] shadow-2xs"
            />
            {ricerca && (
              <button
                type="button"
                onClick={() => setRicerca('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-1 text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Pillole Filtro per Tipo */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
            <button
              type="button"
              onClick={() => setFiltroTipo('tutti')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 touch-target ${
                filtroTipo === 'tutti'
                  ? 'bg-[#1C201C] text-white shadow-xs'
                  : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200'
              }`}
            >
              <span>Tutti</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filtroTipo === 'tutti' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                {conteggi.tutti}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroTipo('giacenza')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 touch-target ${
                filtroTipo === 'giacenza'
                  ? 'bg-amber-800 text-white shadow-xs'
                  : 'bg-white hover:bg-amber-50 text-amber-900 border border-amber-200'
              }`}
            >
              <Warehouse className="w-3.5 h-3.5" />
              <span>Giacenze</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filtroTipo === 'giacenza' ? 'bg-white/20 text-white' : 'bg-amber-100 text-amber-900'}`}>
                {conteggi.giacenza}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroTipo('visibilita')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 touch-target ${
                filtroTipo === 'visibilita'
                  ? 'bg-blue-800 text-white shadow-xs'
                  : 'bg-white hover:bg-blue-50 text-blue-900 border border-blue-200'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Visibilità (Occhio)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filtroTipo === 'visibilita' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-900'}`}>
                {conteggi.visibilita}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroTipo('inserimento')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 touch-target ${
                filtroTipo === 'inserimento'
                  ? 'bg-[#25570A] text-white shadow-xs'
                  : 'bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Inserimenti</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filtroTipo === 'inserimento' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-900'}`}>
                {conteggi.inserimento}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setFiltroTipo('eliminazione')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 touch-target ${
                filtroTipo === 'eliminazione'
                  ? 'bg-red-800 text-white shadow-xs'
                  : 'bg-white hover:bg-red-50 text-red-900 border border-red-200'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Eliminazioni</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${filtroTipo === 'eliminazione' ? 'bg-white/20 text-white' : 'bg-red-100 text-red-900'}`}>
                {conteggi.eliminazione}
              </span>
            </button>
          </div>
        </div>

        {/* LISTA EVENTI SCROLLABILE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {loading && eventi.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[#25570A] mb-3" />
              <p className="text-sm font-semibold">Caricamento storico attività in corso...</p>
            </div>
          ) : eventiFiltrati.length === 0 ? (
            <div className="py-16 text-center text-stone-400 bg-[#FAF9F6] rounded-2xl border border-dashed border-stone-300 p-8">
              <History className="w-10 h-10 mx-auto text-stone-300 mb-2" />
              <h4 className="font-bold text-sm text-[#1C201C]">Nessuna attività trovata</h4>
              <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1">
                {ricerca || filtroTipo !== 'tutti' 
                  ? 'Nessuna registrazione corrisponde ai criteri o alla ricerca selezionata.' 
                  : 'Non ci sono ancora modifiche registrate. Le azioni sulle piante compariranno qui automaticamente.'}
              </p>
              {(ricerca || filtroTipo !== 'tutti') && (
                <button
                  type="button"
                  onClick={() => { setFiltroTipo('tutti'); setRicerca(''); }}
                  className="mt-3 px-3 py-1.5 bg-[#25570A] text-white rounded-xl text-xs font-bold"
                >
                  Mostra tutti gli eventi
                </button>
              )}
            </div>
          ) : (
            eventiFiltrati.map((ev) => {
              const tempo = formattaDataOra(ev.created_at);
              const { tipo, dettagli = {} } = ev;

              return (
                <article
                  key={ev.id}
                  className="bg-white rounded-2xl border border-[#1C201C]/10 p-4 sm:p-4.5 shadow-2xs hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Icona Tipo Evento */}
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                        tipo === 'giacenza'
                          ? 'bg-amber-100 text-amber-800'
                          : tipo === 'visibilita'
                          ? (dettagli.visibile ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-600')
                          : tipo === 'inserimento'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tipo === 'giacenza' && <Warehouse className="w-4 h-4" />}
                        {tipo === 'visibilita' && (dettagli.visibile ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />)}
                        {tipo === 'inserimento' && <PlusCircle className="w-4 h-4" />}
                        {tipo === 'eliminazione' && <Trash2 className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        {/* Nome Pianta & Badge Azione */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-[#1C201C] leading-snug">
                            {ev.pianta_nome}
                          </h4>

                          <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            tipo === 'giacenza'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : tipo === 'visibilita'
                              ? (dettagli.visibile ? 'bg-blue-100 text-blue-900 border border-blue-200' : 'bg-stone-100 text-stone-700 border border-stone-200')
                              : tipo === 'inserimento'
                              ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                              : 'bg-red-100 text-red-900 border border-red-200'
                          }`}>
                            {tipo === 'giacenza' && 'Giacenza'}
                            {tipo === 'visibilita' && (dettagli.visibile ? 'Visibile' : 'Nascosta')}
                            {tipo === 'inserimento' && 'Nuova Pianta'}
                            {tipo === 'eliminazione' && 'Eliminata'}
                          </span>
                        </div>

                        {/* Descrizione Sintetica */}
                        <p className="text-xs sm:text-sm text-stone-700 mt-1 font-medium leading-relaxed">
                          {ev.descrizione}
                        </p>

                        {/* Box Dettagli Giacenza (Delta esplicito e variazione numerica) */}
                        {tipo === 'giacenza' && (dettagli.vecchia_giacenza !== undefined || dettagli.nuova_giacenza !== undefined) && (
                          <div className="mt-2.5 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between gap-3 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-stone-500 font-semibold">Precedente:</span>
                              <strong className="text-stone-700">{dettagli.vecchia_giacenza ?? 0} pz</strong>
                              <span className="text-stone-400">&rarr;</span>
                              <span className="text-stone-500 font-semibold">Nuova:</span>
                              <strong className="text-amber-950 font-bold">{dettagli.nuova_giacenza ?? 0} pz</strong>
                            </div>

                            {dettagli.delta !== undefined && (
                              <span className={`inline-flex items-center gap-1 font-black text-xs px-2 py-0.5 rounded-md ${
                                Number(dettagli.delta) > 0 
                                  ? 'bg-emerald-100 text-emerald-800' 
                                  : Number(dettagli.delta) < 0 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-stone-100 text-stone-700'
                              }`}>
                                {Number(dettagli.delta) > 0 ? (
                                  <>
                                    <TrendingUp className="w-3 h-3" />
                                    <span>+{dettagli.delta} pz</span>
                                  </>
                                ) : Number(dettagli.delta) < 0 ? (
                                  <>
                                    <TrendingDown className="w-3 h-3" />
                                    <span>{dettagli.delta} pz</span>
                                  </>
                                ) : (
                                  <span>Invariata</span>
                                )}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Data & Ora */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-[11px] font-bold text-[#25570A] block">
                        {tempo.relativo}
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {tempo.data} &bull; {tempo.ora}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {/* FOOTER CASELLA CRONOLOGIA */}
        <div className="p-4 bg-[#FAF9F6] border-t border-[#1C201C]/10 flex-shrink-0 flex items-center justify-between text-xs text-stone-500">
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-[#25570A]" />
            <span>Fuso orario: Europa/Roma (UTC+2)</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#1C201C] hover:bg-[#25570A] text-white font-bold rounded-xl text-xs transition-colors"
          >
            Chiudi
          </button>
        </div>
      </div>
    </div>
  );
}
