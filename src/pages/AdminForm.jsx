import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import CampoFoto from '../components/CampoFoto';
import Toast from '../components/Toast';
import { ArrowLeft, Save, Loader2, Plus, Sprout, AlertCircle } from 'lucide-react';

export default function AdminForm() {
  const { id } = useParams();
  const isModifica = Boolean(id);
  const navigate = useNavigate();

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
    prezzo: '',
    descrizione: '',
    note: '',
    visibile: true,
    foto_url: '',
    foto_path: ''
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
          // Assicurati che ci siano alcune categorie standard di vivaio
          catSet.add('Piante Grasse e Succulente');
          catSet.add('Piante Mediterranee e Aromatiche');
          catSet.add('Palme ed Esotiche');
          catSet.add('Agrumi ed Interno');
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
            setFormData({
              nome: pianta.nome || '',
              nome_comune: pianta.nome_comune || '',
              categoria: pianta.categoria || 'Altre piante',
              tipologia: pianta.tipologia || '',
              vaso_cm: pianta.vaso_cm !== null ? String(pianta.vaso_cm) : '',
              altezza_cm: pianta.altezza_cm || '',
              peso_kg: pianta.peso_kg !== null ? String(pianta.peso_kg) : '',
              pz_pianale: pianta.pz_pianale || '',
              pz_carrello: pianta.pz_carrello || '',
              disponibilita_carrelli: pianta.disponibilita_carrelli || '',
              prezzo: pianta.prezzo !== null ? String(pianta.prezzo) : '',
              descrizione: pianta.descrizione || '',
              note: pianta.note || '',
              visibile: pianta.visibile ?? true,
              foto_url: pianta.foto_url || '',
              foto_path: pianta.foto_path || ''
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

    // Validazione dei soli campi obbligatori
    if (!formData.nome.trim()) {
      setErrore('Il nome botanico della pianta è obbligatorio.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!formData.prezzo || isNaN(Number(formData.prezzo.replace(',', '.')))) {
      setErrore('Inserisci un prezzo valido (es: 4.50).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSalvataggioInCorso(true);

    try {
      // Normalizzazione payload
      const prezzoNumerico = Number(formData.prezzo.replace(',', '.'));
      const vasoNumerico = formData.vaso_cm ? Number(formData.vaso_cm.replace(',', '.')) : null;
      const pesoNumerico = formData.peso_kg ? Number(formData.peso_kg.replace(',', '.')) : null;

      const payload = {
        nome: formData.nome.trim(),
        nome_comune: formData.nome_comune.trim() || null,
        categoria: formData.categoria || 'Altre piante',
        tipologia: formData.tipologia.trim() || null,
        vaso_cm: isNaN(vasoNumerico) ? null : vasoNumerico,
        altezza_cm: formData.altezza_cm.trim() || null,
        peso_kg: isNaN(pesoNumerico) ? null : pesoNumerico,
        pz_pianale: formData.pz_pianale.trim() || null,
        pz_carrello: formData.pz_carrello.trim() || null,
        disponibilita_carrelli: formData.disponibilita_carrelli.trim() || null,
        prezzo: prezzoNumerico,
        descrizione: formData.descrizione.trim() || null,
        note: formData.note.trim() || null,
        visibile: formData.visibile,
        foto_url: formData.foto_url || null,
        foto_path: formData.foto_path || null
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
      <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
        <Loader2 className="w-8 h-8 animate-spin text-moss-700 mb-2" />
        <p className="text-sm font-medium text-stone-600">Caricamento scheda pianta...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 pb-24 sm:pb-16">
      {/* Header Form */}
      <div className="bg-white border-b border-stone-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 text-stone-600 hover:text-stone-900 font-semibold text-xs touch-target"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Indietro</span>
          </Link>

          <h1 className="font-display font-bold text-base sm:text-lg text-stone-900 truncate">
            {isModifica ? `Modifica: ${formData.nome || 'Pianta'}` : 'Nuova Pianta'}
          </h1>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={salvataggioInCorso}
            className="px-4 py-2 bg-moss-700 hover:bg-moss-800 text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm touch-target"
          >
            {salvataggioInCorso ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Salva</span>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        {errore && (
          <div className="mb-6 p-4 bg-clay-50 border border-clay-200 rounded-2xl flex items-start gap-3 text-xs text-clay-900">
            <AlertCircle className="w-5 h-5 text-clay-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errore}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white p-5 sm:p-8 rounded-2xl border border-stone-200 shadow-sm space-y-6">
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

          <hr className="border-stone-100" />

          {/* Dati Principali */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-sm text-stone-900">
              Informazioni Principali
            </h2>

            {/* Nome Botanico (Obbligatorio) */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Nome della pianta (botanico) *
              </label>
              <input
                type="text"
                required
                value={formData.nome}
                onChange={(e) => handleChange('nome', e.target.value)}
                placeholder="es. Crassula ovata"
                className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white"
              />
            </div>

            {/* Nome Comune */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Nome comune / volgare
              </label>
              <input
                type="text"
                value={formData.nome_comune}
                onChange={(e) => handleChange('nome_comune', e.target.value)}
                placeholder="es. Albero di giada"
                className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white"
              />
            </div>

            {/* Categoria */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Categoria nel catalogo
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.categoria}
                  onChange={(e) => handleChange('categoria', e.target.value)}
                  className="flex-1 px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white"
                >
                  {categorieEsistenti.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() => setMostraNuovaCategoria(!mostraNuovaCategoria)}
                  className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1 touch-target flex-shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuova</span>
                </button>
              </div>

              {/* Input per nuova categoria al volo */}
              {mostraNuovaCategoria && (
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={nuovaCategoriaInput}
                    onChange={(e) => setNuovaCategoriaInput(e.target.value)}
                    placeholder="Scrivi nuova categoria..."
                    className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                  <button
                    type="button"
                    onClick={handleAggiungiNuovaCategoria}
                    className="px-3 py-2 bg-moss-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Aggiungi
                  </button>
                </div>
              )}
            </div>

            {/* Tipologia */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Tipologia pianta
              </label>
              <input
                type="text"
                value={formData.tipologia}
                onChange={(e) => handleChange('tipologia', e.target.value)}
                placeholder="es. Succulenta da esterno, Alberello da vaso, ecc."
                className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white"
              />
            </div>
          </div>

          <hr className="border-stone-100" />

          {/* Dati Commerciali & Logistici */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-sm text-stone-900">
              Misure & Logistica Ingrosso
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Prezzo Ingrosso (Obbligatorio) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Prezzo all'ingrosso (€) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.prezzo}
                  onChange={(e) => handleChange('prezzo', e.target.value)}
                  placeholder="es. 4.80"
                  className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white"
                />
              </div>

              {/* Diametro Vaso */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Diametro vaso (cm)
                </label>
                <input
                  type="text"
                  value={formData.vaso_cm}
                  onChange={(e) => handleChange('vaso_cm', e.target.value)}
                  placeholder="es. 18"
                  className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white"
                />
              </div>

              {/* Altezza */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Altezza media (cm)
                </label>
                <input
                  type="text"
                  value={formData.altezza_cm}
                  onChange={(e) => handleChange('altezza_cm', e.target.value)}
                  placeholder="es. 40/60"
                  className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white"
                />
              </div>

              {/* Peso */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Peso stimato (kg)
                </label>
                <input
                  type="text"
                  value={formData.peso_kg}
                  onChange={(e) => handleChange('peso_kg', e.target.value)}
                  placeholder="es. 2.5"
                  className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white"
                />
              </div>

              {/* Pezzi per pianale */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Pezzi per pianale
                </label>
                <input
                  type="text"
                  value={formData.pz_pianale}
                  onChange={(e) => handleChange('pz_pianale', e.target.value)}
                  placeholder="es. 14 o 21/33"
                  className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white"
                />
              </div>

              {/* Pezzi per carrello */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Pezzi per carrello CC
                </label>
                <input
                  type="text"
                  value={formData.pz_carrello}
                  onChange={(e) => handleChange('pz_carrello', e.target.value)}
                  placeholder="es. 70 o 100"
                  className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white"
                />
              </div>

              {/* Disponibilità carrelli */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Carrelli disponibili (volume settimanale)
                </label>
                <input
                  type="text"
                  value={formData.disponibilita_carrelli}
                  onChange={(e) => handleChange('disponibilita_carrelli', e.target.value)}
                  placeholder="es. 6 CC o 12 carrelli"
                  className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <hr className="border-stone-100" />

          {/* Descrizione & Note */}
          <div className="space-y-4">
            <h2 className="font-display font-bold text-sm text-stone-900">
              Dettagli Aggiuntivi
            </h2>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Descrizione breve
              </label>
              <textarea
                rows={2}
                value={formData.descrizione}
                onChange={(e) => handleChange('descrizione', e.target.value)}
                placeholder="Fogliame, portamento, particolarità..."
                className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white resize-y"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Note o condizioni minime d'ordine
              </label>
              <input
                type="text"
                value={formData.note}
                onChange={(e) => handleChange('note', e.target.value)}
                placeholder="es. Minimo 1 pianale, lotto in fioritura, ecc."
                className="w-full px-3.5 py-3 bg-stone-50 border border-stone-200 rounded-xl text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-moss-600 focus:bg-white"
              />
            </div>

            {/* Toggle Visibilità */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.visibile}
                  onChange={(e) => handleChange('visibile', e.target.checked)}
                  className="w-5 h-5 text-moss-700 rounded border-stone-300 focus:ring-moss-600"
                />
                <div>
                  <span className="text-sm font-semibold text-stone-900 block">
                    Pubblicata e visibile sul catalogo online
                  </span>
                  <span className="text-xs text-stone-500">
                    Se disattivata, la pianta resta salvata nel gestionale ma non compare ai clienti.
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* Pulsante Salva in fondo alla form */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-3">
            <Link
              to="/admin"
              className="px-4 py-3 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-xl transition-colors touch-target"
            >
              Annulla
            </Link>

            <button
              type="submit"
              disabled={salvataggioInCorso}
              className="px-6 py-3.5 bg-moss-700 hover:bg-moss-800 text-white text-sm font-semibold rounded-xl transition-colors flex items-center gap-2 shadow-md touch-target"
            >
              {salvataggioInCorso ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Salvataggio...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Salva Pianta</span>
                </>
              )}
            </button>
          </div>
        </form>
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
