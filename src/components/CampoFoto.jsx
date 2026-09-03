import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';
import { Camera, UploadCloud, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';

export default function CampoFoto({
  fotoUrl,
  fotoPath,
  onChangeFoto,
  onRemoveFoto,
}) {
  const [caricamento, setCaricamento] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [errore, setErrore] = useState(null);
  const inputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrore(null);
    setCaricamento(true);
    setProgresso(15);

    try {
      // 1. Compressione dell'immagine lato client
      const compressionOptions = {
        maxSizeMB: 0.8, // Massimo ~800 KB
        maxWidthOrHeight: 1600, // Massimo 1600 px sul lato lungo
        useWebWorker: true,
        onProgress: (p) => {
          // Progresso compressione mappato 15% -> 50%
          setProgresso(15 + Math.round(p * 0.35));
        }
      };

      const compressedFile = await imageCompression(file, compressionOptions);
      setProgresso(55);

      // 2. Genera nome file univoco e pulito
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const cleanExt = ['jpg', 'jpeg', 'png', 'webp'].includes(fileExt) ? fileExt : 'jpg';
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${cleanExt}`;
      const filePath = `piante/${fileName}`;

      // 3. Upload nel bucket Storage "foto-piante"
      setProgresso(70);
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('foto-piante')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw uploadError;
      }

      setProgresso(90);

      // 4. Recupera URL pubblico
      const { data: { publicUrl } } = supabase.storage
        .from('foto-piante')
        .getPublicUrl(filePath);

      // 5. Se c'era già una vecchia foto nel bucket, la rimuoviamo per non lasciare file orfani
      if (fotoPath) {
        try {
          await supabase.storage.from('foto-piante').remove([fotoPath]);
        } catch (removeErr) {
          console.warn('Rimozione vecchia foto non riuscita:', removeErr);
        }
      }

      setProgresso(100);
      onChangeFoto(publicUrl, filePath);
    } catch (err) {
      console.error('Errore durante elaborazione o upload foto:', err);
      setErrore('Impossibile caricare la foto. Riprova con un\'altra immagine.');
    } finally {
      setCaricamento(false);
      setProgresso(0);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  const handleEliminaFoto = async () => {
    if (!window.confirm('Vuoi rimuovere questa foto?')) return;

    if (fotoPath) {
      try {
        await supabase.storage.from('foto-piante').remove([fotoPath]);
      } catch (err) {
        console.warn('Errore cancellazione file da storage:', err);
      }
    }

    onRemoveFoto();
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-stone-900">
        Foto della pianta
      </label>

      {/* Box Anteprima o Upload */}
      <div className="relative border-2 border-dashed border-stone-300 rounded-2xl p-4 bg-stone-50/70 hover:bg-stone-50 transition-colors">
        {fotoUrl ? (
          <div className="relative aspect-[4/3] w-full max-w-md mx-auto rounded-xl overflow-hidden bg-stone-200 border border-stone-200">
            <img
              src={fotoUrl}
              alt="Anteprima foto selezionata"
              className="w-full h-full object-cover"
            />
            {/* Azioni su foto presente */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] opacity-100 sm:opacity-0 sm:hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={caricamento}
                className="px-3.5 py-2.5 bg-white text-stone-800 rounded-xl text-xs font-semibold shadow hover:bg-stone-100 transition-colors flex items-center gap-1.5 touch-target"
              >
                <Camera className="w-4 h-4" />
                <span>Scatta / Cambia</span>
              </button>

              <button
                type="button"
                onClick={handleEliminaFoto}
                disabled={caricamento}
                className="px-3.5 py-2.5 bg-clay-700 text-white rounded-xl text-xs font-semibold shadow hover:bg-clay-800 transition-colors flex items-center gap-1.5 touch-target"
              >
                <Trash2 className="w-4 h-4" />
                <span>Rimuovi</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer py-8 flex flex-col items-center justify-center text-center p-4 touch-target"
          >
            <div className="w-14 h-14 rounded-2xl bg-moss-100 text-moss-800 flex items-center justify-center mb-3">
              <Camera className="w-7 h-7" />
            </div>
            <p className="text-sm font-semibold text-stone-800">
              Tocca per scattare una foto o scegliere dalla galleria
            </p>
            <p className="text-xs text-stone-500 mt-1 max-w-xs">
              Viene ottimizzata e compressa automaticamente per il caricamento rapido
            </p>
          </div>
        )}

        {/* Input file nascosto ma accessibile */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={caricamento}
          className="hidden"
          id="campo-foto-input"
        />

        {/* Indicatore di caricamento e barra di avanzamento */}
        {caricamento && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 z-20">
            <Loader2 className="w-8 h-8 animate-spin text-moss-700 mb-2" />
            <p className="text-xs font-semibold text-stone-800 mb-2">
              Ottimizzazione e caricamento foto in corso... ({progresso}%)
            </p>
            <div className="w-full max-w-xs bg-stone-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-moss-700 h-full transition-all duration-200 ease-out"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {errore && (
        <p className="text-xs font-medium text-clay-700 bg-clay-50 p-2.5 rounded-lg border border-clay-200">
          {errore}
        </p>
      )}
    </div>
  );
}
