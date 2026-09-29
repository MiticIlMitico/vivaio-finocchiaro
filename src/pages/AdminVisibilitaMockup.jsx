import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { 
  DEFAULT_CAMPI_VISIBILI, 
  normalizzaCampiVisibili 
} from '../lib/campiConfig';
import Toast from '../components/Toast';
import CardPianta from '../components/CardPianta';
import { 
  ArrowLeft, 
  Eye, 
  EyeOff, 
  Check, 
  SlidersHorizontal, 
  Layers, 
  Package, 
  Ruler, 
  Warehouse, 
  Info, 
  Camera, 
  Plus, 
  FileText,
  RotateCcw,
  CheckCircle2,
  Store
} from 'lucide-react';

export default function AdminVisibilitaMockup() {
  const navigate = useNavigate();
  const [campiVisibili, setCampiVisibili] = useState(DEFAULT_CAMPI_VISIBILI);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [salvatoRecentemente, setSalvatoRecentemente] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [vistaAttiva, setVistaAttiva] = useState('editor'); // 'editor' | 'anteprima_card'

  // Carica impostazioni salvate su Supabase
  useEffect(() => {
    const caricaImpostazioni = async () => {
      try {
        const { data, error } = await supabase
          .from('impostazioni')
          .select('chiave, valore');

        if (error) throw error;

        if (data && Array.isArray(data)) {
          const cp = data.find(i => i.chiave === 'campi_visibili');
          if (cp?.valore) {
            try {
              setCampiVisibili(normalizzaCampiVisibili(JSON.parse(cp.valore)));
            } catch (e) {
              console.error('Errore parsing campi_visibili:', e);
            }
          } else {
            const mg = data.find(i => i.chiave === 'mostra_giacenze');
            if (mg?.valore !== undefined) {
              const isGiac = mg.valore === 'true';
              setCampiVisibili(prev => ({ ...prev, giacenza: isGiac }));
            }
          }
        }
      } catch (err) {
        console.error('Errore caricamento impostazioni:', err);
      } finally {
        setLoading(false);
      }
    };

    caricaImpostazioni();
  }, []);

  // Salva configurazione su Supabase
  const salvaSuDb = async (nuovaConfig) => {
    setSalvando(true);
    setSalvatoRecentemente(false);
    try {
      const payloadJson = JSON.stringify(nuovaConfig);
      await supabase
        .from('impostazioni')
        .upsert(
          {
            chiave: 'campi_visibili',
            valore: payloadJson,
            updated_at: new Date().toISOString()
          },
          { onConflict: 'chiave' }
        );

      // Compatibilità retroattiva per mostra_giacenze
      await supabase
        .from('impostazioni')
        .upsert(
          {
            chiave: 'mostra_giacenze',
            valore: String(Boolean(nuovaConfig.disponibile || nuovaConfig.giacenza)),
            updated_at: new Date().toISOString()
          },
          { onConflict: 'chiave' }
        );

      setSalvatoRecentemente(true);
      setTimeout(() => setSalvatoRecentemente(false), 2500);
    } catch (err) {
      console.error('Errore salvataggio:', err);
      setToast({
        message: 'Errore nel salvataggio della configurazione.',
        type: 'error'
      });
    } finally {
      setSalvando(false);
    }
  };

  // Toggle singolo campo
  const handleToggleCampo = (chiave) => {
    const nuovaConfig = {
      ...campiVisibili,
      [chiave]: !campiVisibili[chiave]
    };
    setCampiVisibili(nuovaConfig);
    salvaSuDb(nuovaConfig);
  };

  // Dati pianta dimostrativa neutra per l'anteprima card
  const piantaMockup = {
    id: 'mockup-preview',
    nome: 'Nome Pianta (Esempio)',
    nome_comune: 'Nome comune di prova',
    categoria: 'Categoria Catalogo',
    tipologia: 'Tipologia dimostrativa',
    vaso_cm: '14',
    altezza_cm: '25-30',
    peso_kg: '1.2',
    pz_pianale: '14',
    pz_carrello: '70',
    disponibilita_carrelli: '6 CC',
    disponibile: '4000',
    giacenza: '4000',
    prezzo: '€ 4,50',
    note: 'Note di fornitura e coltivazione dimostrative per verificare la grafica.',
    visibile: true,
    foto_url: '/brand/paesaggio-1.jpg'
  };

  // Componente Switch Flag a destra
  const FlagSwitch = ({ campo, label, obbligatorio = false }) => {
    const attivo = Boolean(campiVisibili[campo]);

    return (
      <div 
        onClick={() => !obbligatorio && handleToggleCampo(campo)}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all cursor-pointer select-none touch-target ${
          obbligatorio
            ? 'bg-stone-100 border-stone-200 text-stone-500 cursor-not-allowed opacity-80'
            : attivo
            ? 'bg-[#25570A]/10 border-[#25570A]/30 text-[#25570A] hover:bg-[#25570A]/15 shadow-xs'
            : 'bg-stone-100 border-stone-300 text-stone-500 hover:bg-stone-200'
        }`}
        title={obbligatorio ? 'Campo sempre visibile' : attivo ? 'Clicca per nascondere ai clienti' : 'Clicca per mostrare ai clienti'}
      >
        <div className="flex items-center gap-1.5 text-xs font-bold">
          {attivo ? (
            <Eye className="w-3.5 h-3.5 text-[#25570A]" />
          ) : (
            <EyeOff className="w-3.5 h-3.5 text-stone-400" />
          )}
          <span className="hidden xs:inline">
            {attivo ? 'Visibile ai clienti' : 'Nascosto ai clienti'}
          </span>
          <span className="xs:hidden">
            {attivo ? 'Visibile' : 'Nascosto'}
          </span>
        </div>

        {/* Mini Pill Switch */}
        <div 
          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
            attivo ? 'bg-[#25570A]' : 'bg-stone-300'
          }`}
        >
          <span
            className={`pointer-events-none inline-flex h-4 w-4 transform items-center justify-center rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
              attivo ? 'translate-x-4' : 'translate-x-0'
            }`}
          >
            {attivo ? (
              <Check className="w-2.5 h-2.5 text-[#25570A] stroke-[3]" />
            ) : null}
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 text-[#1C201C] font-sans antialiased">
      {/* Toast di notifica */}
      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: '', type: 'success' })}
        />
      )}

      {/* Header Sticky per la gestione dei campi */}
      <header className="sticky top-0 z-30 bg-[#1C201C] text-white shadow-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between gap-2">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 text-xs font-bold touch-target transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#6BB221]" />
            <span>Lista Piante</span>
          </Link>

          <div className="text-center min-w-0">
            <h1 className="font-serif font-bold text-sm sm:text-base text-white truncate">
              Editor Prova: Visibilità Campi
            </h1>
            <span className="text-[10px] text-[#6BB221] font-semibold block leading-none mt-0.5">
              Tocca i flag a destra per mostrare o nascondere
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Badge stato salvataggio */}
            <div className="flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-xl bg-white/10 border border-white/15 text-white/90">
              {salvando ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                  <span className="hidden sm:inline">Salvataggio...</span>
                </>
              ) : salvatoRecentemente ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#6BB221]" />
                  <span className="text-[#6BB221] hidden sm:inline">Salvato!</span>
                </>
              ) : (
                <>
                  <span className="w-2 h-2 rounded-full bg-[#6BB221]"></span>
                  <span className="hidden sm:inline">Auto-salvataggio</span>
                </>
              )}
            </div>

            <Link
              to="/"
              className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              title="Vedi Catalogo Clienti"
            >
              <Store className="w-4 h-4 text-[#6BB221]" />
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-4 sm:pt-6 space-y-4">
        {/* Banner esplicativo */}
        <div className="bg-[#25570A] text-white p-4 sm:p-5 rounded-3xl shadow-sm border border-[#357C0E]/50">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
              <SlidersHorizontal className="w-5 h-5 text-[#6BB221]" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-sm sm:text-base leading-snug">
                Configura i campi visibili ai clienti sul mockup della pianta
              </h2>
              <p className="text-xs text-white/80 mt-1 leading-relaxed">
                Questa scheda è un <strong>mockup dimostrativo</strong>: usa il <strong className="text-[#6BB221]">flag a destra di ogni campo</strong> per decidere cosa mostrare o nascondere ai clienti nel catalogo pubblico.
              </p>
            </div>
          </div>
        </div>

        {/* Tab di navigazione tra Mockup Editor e Anteprima Card Cliente */}
        <div className="flex items-center justify-between gap-2 bg-white p-1.5 rounded-2xl border border-[#1C201C]/10 shadow-xs">
          <button
            type="button"
            onClick={() => setVistaAttiva('editor')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              vistaAttiva === 'editor'
                ? 'bg-[#25570A] text-white shadow-xs'
                : 'text-[#1C201C]/70 hover:bg-stone-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Mockup Scheda Editor (con Flag)</span>
          </button>

          <button
            type="button"
            onClick={() => setVistaAttiva('anteprima_card')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              vistaAttiva === 'anteprima_card'
                ? 'bg-[#25570A] text-white shadow-xs'
                : 'text-[#1C201C]/70 hover:bg-stone-100'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Anteprima Card Cliente Live</span>
          </button>
        </div>

        {/* VISTA 1: MOCKUP EDITOR DI PROVA (Esattamente identico a AdminForm.jsx) */}
        {vistaAttiva === 'editor' && (
          <div className="bg-white p-5 sm:p-8 rounded-3xl border border-[#1C201C]/10 shadow-xs space-y-7 animate-in fade-in duration-200">
            
            {/* Banner di avviso: Scheda dimostrativa vuota */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950">
              <Info className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="block text-amber-900 font-bold mb-0.5">Scheda dimostrativa priva di dati reali</strong>
                Questa è una simulazione neutra della scheda: i campi non contengono dati reali di piante per evitare confusione. I <strong>flag a destra</strong> determinano quali sezioni compariranno o saranno nascoste nel catalogo per <em>tutte</em> le piante.
              </div>
            </div>

            {/* SEZIONE FOTO DELLA PIANTA */}
            <div className={`transition-opacity duration-300 ${!campiVisibili.foto ? 'opacity-60' : 'opacity-100'}`}>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                  FOTO DELLA PIANTA
                </span>
                <FlagSwitch campo="foto" label="Foto Pianta" />
              </div>

              <div className={`p-6 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center text-center transition-all ${
                campiVisibili.foto 
                  ? 'border-[#25570A]/30 bg-[#25570A]/5' 
                  : 'border-stone-300 bg-stone-50'
              }`}>
                <div className="w-14 h-14 rounded-2xl bg-white shadow-xs border border-stone-200 flex items-center justify-center text-[#25570A] mb-3">
                  <Camera className="w-7 h-7" />
                </div>
                <h4 className="font-bold text-sm text-[#1C201C]">
                  {campiVisibili.foto ? 'Foto Visibile ai Clienti' : 'Foto Nascosta ai Clienti'}
                </h4>
                <p className="text-xs text-[#1C201C]/60 max-w-sm mt-1">
                  {campiVisibili.foto 
                    ? 'I clienti vedranno la fotografia ad alta risoluzione della pianta nel catalogo e nel popup.'
                    : 'Ai clienti verrà mostrata una grafica minimalista botanica senza la fotografia reale.'}
                </p>
              </div>
            </div>

            <hr className="border-[#1C201C]/10" />

            {/* SEZIONE INFORMAZIONI BOTANICHE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-serif font-bold text-base sm:text-lg text-[#1C201C]">
                  Informazioni Botaniche
                </h2>
                <span className="text-[11px] text-stone-500 font-medium">Tocca il flag a destra per nascondere/mostrare</span>
              </div>

              {/* Nome Botanico (Sempre visibile per identificare la pianta) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                    Nome della pianta (botanico) *
                  </label>
                  <span className="text-[11px] font-bold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-md">
                    Sempre visibile
                  </span>
                </div>
                <input
                  type="text"
                  readOnly
                  placeholder="Nome botanico (es. Crassula ovata, Euphorbia...)"
                  className="w-full px-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm italic text-stone-500 cursor-not-allowed select-none placeholder:text-stone-400 placeholder:italic"
                />
              </div>

              {/* Nome Comune / Volgare */}
              <div className={`transition-opacity duration-200 ${!campiVisibili.nome_comune ? 'opacity-60' : 'opacity-100'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                    Nome comune / volgare
                  </label>
                  <FlagSwitch campo="nome_comune" label="Nome Comune" />
                </div>
                <input
                  type="text"
                  readOnly
                  placeholder="Nome volgare (es. Albero di giada, Fico d'India...)"
                  className={`w-full px-3.5 py-3 border rounded-xl text-sm transition-all cursor-not-allowed select-none placeholder:italic ${
                    campiVisibili.nome_comune 
                      ? 'bg-[#FAF9F6] border-[#1C201C]/15 placeholder:text-stone-400' 
                      : 'bg-stone-100 border-dashed border-stone-300 placeholder:text-stone-300'
                  }`}
                />
              </div>

              {/* Categoria nel catalogo */}
              <div className={`transition-opacity duration-200 ${!campiVisibili.categoria ? 'opacity-60' : 'opacity-100'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                    Categoria nel catalogo
                  </label>
                  <FlagSwitch campo="categoria" label="Categoria" />
                </div>
                <input
                  type="text"
                  readOnly
                  placeholder="Categoria (es. Cactacee & Opuntia, Piante Mediterranee...)"
                  className={`w-full px-3.5 py-3 border rounded-xl text-sm transition-all cursor-not-allowed select-none placeholder:italic ${
                    campiVisibili.categoria 
                      ? 'bg-[#FAF9F6] border-[#1C201C]/15 placeholder:text-stone-400' 
                      : 'bg-stone-100 border-dashed border-stone-300 placeholder:text-stone-300'
                  }`}
                />
              </div>

              {/* Tipologia Pianta */}
              <div className={`transition-opacity duration-200 ${!campiVisibili.tipologia ? 'opacity-60' : 'opacity-100'}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                    Tipologia pianta
                  </label>
                  <FlagSwitch campo="tipologia" label="Tipologia" />
                </div>
                <input
                  type="text"
                  readOnly
                  placeholder="Tipologia (es. Succulenta da esterno, Alberello da vaso...)"
                  className={`w-full px-3.5 py-3 border rounded-xl text-sm transition-all cursor-not-allowed select-none placeholder:italic ${
                    campiVisibili.tipologia 
                      ? 'bg-[#FAF9F6] border-[#1C201C]/15 placeholder:text-stone-400' 
                      : 'bg-stone-100 border-dashed border-stone-300 placeholder:text-stone-300'
                  }`}
                />
              </div>
            </div>

            <hr className="border-[#1C201C]/10" />

            {/* SEZIONE FORMATI VASO & DISPONIBILITÀ */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-base sm:text-lg text-[#1C201C] flex items-center gap-2">
                    <Layers className="w-5 h-5 text-[#25570A]" />
                    <span>Formati Vaso & Quantità Disponibili</span>
                  </h2>
                  <p className="text-xs text-[#1C201C]/60 mt-0.5">
                    Decidi se mostrare ai clienti solo la disponibilità vendita, solo le giacenze magazzino, entrambe o nessuna.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Diametro Vaso */}
                <div className={`p-4 rounded-2xl border transition-all ${
                  campiVisibili.vaso_cm 
                    ? 'bg-white border-[#1C201C]/15 shadow-xs' 
                    : 'bg-stone-50 border-dashed border-stone-300 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                      Diametro vaso
                    </label>
                    <FlagSwitch campo="vaso_cm" label="Vaso" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    placeholder="Calibro (es. Ø 14 cm, Ø 16 cm...)"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm font-semibold text-stone-500 placeholder:text-stone-400 placeholder:italic cursor-not-allowed"
                  />
                  <span className="text-[10px] text-stone-500 block mt-1.5">
                    Mostra il calibro vaso nella scheda
                  </span>
                </div>

                {/* 2. DISPONIBILITÀ VENDITA (PZ) */}
                <div className={`p-4 rounded-2xl border-2 transition-all ${
                  campiVisibili.disponibile 
                    ? 'bg-[#25570A]/5 border-[#25570A]/40 shadow-xs' 
                    : 'bg-stone-50 border-dashed border-stone-300 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-[#25570A] flex items-center gap-1">
                      <span>Disp. Vendita (pz)</span>
                    </label>
                    <FlagSwitch campo="disponibile" label="Disponibilità Vendita" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    placeholder="Conteggio vendita (es. 4.000 pz)"
                    className={`w-full px-3 py-2 rounded-xl text-sm font-semibold placeholder:italic cursor-not-allowed ${
                      campiVisibili.disponibile 
                        ? 'bg-white border border-[#25570A]/40 placeholder:text-[#25570A]/60' 
                        : 'bg-stone-100 border border-stone-300 placeholder:text-stone-300'
                    }`}
                  />
                  <div className="mt-2 pt-1.5 border-t border-[#25570A]/10 text-[10px] font-semibold flex items-center justify-between">
                    <span className="text-[#25570A]">Quantità per vendita</span>
                    {campiVisibili.disponibile ? (
                      <span className="text-[#25570A] font-bold">✓ Visibile ai clienti</span>
                    ) : (
                      <span className="text-stone-400">Nascosto</span>
                    )}
                  </div>
                </div>

                {/* 3. GIACENZA MAGAZZINO (PZ) */}
                <div className={`p-4 rounded-2xl border-2 transition-all ${
                  campiVisibili.giacenza 
                    ? 'bg-amber-50/70 border-amber-400 shadow-xs' 
                    : 'bg-stone-50 border-dashed border-stone-300 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-extrabold uppercase tracking-wider text-amber-900 flex items-center gap-1">
                      <Warehouse className="w-3.5 h-3.5 text-amber-700" />
                      <span>Giacenza Magazzino</span>
                    </label>
                    <FlagSwitch campo="giacenza" label="Giacenza Magazzino" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    placeholder="Scorte magazzino (es. 4.000 pz)"
                    className={`w-full px-3 py-2 rounded-xl text-sm font-semibold placeholder:italic cursor-not-allowed ${
                      campiVisibili.giacenza 
                        ? 'bg-white border border-amber-300 placeholder:text-amber-800/60' 
                        : 'bg-stone-100 border border-stone-300 placeholder:text-stone-300'
                    }`}
                  />
                  <div className="mt-2 pt-1.5 border-t border-amber-200 text-[10px] font-semibold flex items-center justify-between">
                    <span className="text-amber-800">Scorte fisiche in serra</span>
                    {campiVisibili.giacenza ? (
                      <span className="text-amber-800 font-bold">✓ Visibile ai clienti</span>
                    ) : (
                      <span className="text-stone-400">Nascosto</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Box riassunto logica disponibilità per il titolare */}
              <div className="p-3.5 bg-stone-100 rounded-2xl border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-[#25570A] flex-shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Stato attuale visualizzazione scorte per i clienti: </strong>
                  {campiVisibili.disponibile && !campiVisibili.giacenza && (
                    <span className="text-[#25570A] font-bold">I clienti vedono SOLO la Disponibilità Vendita (consigliato per ingrosso).</span>
                  )}
                  {!campiVisibili.disponibile && campiVisibili.giacenza && (
                    <span className="text-amber-800 font-bold">I clienti vedono SOLO la Giacenza di Magazzino.</span>
                  )}
                  {campiVisibili.disponibile && campiVisibili.giacenza && (
                    <span className="text-blue-800 font-bold">I clienti vedono ENTRAMBE le quantità (disponibilità vendita e giacenza vivaio).</span>
                  )}
                  {!campiVisibili.disponibile && !campiVisibili.giacenza && (
                    <span className="text-stone-600 font-bold">Tutti i numeri sono nascosti: i clienti vedono solo lo stato "Pronto in serra" con pallino verde.</span>
                  )}
                </div>
              </div>
            </div>

            <hr className="border-[#1C201C]/10" />

            {/* SEZIONE LOGISTICA & IMBALLAGGI INGROSSO */}
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#1C201C]">
                Logistica & Imballaggi Ingrosso
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Carrelli Disponibili (Volume) */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  campiVisibili.disponibilita_carrelli 
                    ? 'bg-white border-[#1C201C]/15 shadow-xs' 
                    : 'bg-stone-50 border-dashed border-stone-300 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                      Carrelli disponibili (volume)
                    </label>
                    <FlagSwitch campo="disponibilita_carrelli" label="Carrelli Disp." />
                  </div>
                  <input
                    type="text"
                    readOnly
                    placeholder="Volume settimanale (es. 6 CC o 12 carrelli)"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm placeholder:text-stone-400 placeholder:italic cursor-not-allowed"
                  />
                </div>

                {/* Pezzi per Carrello CC */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  campiVisibili.pz_carrello 
                    ? 'bg-white border-[#1C201C]/15 shadow-xs' 
                    : 'bg-stone-50 border-dashed border-stone-300 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                      Pezzi per carrello CC
                    </label>
                    <FlagSwitch campo="pz_carrello" label="Pz Carrello" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    placeholder="Capienza per carrello Danese (es. 70 o 100)"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm placeholder:text-stone-400 placeholder:italic cursor-not-allowed"
                  />
                </div>

                {/* Pezzi per Pianale */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  campiVisibili.pz_pianale 
                    ? 'bg-white border-[#1C201C]/15 shadow-xs' 
                    : 'bg-stone-50 border-dashed border-stone-300 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                      Pezzi per pianale
                    </label>
                    <FlagSwitch campo="pz_pianale" label="Pz Pianale" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    placeholder="Capienza pianale (es. 14 o 21/33)"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm placeholder:text-stone-400 placeholder:italic cursor-not-allowed"
                  />
                </div>

                {/* Altezza Pianta */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  campiVisibili.altezza_cm 
                    ? 'bg-white border-[#1C201C]/15 shadow-xs' 
                    : 'bg-stone-50 border-dashed border-stone-300 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                      Altezza pianta
                    </label>
                    <FlagSwitch campo="altezza_cm" label="Altezza" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    placeholder="Altezza media in cm (es. 25-30)"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm placeholder:text-stone-400 placeholder:italic cursor-not-allowed"
                  />
                </div>

                {/* Peso Indicativo */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  campiVisibili.peso_kg 
                    ? 'bg-white border-[#1C201C]/15 shadow-xs' 
                    : 'bg-stone-50 border-dashed border-stone-300 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                      Peso indicativo (kg)
                    </label>
                    <FlagSwitch campo="peso_kg" label="Peso" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    placeholder="Peso stimato singola pianta (es. 1.2 kg)"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm placeholder:text-stone-400 placeholder:italic cursor-not-allowed"
                  />
                </div>

                {/* Prezzo Interno / Listino */}
                <div className={`p-3.5 rounded-2xl border transition-all ${
                  campiVisibili.prezzo 
                    ? 'bg-white border-[#1C201C]/15 shadow-xs' 
                    : 'bg-stone-50 border-dashed border-stone-300 opacity-60'
                }`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                      Prezzo unitario (€)
                    </label>
                    <FlagSwitch campo="prezzo" label="Prezzo" />
                  </div>
                  <input
                    type="text"
                    readOnly
                    placeholder="Prezzo interno o listino (es. € 4,50)"
                    className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm placeholder:text-stone-400 placeholder:italic cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <hr className="border-[#1C201C]/10" />

            {/* SEZIONE NOTE & DESCRIZIONE */}
            <div className="space-y-4">
              <h2 className="font-serif font-bold text-base sm:text-lg text-[#1C201C]">
                Note di Fornitura & Coltivazione
              </h2>

              <div className={`p-4 rounded-2xl border transition-all ${
                campiVisibili.note 
                  ? 'bg-white border-[#1C201C]/15 shadow-xs' 
                  : 'bg-stone-50 border-dashed border-stone-300 opacity-60'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
                    Note fornitura, fioritura ed esposizione
                  </label>
                  <FlagSwitch campo="note" label="Note" />
                </div>
                <textarea
                  readOnly
                  rows={2}
                  placeholder="Dettagli fornitura, uniformità lotto, fioritura ed esposizione..."
                  className="w-full px-3.5 py-2.5 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-xs sm:text-sm text-stone-500 placeholder:text-stone-400 placeholder:italic cursor-not-allowed resize-none"
                />
              </div>
            </div>

          </div>
        )}

        {/* VISTA 2: ANTEPRIMA CARD CLIENTE LIVE */}
        {vistaAttiva === 'anteprima_card' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            <div className="bg-white p-4 rounded-2xl border border-stone-200 text-xs text-stone-600 flex items-center justify-between">
              <span>Questa è l'anteprima esatta di come apparirà la pianta al cliente con le impostazioni correnti:</span>
              <button
                type="button"
                onClick={() => setVistaAttiva('editor')}
                className="px-3 py-1 bg-[#25570A] text-white font-bold rounded-lg text-xs"
              >
                Torna a Modificare i Flag
              </button>
            </div>

            <div className="max-w-sm mx-auto">
              <CardPianta
                pianta={piantaMockup}
                campiVisibili={campiVisibili}
                mostraGiacenze={Boolean(campiVisibili.disponibile || campiVisibili.giacenza)}
                onOpenDetail={() => {}}
                onOpenLightbox={() => {}}
              />
            </div>
          </div>
        )}

        {/* Tasto Flottante per tornare alla Lista Piante */}
        <div className="pt-6 pb-12 text-center">
          <Link
            to="/admin"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#1C201C] hover:bg-[#25570A] text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all touch-target active:scale-95"
          >
            <Check className="w-4 h-4 text-[#6BB221]" />
            <span>Fatto, torna alla lista piante</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
