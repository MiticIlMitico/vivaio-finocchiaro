import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';
import ModalRitagliaFoto from './ModalRitagliaFoto';
import { Camera, UploadCloud, Trash2, Loader2, Crop, Image as ImageIcon, Sparkles } from 'lucide-react';

export default function CampoFoto({
  fotoUrl,
  fotoPath,
  onChangeFoto,
  onRemoveFoto,
}) {
  const [caricamento, setCaricamento] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [errore, setErrore] = useState(null);

  // Stato per la modale di ritaglio
  const [cropperState, setCropperState] = useState({
    isOpen: false,
    imageSrc: null,
    isExistingUrl: false
  });

  const inputRef = useRef(null);

  // Selezione file dal dispositivo / fotocamera
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrore(null);

    try {
      // Legge il file in formato Data URL o Object URL per il cropper
      const reader = new FileReader();
      reader.onload = () => {
        setCropperState({
          isOpen: true,
          imageSrc: reader.result,
          isExistingUrl: false
        });
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error('Errore lettura file:', err);
      setErrore('Formato non supportato o file danneggiato. Prova con un\'altra immagine.');
    } finally {
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  // Modifica/Ritaglio di una foto già caricata in precedenza
  const handleModificaFotoEsistente = () => {
    if (!fotoUrl) return;
    setCropperState({
      isOpen: true,
      imageSrc: fotoUrl,
      isExistingUrl: true
    });
  };

  // Callback di conferma dal cropper: comprime e carica su Supabase Storage
  const handleConfirmCrop = async (croppedBlob) => {
    setCropperState({ isOpen: false, imageSrc: null, isExistingUrl: false });
    setCaricamento(true);
    setProgresso(20);

    try {
      // Compressione automatica del ritaglio lato client
      const compressionOptions = {
        maxSizeMB: 0.8, // Max ~800 KB
        maxWidthOrHeight: 1600, // Max 1600 px
        useWebWorker: true,
        fileType: 'image/jpeg',
        onProgress: (p) => {
          setProgresso(20 + Math.round(p * 0.4));
        }
      };

      const compressedFile = await imageCompression(croppedBlob, compressionOptions);
      setProgresso(70);

      // Genera nome file univoco
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
      const filePath = `piante/${fileName}`;

      // Upload su Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('foto-piante')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      setProgresso(90);

      // Recupera URL pubblico
      const { data: { publicUrl } } = supabase.storage
        .from('foto-piante')
        .getPublicUrl(filePath);

      // Rimuovi la vecchia foto se presente per evitare accumulo
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
      setErrore('Impossibile salvare la foto ritagliata. Riprova.');
    } finally {
      setCaricamento(false);
      setProgresso(0);
    }
  };

  // Rimozione foto
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
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
          Foto della pianta
        </label>
        <span className="text-[11px] text-stone-500 font-medium">
          Accetta JPG, PNG, WEBP, HEIC/iPhone, AVIF
        </span>
      </div>

      {/* Box Anteprima o Upload */}
      <div className="relative border-2 border-dashed border-stone-300 rounded-3xl p-4 bg-stone-50/70 hover:bg-stone-50 transition-colors overflow-hidden">
        {fotoUrl ? (
          <div className="relative aspect-[4/3] w-full max-w-md mx-auto rounded-2xl overflow-hidden bg-stone-200 border border-stone-200 shadow-sm group">
            <img
              src={fotoUrl}
              alt="Anteprima foto pianta"
              className="w-full h-full object-cover"
            />

            {/* Barra Azioni Sovrapposta (Touch-friendly) */}
            <div className="absolute inset-0 bg-stone-950/60 backdrop-blur-[2px] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex flex-wrap items-center justify-center gap-2.5 p-4">
              {/* Ritaglia / Modifica Dimensione */}
              <button
                type="button"
                onClick={handleModificaFotoEsistente}
                disabled={caricamento}
                className="px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 touch-target active:scale-95"
              >
                <Crop className="w-4 h-4" />
                <span>Ritaglia / Ridimensiona</span>
              </button>

              {/* Cambia Foto / Scatta */}
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={caricamento}
                className="px-3.5 py-2.5 bg-white text-stone-800 hover:bg-stone-100 rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 touch-target active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Cambia Foto</span>
              </button>

              {/* Elimina */}
              <button
                type="button"
                onClick={handleEliminaFoto}
                disabled={caricamento}
                className="px-3 py-2.5 bg-clay-700 hover:bg-clay-800 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 touch-target active:scale-95"
              >
                <Trash2 className="w-4 h-4" />
                <span>Rimuovi</span>
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={() => inputRef.current?.click()}
            className="cursor-pointer py-10 flex flex-col items-center justify-center text-center p-4 touch-target"
          >
            <div className="w-16 h-16 rounded-2xl bg-moss-100 text-moss-800 flex items-center justify-center mb-3 shadow-inner">
              <Camera className="w-8 h-8" />
            </div>
            <p className="text-sm font-bold text-stone-900">
              Scatta una foto o caricala dalla galleria
            </p>
            <p className="text-xs text-stone-500 mt-1 max-w-sm leading-relaxed">
              Supporta tutti i formati (inclusi scatti da iPhone .HEIC). Potrai ritagliarla e regolarne le dimensioni prima di salvare.
            </p>
          </div>
        )}

        {/* Input file che accetta tutti i formati immagine */}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.avif,.bmp,.gif"
          capture="environment"
          onChange={handleFileChange}
          disabled={caricamento}
          className="hidden"
          id="campo-foto-input"
        />

        {/* Barra di Avanzamento durante il caricamento */}
        {caricamento && (
          <div className="absolute inset-0 bg-white/95 rounded-3xl flex flex-col items-center justify-center p-6 z-20">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mb-3" />
            <p className="text-xs font-bold text-stone-900 mb-2">
              Salvataggio ed elaborazione immagine... ({progresso}%)
            </p>
            <div className="w-full max-w-xs bg-stone-200 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-emerald-600 h-full transition-all duration-200 ease-out"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {errore && (
        <p className="text-xs font-medium text-clay-700 bg-clay-50 p-3 rounded-xl border border-clay-200">
          {errore}
        </p>
      )}

      {/* Modale di Ritaglio / Ridimensionamento */}
      {cropperState.isOpen && (
        <ModalRitagliaFoto
          imageSrc={cropperState.imageSrc}
          onConfirmCrop={handleConfirmCrop}
          onCancel={() => setCropperState({ isOpen: false, imageSrc: null, isExistingUrl: false })}
        />
      )}
    </div>
  );
}
