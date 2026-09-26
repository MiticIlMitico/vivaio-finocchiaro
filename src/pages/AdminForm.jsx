import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CampoFoto from '../components/CampoFoto';
import Toast from '../components/Toast';
import { ArrowLeft, Save, Loader2, Plus, Sprout, AlertCircle, Layers, Trash2, CheckCircle2, Eye, EyeOff, Package, Ruler } from 'lucide-react';

export default function AdminForm() {
  const { id } = useParams();
  const isModifica = Boolean(id);
  const navigate = useNavigate();

  // Helper modifica rapida per pollici (+10, +50, +100, -10)
  const handleModificaRapida = (campo, delta) => {
    const attuale = parseInt(formData[campo], 10) || 0;
    const nuovo = Math.max(0, attuale + delta);
    handleChange(campo, String(nuovo));
  };

  // Stato form
  const [formData, setFormData] = useState({
    nome: '',
    nome_comune: '',
    categoria: 'Piante Mediterranee e Aromatiche',
    tipologia: '',
    vaso_cm: '',
    altezza_cm: '',
    peso_kg: '',
    pz_pianale: '',
    pz_carrello: '',
    disponibilita_carrelli: '',
    giacenza: '',
    disponibile: '',
    prezzo: '',
    descrizione: '',
    note: '',
    visibile: true,
    foto_url: '',
    foto_path: '',
    varianti: []
  });

  const [categorieEsistenti, setCategorieEsistenti] = useState([]);
  const [nuovaCategoriaInput, setNuovaCategoriaInput] = useState('');
  const [mostraNuovaCategoria, setMostraNuovaCategoria] = useState(false);

  const [loadingIniziale, setLoadingIniziale] = useState(isModifica);
  const [salvataggioInCorso, setSalvataggioInCorso] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [errore, setErrore] = useState(null);

  // Carica categorie esistenti e, se in modifica, i dati della pianta
  useEffect(() => {
    const caricaDati = async () => {
      try {
        // 1. Carica categorie uniche dal database
        const { data: catData, error: catError } = await supabase
          .from('piante')
          .select('categoria');

        if (!catError && catData) {
          const catSet = new Set(catData.map(c => c.categoria).filter(Boolean));
          catSet.add('Cactacee & Opuntia');
          catSet.add('Euphorbia');
          catSet.add('Crassula & Succulente');
          catSet.add('Ficus & Foglia Ornamentale');
          catSet.add('Palme & Mediterranee');
          catSet.add('Piante da Vivaio');
          setCategorieEsistenti(Array.from(catSet));
        }

        // 2. Se in modifica, carica la pianta
        if (isModifica) {
          const { data: pianta, error: piantaError } = await supabase
            .from('piante')
            .select('*')
            .eq('id', id)
            .single();

          if (piantaError) throw piantaError;

          if (pianta) {
            let variantiList = [];
            if (Array.isArray(pianta.varianti) && pianta.varianti.length > 0) {
              variantiList = pianta.varianti.map(v => ({
                vaso_cm: String(v.vaso_cm ?? ''),
                disponibile: String(v.disponibile ?? '0'),
                giacenza: String(v.giacenza ?? '0')
              }));
            } else if (pianta.vaso_cm) {
              variantiList = [{
                vaso_cm: String(pianta.vaso_cm),
                disponibile: String(pianta.disponibile ?? '0'),
                giacenza: String(pianta.giacenza ?? '0')
              }];
            }

            setFormData({
              nome: pianta.nome || '',
              nome_comune: pianta.nome_comune || '',
              categoria: pianta.categoria || 'Piante da Vivaio',
              tipologia: pianta.tipologia || '',
              vaso_cm: pianta.vaso_cm !== null && pianta.vaso_cm !== undefined ? String(pianta.vaso_cm) : '',
              altezza_cm: pianta.altezza_cm || '',
              peso_kg: pianta.peso_kg !== null && pianta.peso_kg !== undefined ? String(pianta.peso_kg) : '',
              pz_pianale: pianta.pz_pianale || '',
              pz_carrello: pianta.pz_carrello || '',
              disponibilita_carrelli: pianta.disponibilita_carrelli || '',
              giacenza: pianta.giacenza !== null && pianta.giacenza !== undefined ? String(pianta.giacenza) : '',
              disponibile: pianta.disponibile !== null && pianta.disponibile !== undefined ? String(pianta.disponibile) : '',
              prezzo: pianta.prezzo !== null && pianta.prezzo !== undefined ? String(pianta.prezzo) : '',
              descrizione: pianta.descrizione || '',
              note: pianta.note || '',
              visibile: pianta.visibile ?? true,
              foto_url: pianta.foto_url || '',
              foto_path: pianta.foto_path || '',
              varianti: variantiList
            });
          }
        }
      } catch (err) {
        console.error('Errore caricamento scheda pianta:', err);
        setErrore('Impossibile caricare i dati della pianta. Torna all\'elenco.');
      } finally {
        setLoadingIniziale(false);
      }
    };

    caricaDati();
  }, [id, isModifica]);

  const handleChange = (campo, valore) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valore
    }));
  };

  // Gestione formati vaso
  const handleAggiungiVariante = () => {
    setFormData(prev => ({
      ...prev,
      varianti: [...prev.varianti, { vaso_cm: '', disponibile: '0', giacenza: '0' }]
    }));
  };

  const handleRimuoviVariante = (idx) => {
    setFormData(prev => ({
      ...prev,
      varianti: prev.varianti.filter((_, i) => i !== idx)
    }));
  };

  const handleVarianteChange = (idx, field, val) => {
    setFormData(prev => {
      const copy = [...prev.varianti];
      copy[idx] = { ...copy[idx], [field]: val };
      return { ...prev, varianti: copy };
    });
  };

  const handleAggiungiNuovaCategoria = () => {
    const pulita = nuovaCategoriaInput.trim();
    if (!pulita) return;
    if (!categorieEsistenti.includes(pulita)) {
      setCategorieEsistenti(prev => [...prev, pulita]);
    }
    handleChange('categoria', pulita);
    setNuovaCategoriaInput('');
    setMostraNuovaCategoria(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrore(null);

    // Validazione del solo nome botanico obbligatorio
    if (!formData.nome.trim()) {
      setErrore('Il nome botanico della pianta è obbligatorio.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSalvataggioInCorso(true);

    try {
      // Normalizzazione varianti vasi
      const variantiPulite = (formData.varianti || [])
        .map(v => ({
          vaso_cm: Number(v.vaso_cm) || 0,
          disponibile: Math.max(0, parseInt(v.disponibile, 10) || 0),
          giacenza: Math.max(0, parseInt(v.giacenza, 10) || 0)
        }))
        .filter(v => v.vaso_cm > 0);

      variantiPulite.sort((a, b) => a.vaso_cm - b.vaso_cm);

      const prezzoNumerico = formData.prezzo && !isNaN(Number(formData.prezzo.replace(',', '.'))) 
        ? Number(formData.prezzo.replace(',', '.')) 
        : null;
      let vasoNumerico = formData.vaso_cm ? Number(formData.vaso_cm.replace(',', '.')) : null;
      const pesoNumerico = formData.peso_kg ? Number(formData.peso_kg.replace(',', '.')) : null;
      let giacenzaNumerica = formData.giacenza ? parseInt(formData.giacenza, 10) : 0;
      let disponibileNumerico = formData.disponibile ? parseInt(formData.disponibile, 10) : 0;

      // Se ci sono varianti multi-vaso, allineiamo vaso primario e somme
      if (variantiPulite.length > 0) {
        vasoNumerico = variantiPulite[0].vaso_cm;
        disponibileNumerico = variantiPulite.reduce((s, v) => s + v.disponibile, 0);
        giacenzaNumerica = variantiPulite.reduce((s, v) => s + v.giacenza, 0);
      }

      const payload = {
        nome: formData.nome.trim(),
        nome_comune: formData.nome_comune.trim() || null,
        categoria: formData.categoria || 'Piante da Vivaio',
        tipologia: formData.tipologia.trim() || null,
        vaso_cm: isNaN(vasoNumerico) ? null : vasoNumerico,
        altezza_cm: formData.altezza_cm.trim() || null,
        peso_kg: isNaN(pesoNumerico) ? null : pesoNumerico,
        pz_pianale: formData.pz_pianale.trim() || null,
        pz_carrello: formData.pz_carrello.trim() || null,
        disponibilita_carrelli: formData.disponibilita_carrelli.trim() || null,
        giacenza: isNaN(giacenzaNumerica) ? 0 : giacenzaNumerica,
        disponibile: isNaN(disponibileNumerico) ? 0 : disponibileNumerico,
        prezzo: prezzoNumerico,
        descrizione: formData.descrizione.trim() || null,
        note: formData.note.trim() || null,
        visibile: formData.visibile,
        foto_url: formData.foto_url || null,
        foto_path: formData.foto_path || null,
        varianti: variantiPulite
      };

      if (isModifica) {
        const { error: updateError } = await supabase
          .from('piante')
          .update(payload)
          .eq('id', id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('piante')
          .insert([payload]);

        if (insertError) throw insertError;
      }

      // Feedback e redirect
      navigate('/admin', {
        state: {
          toastMessage: `"${formData.nome}" salvata con successo.`
        }
      });
    } catch (err) {
      console.error('Errore durante il salvataggio:', err);
      setErrore('Impossibile salvare la pianta. Controlla i dati inseriti e riprova.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSalvataggioInCorso(false);
    }
  };

  if (loadingIniziale) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#25570A] mb-2" />
        <p className="text-sm font-medium text-[#1C201C]/70">Caricamento scheda pianta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-24 sm:pb-16 text-[#1C201C] font-sans antialiased">
      {/* Header Form */}
      <header className="sticky top-0 z-30 bg-[#1C201C] text-white shadow-md border-b border-white/10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-2">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white/90 border border-white/15 text-xs font-bold touch-target transition-all active:scale-95"
          >
            <ArrowLeft className="w-4 h-4 text-[#6BB221]" />
            <span>Lista Piante</span>
          </Link>

          <h1 className="font-serif font-semibold text-base sm:text-lg text-white truncate max-w-[160px] sm:max-w-xs">
            {isModifica ? `Modifica: ${formData.nome || 'Pianta'}` : 'Nuova Pianta'}
          </h1>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={salvataggioInCorso}
            className="px-4 py-2 bg-[#D34816] hover:bg-[#B83D12] active:scale-95 text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-sm touch-target"
          >
            {salvataggioInCorso ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Salva</span>
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        {errore && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-xs text-red-900">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errore}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-8 rounded-3xl border border-[#1C201C]/10 shadow-xs space-y-7">
          {/* Sezione Foto */}
          <CampoFoto
            fotoUrl={formData.foto_url}
            fotoPath={formData.foto_path}
            onChangeFoto={(url, path) => {
              setFormData(prev => ({ ...prev, foto_url: url, foto_path: path }));
            }}
            onRemoveFoto={() => {
              setFormData(prev => ({ ...prev, foto_url: '', foto_path: '' }));
            }}
          />

          <hr className="border-[#1C201C]/10" />

          {/* Dati Principali */}
          <div className="space-y-4">
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#1C201C]">
              Informazioni Botaniche
            </h2>

            {/* Nome Botanico (Obbligatorio) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 mb-1.5">
                Nome della pianta (botanico) *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="es. Crassula ovata"
                className="w-full px-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white transition-all"
              />
            </div>

            {/* Nome Comune */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 mb-1.5">
                Nome comune / volgare
              </label>
              <input
                type="text"
                value={formData.nome_comune}
                onChange={(e) => handleChange('nome_comune', e.target.value)}
                placeholder="es. Albero di giada"
                className="w-full px-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white transition-all"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 mb-1.5">
                Categoria nel catalogo
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.categoria}
                  onChange={(e) => handleChange('categoria', e.target.value)}
                  className="flex-1 px-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white"
                >
                  {categorieEsistenti.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setMostraNuovaCategoria(!mostraNuovaCategoria)}
                  className="px-3.5 py-2 bg-[#FAF9F6] hover:bg-[#1C201C]/5 border border-[#1C201C]/15 text-[#1C201C] rounded-xl text-xs font-bold transition-colors flex items-center gap-1 touch-target flex-shrink-0"
                >
                  <Plus className="w-4 h-4 text-[#25570A]" />
                  <span>Nuova</span>
                </button>
              </div>

              {/* Input per nuova categoria al volo */}
              {mostraNuovaCategoria && (
                <div className="mt-2.5 flex gap-2">
                  <input
                    type="text"
                    value={nuovaCategoriaInput}
                    onChange={(e) => setNuovaCategoriaInput(e.target.value)}
                    placeholder="Scrivi nuova categoria..."
                    className="flex-1 px-3 py-2 bg-white border border-[#1C201C]/15 rounded-xl text-xs text-[#1C201C]"
                  />
                  <button
                    type="button"
                    onClick={handleAggiungiNuovaCategoria}
                    className="px-4 py-2 bg-[#25570A] text-white rounded-xl text-xs font-bold"
                  >
                    Aggiungi
                  </button>
                </div>
              )}
            </div>

            {/* Tipologia */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 mb-1.5">
                Tipologia pianta
              </label>
              <input
                type="text"
                value={formData.tipologia}
                onChange={(e) => handleChange('tipologia', e.target.value)}
                placeholder="es. Succulenta da esterno, Alberello da vaso, ecc."
                className="w-full px-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white transition-all"
              />
            </div>

            {/* Altezza Pianta - Campo Effettivo Visibile */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 flex items-center gap-1.5">
                  <Ruler className="w-3.5 h-3.5 text-[#25570A]" />
                  <span>Altezza pianta (cm)</span>
                </label>
                <span className="text-[10px] text-[#25570A] font-semibold bg-[#25570A]/10 px-2 py-0.5 rounded-full">
                  Visibile sul catalogo
                </span>
              </div>
              <input
                type="text"
                value={formData.altezza_cm}
                onChange={(e) => handleChange('altezza_cm', e.target.value)}
                placeholder="es. 25/35 oppure 40"
                className="w-full px-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm font-semibold text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white transition-all"
              />
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[10px] text-[#1C201C]/50 font-medium">Scelta rapida:</span>
                {['20/30', '25/35', '35/45', '40/60', '60/80', '80/100'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleChange('altezza_cm', val)}
                    className="px-2 py-1 rounded-lg text-[10px] font-bold bg-[#FAF9F6] border border-[#1C201C]/10 text-[#1C201C]/70 hover:bg-[#25570A]/10 hover:text-[#25570A] transition-colors active:scale-95"
                  >
                    {val} cm
                  </button>
                ))}
              </div>
            </div>
          </div>

          <hr className="border-[#1C201C]/10" />

          {/* Formati Vaso & Disponibilità per Calibro (Singolo o Multi-Vaso) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="font-serif font-bold text-base sm:text-lg text-[#1C201C] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#25570A]" />
                  <span>Formati Vaso & Disponibilità</span>
                </h2>
                <p className="text-xs text-[#1C201C]/60 mt-0.5">
                  Se una pianta viene coltivata in più diametri (es. Ø 16 cm e Ø 19 cm), puoi gestire qui le disponibilità separate.
                </p>
              </div>

              {(!formData.varianti || formData.varianti.length === 0) && (
                <button
                  type="button"
                  onClick={() => {
                    const vasoIniziale = formData.vaso_cm || '14';
                    const dispIniziale = formData.disponibile || '0';
                    const giacIniziale = formData.giacenza || '0';
                    setFormData(prev => ({
                      ...prev,
                      varianti: [
                        { vaso_cm: vasoIniziale, disponibile: dispIniziale, giacenza: giacIniziale },
                        { vaso_cm: '', disponibile: '0', giacenza: '0' }
                      ]
                    }));
                  }}
                  className="px-3 py-1.5 bg-[#25570A]/10 hover:bg-[#25570A]/20 text-[#25570A] text-xs font-bold rounded-xl transition-colors flex items-center gap-1 touch-target flex-shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Aggiungi Più Vasi</span>
                </button>
              )}
            </div>

            {/* SE MULTI-VASO */}
            {Array.isArray(formData.varianti) && formData.varianti.length > 0 ? (
              <div className="space-y-3 p-4 bg-[#FAF9F6] rounded-2xl border border-[#1C201C]/10">
                <div className="flex items-center justify-between text-xs text-[#1C201C]/70">
                  <span className="font-bold">Elenco formati e quantità per calibro vaso:</span>
                  <button
                    type="button"
                    onClick={handleAggiungiVariante}
                    className="text-[#25570A] font-bold hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Aggiungi calibro</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {formData.varianti.map((v, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white rounded-xl border border-[#1C201C]/10 grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
                    >
                      <div className="sm:col-span-3">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1C201C]/60 mb-1">
                          Diametro (cm) *
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={v.vaso_cm}
                          onChange={(e) => handleVarianteChange(idx, 'vaso_cm', e.target.value)}
                          placeholder="es. 16"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm font-bold text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A]"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#25570A] mb-1">
                          Disponibilità Vendita (pz) *
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={v.disponibile}
                          onChange={(e) => handleVarianteChange(idx, 'disponibile', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-white border border-[#25570A]/40 rounded-xl text-sm font-bold text-[#25570A] focus:outline-none focus:ring-2 focus:ring-[#25570A]"
                        />
                      </div>

                      <div className="sm:col-span-4">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#1C201C]/60 mb-1">
                          Giacenza Magazzino (pz)
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={v.giacenza}
                          onChange={(e) => handleVarianteChange(idx, 'giacenza', e.target.value)}
                          placeholder="0"
                          className="w-full px-3 py-2 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm font-medium text-[#1C201C]/70 focus:outline-none focus:ring-2 focus:ring-[#25570A]"
                        />
                      </div>

                      <div className="sm:col-span-1 flex justify-end sm:pt-4">
                        <button
                          type="button"
                          onClick={() => handleRimuoviVariante(idx)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                          title="Rimuovi questo formato"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 flex items-center justify-between text-xs text-[#1C201C]/60">
                  <span>Totale disponibilità calcolata automaticamente:</span>
                  <span className="font-bold text-[#25570A]">
                    {formData.varianti.reduce((acc, v) => acc + (parseInt(v.disponibile, 10) || 0), 0).toLocaleString('it-IT')} pz
                  </span>
                </div>
              </div>
            ) : (
              /* SE FORMATO SINGOLO STANDARD */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 mb-1.5">
                    Diametro vaso (cm)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.vaso_cm}
                    onChange={(e) => handleChange('vaso_cm', e.target.value)}
                    placeholder="es. 14, 16, 20"
                    className="w-full px-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white"
                  />
                </div>

                <div className="bg-[#25570A]/5 p-3.5 rounded-2xl border border-[#25570A]/20">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#25570A] mb-1.5 flex items-center justify-between">
                    <span>Disponibilità Vendita (pz)</span>
                    <span className="text-[10px] text-[#25570A]/70 lowercase font-medium">visibile</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.disponibile}
                    onChange={(e) => handleChange('disponibile', e.target.value)}
                    placeholder="es. 4000"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#25570A]/40 rounded-xl text-base font-bold text-[#25570A] focus:outline-none focus:ring-2 focus:ring-[#25570A]"
                  />
                  {/* Tasti Rapidi Pollice */}
                  <div className="flex items-center justify-between gap-1 pt-1.5 mt-1 border-t border-[#25570A]/10">
                    <span className="text-[10px] text-[#25570A]/70 font-bold uppercase">Rapido:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleModificaRapida('disponibile', -10)}
                        className="px-2 py-0.5 bg-white border border-[#25570A]/20 hover:bg-[#25570A]/10 text-[11px] font-bold text-[#1C201C] rounded-md active:scale-95 touch-target"
                      >
                        -10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModificaRapida('disponibile', 10)}
                        className="px-2 py-0.5 bg-[#25570A]/10 border border-[#25570A]/20 hover:bg-[#25570A]/20 text-[11px] font-bold text-[#25570A] rounded-md active:scale-95 touch-target"
                      >
                        +10
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModificaRapida('disponibile', 50)}
                        className="px-2 py-0.5 bg-[#25570A]/10 border border-[#25570A]/20 hover:bg-[#25570A]/20 text-[11px] font-bold text-[#25570A] rounded-md active:scale-95 touch-target"
                      >
                        +50
                      </button>
                      <button
                        type="button"
                        onClick={() => handleModificaRapida('disponibile', 100)}
                        className="px-2 py-0.5 bg-[#25570A]/10 border border-[#25570A]/20 hover:bg-[#25570A]/20 text-[11px] font-bold text-[#25570A] rounded-md active:scale-95 touch-target"
                      >
                        +100
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#1C201C]/10">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/70 mb-1.5 flex items-center justify-between">
                    <span>Giacenza Magazzino (pz)</span>
                    <span className="text-[10px] text-[#1C201C]/40 lowercase font-medium">gestionale</span>
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formData.giacenza}
                    onChange={(e) => handleChange('giacenza', e.target.value)}
                    placeholder="es. 4000"
                    className="w-full px-3 py-2 bg-white border border-[#1C201C]/15 rounded-xl text-base font-bold text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A]"
                  />
                </div>
              </div>
            )}
          </div>

          <hr className="border-[#1C201C]/10" />

          {/* Dati Commerciali & Logistica Ingrosso */}
          <div className="space-y-4">
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#1C201C]">
              Logistica & Imballaggi Ingrosso
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">


              {/* Prezzo interno (Facoltativo) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/50 mb-1.5">
                  Prezzo interno (€ - Facoltativo)
                </label>
                <input
                  type="text"
                  value={formData.prezzo}
                  onChange={(e) => handleChange('prezzo', e.target.value)}
                  placeholder="Non mostrato ai clienti"
                  className="w-full px-3.5 py-3 bg-[#FAF9F6]/50 border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C]/70 focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white"
                />
              </div>

              {/* Pezzi per pianale */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 mb-1.5">
                  Pezzi per pianale
                </label>
                <input
                  type="text"
                  value={formData.pz_pianale}
                  onChange={(e) => handleChange('pz_pianale', e.target.value)}
                  placeholder="es. 14 o 21/33"
                  className="w-full px-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white"
                />
              </div>

              {/* Pezzi per carrello */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 mb-1.5">
                  Pezzi per carrello CC
                </label>
                <input
                  type="text"
                  value={formData.pz_carrello}
                  onChange={(e) => handleChange('pz_carrello', e.target.value)}
                  placeholder="es. 70 o 100"
                  className="w-full px-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white"
                />
              </div>

              {/* Disponibilità carrelli */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 mb-1.5">
                  Carrelli disponibili (volume settimanale)
                </label>
                <input
                  type="text"
                  value={formData.disponibilita_carrelli}
                  onChange={(e) => handleChange('disponibilita_carrelli', e.target.value)}
                  placeholder="es. 6 CC o 12 carrelli"
                  className="w-full px-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white"
                />
              </div>
            </div>
          </div>

          <hr className="border-[#1C201C]/10" />

          {/* Descrizione & Note */}
          <div className="space-y-4">
            <h2 className="font-serif font-bold text-base sm:text-lg text-[#1C201C]">
              Dettagli & Note
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 mb-1.5">
                Descrizione breve
              </label>
              <textarea
                rows={2}
                value={formData.descrizione}
                onChange={(e) => handleChange('descrizione', e.target.value)}
                placeholder="Fogliame, portamento, particolarità..."
                className="w-full px-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80 mb-1.5">
                Note o condizioni minime d'ordine
              </label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="es. Minimo 1 pianale, lotto in fioritura, ecc."
                className="w-full px-3.5 py-3 bg-[#FAF9F6] border border-[#1C201C]/15 rounded-xl text-sm text-[#1C201C] focus:outline-none focus:ring-2 focus:ring-[#25570A] focus:bg-white"
              />
            </div>

            {/* Toggle Visibilità Touch Friendly a Card */}
            <div className="pt-2">
              <div
                onClick={() => handleChange('visibile', !formData.visibile)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 select-none touch-target ${
                  formData.visibile
                    ? 'bg-[#25570A]/5 border-[#25570A]/40'
                    : 'bg-[#FAF9F6] border-[#1C201C]/15 opacity-75'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                      formData.visibile ? 'bg-[#25570A] text-white' : 'bg-[#1C201C]/15 text-[#1C201C]/50'
                    }`}
                  >
                    {formData.visibile ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-bold text-[#1C201C] block">
                      {formData.visibile ? 'Visibile nel catalogo online' : 'Nascosta dal catalogo'}
                    </span>
                    <span className="text-xs text-[#1C201C]/60 block truncate sm:whitespace-normal">
                      {formData.visibile
                        ? 'I clienti possono vedere questa pianta e i suoi dati.'
                        : 'La pianta è salvata nel gestionale ma non compare ai clienti.'}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-12 h-7 rounded-full p-1 transition-colors flex-shrink-0 flex items-center ${
                    formData.visibile ? 'bg-[#25570A]' : 'bg-[#1C201C]/25'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform ${
                      formData.visibile ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Pulsante Salva in fondo alla form (Desktop) */}
          <div className="pt-4 border-t border-[#1C201C]/10 flex items-center justify-end gap-3">
            <Link
              to="/admin"
              className="px-4 py-3 text-xs font-semibold text-[#1C201C]/70 hover:bg-[#1C201C]/5 rounded-xl transition-colors touch-target"
            >
              Annulla
            </Link>

            <button
              type="submit"
              disabled={salvataggioInCorso}
              className="px-6 py-3.5 bg-[#D34816] hover:bg-[#B83D12] text-white text-sm font-bold rounded-xl transition-colors flex items-center gap-2 shadow-sm touch-target"
            >
              {salvataggioInCorso ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvataggio...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isModifica ? 'Salva Modifiche' : 'Salva Nuova Pianta'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Barra Salva Fissa per Smartphone (Sempre a portata di pollice in fondo allo schermo) */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md p-3 border-t border-[#1C201C]/15 shadow-2xl flex items-center justify-between gap-3 z-40">
        <Link
          to="/admin"
          className="px-4 py-3 text-xs font-bold text-[#1C201C]/70 hover:bg-[#1C201C]/5 rounded-xl transition-colors touch-target"
        >
          Annulla
        </Link>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={salvataggioInCorso}
          className="flex-1 py-3.5 bg-[#D34816] hover:bg-[#B83D12] active:scale-98 text-white text-sm font-bold rounded-2xl transition-all flex items-center justify-center gap-2 shadow-md touch-target"
        >
          {salvataggioInCorso ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Salvataggio...</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>{isModifica ? 'Salva Modifiche' : 'Salva Nuova Pianta'}</span>
            </>
          )}
        </button>
      </div>

      {/* Toast Feedback */}
      <Toast
        message={toast.message}
        type={toast.type}
        onClose={() => setToast({ message: '', type: 'success' })}
      />
    </div>
  );
}

