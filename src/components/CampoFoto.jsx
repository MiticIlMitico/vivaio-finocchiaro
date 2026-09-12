import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';
import ModalRitagliaFoto from './ModalRitagliaFoto';
import { Camera, Image as ImageIcon, Trash2, Loader2, Crop } from 'lucide-react';

export default function CampoFoto({
  fotoUrl,
  fotoPath,
  onChangeFoto,
  onRemoveFoto,
}) {
  const [caricamento, setCaricamento] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [errore, setErrore] = useState(null);

  // Modale di ritaglio
  const [cropperState, setCropperState] = useState({
    isOpen: false,
    imageSrc: null,
    isExistingUrl: false
  });

  // Due input distinti: uno per la galleria e uno per lo scatto da fotocamera
  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // Lettura file selezionato
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrore(null);

    try {
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
      if (galleryInputRef.current) galleryInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  // Modifica foto già esistente
  const handleModificaFotoEsistente = () => {
    if (!fotoUrl) return;
    setCropperState({
      isOpen: true,
      imageSrc: fotoUrl,
      isExistingUrl: true
    });
  };

  // Salvataggio ritaglio + compressione + upload su Supabase Storage
  const handleConfirmCrop = async (croppedBlob) => {
    setCropperState({ isOpen: false, imageSrc: null, isExistingUrl: false });
    setCaricamento(true);
    setProgresso(20);

    try {
      const compressionOptions = {
        maxSizeMB: 0.8,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
        fileType: 'image/jpeg',
        onProgress: (p) => {
          setProgresso(20 + Math.round(p * 0.4));
        }
      };

      const compressedFile = await imageCompression(croppedBlob, compressionOptions);
      setProgresso(70);

      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.jpg`;
      const filePath = `piante/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('foto-piante')
        .upload(filePath, compressedFile, {
          cacheControl: '3600',
          upsert: false,
          contentType: 'image/jpeg'
        });

      if (uploadError) throw uploadError;

      setProgresso(90);

      const { data: { publicUrl } } = supabase.storage
        .from('foto-piante')
        .getPublicUrl(filePath);

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
      console.error('Errore durante salvataggio foto:', err);
      setErrore('Impossibile salvare l\'immagine. Riprova.');
    } finally {
      setCaricamento(false);
      setProgresso(0);
    }
  };

  // Eliminazione foto
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
        <label className="block text-xs font-bold uppercase tracking-wider text-[#1C201C]/80">
          Foto della pianta
        </label>
        <span className="text-[11px] text-[#1C201C]/60 font-medium">
          Accetta Galleria, iPhone .HEIC, JPG, PNG
        </span>
      </div>

      {/* Contenitore Foto */}
      <div className="relative border-2 border-dashed border-[#1C201C]/15 rounded-3xl p-4 bg-[#FAF9F6] overflow-hidden">
        {fotoUrl ? (
          <div className="space-y-3 max-w-md mx-auto">
            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-[#FAF9F6] border border-[#1C201C]/10 shadow-xs">
              <img
                src={fotoUrl}
                alt="Anteprima foto pianta"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Pulsanti Azione Foto Ben Distinti e Facili da Toccare */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={handleModificaFotoEsistente}
                disabled={caricamento}
                className="py-2.5 px-2 bg-white hover:bg-[#FAF9F6] border border-[#1C201C]/15 text-[#1C201C] rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 touch-target active:scale-95 shadow-xs"
                title="Ritaglia o ricentra la foto"
              >
                <Crop className="w-4 h-4 text-[#25570A]" />
                <span>Ritaglia</span>
              </button>

              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                disabled={caricamento}
                className="py-2.5 px-2 bg-[#25570A] hover:bg-[#1E4608] text-white rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 touch-target active:scale-95 shadow-xs"
                title="Scegli un'altra foto dalla galleria"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Cambia</span>
              </button>

              <button
                type="button"
                onClick={handleEliminaFoto}
                disabled={caricamento}
                className="py-2.5 px-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 rounded-xl text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 touch-target active:scale-95"
                title="Rimuovi foto"
              >
                <Trash2 className="w-4 h-4" />
                <span>Rimuovi</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="py-6 sm:py-8 flex flex-col items-center justify-center text-center p-2">
            <div className="w-14 h-14 rounded-2xl bg-[#25570A]/10 text-[#25570A] flex items-center justify-center mb-3">
              <ImageIcon className="w-7 h-7" />
            </div>

            <p className="font-serif font-bold text-base text-[#1C201C] mb-1">
              Aggiungi foto della pianta
            </p>
            <p className="text-xs text-[#1C201C]/60 mb-5 max-w-xs leading-relaxed">
              Scegli una foto già presente nel telefono oppure scattala adesso in serra.
            </p>

            {/* Due pulsanti distinti: Galleria o Fotocamera */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 w-full max-w-xs">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="w-full px-4 py-3 bg-[#25570A] hover:bg-[#1E4608] active:scale-95 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 touch-target"
              >
                <ImageIcon className="w-4 h-4" />
                <span>Apri Galleria Foto</span>
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="w-full px-4 py-3 bg-white hover:bg-[#FAF9F6] border border-[#1C201C]/15 active:scale-95 text-[#1C201C] rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 touch-target shadow-xs"
              >
                <Camera className="w-4 h-4 text-[#D34816]" />
                <span>Scatta Fotocamera</span>
              </button>
            </div>
          </div>
        )}

        {/* Input file 1: GALLERIA FOTO (senza capture attribute -> apre la libreria foto) */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*,.heic,.heif,.jpg,.jpeg,.png,.webp,.avif,.bmp,.gif"
          onChange={handleFileChange}
          disabled={caricamento}
          className="hidden"
          id="campo-foto-galleria"
        />

        {/* Input file 2: FOTOCAMERA (con capture="environment" -> apre la fotocamera diretta) */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          disabled={caricamento}
          className="hidden"
          id="campo-foto-fotocamera"
        />

        {/* Avanzamento */}
        {caricamento && (
          <div className="absolute inset-0 bg-white/95 rounded-2xl flex flex-col items-center justify-center p-6 z-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#25570A] mb-3" />
            <p className="text-xs font-bold text-[#1C201C] mb-2">
              Salvataggio ed elaborazione immagine... ({progresso}%)
            </p>
            <div className="w-full max-w-xs bg-[#FAF9F6] border border-[#1C201C]/10 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#25570A] h-full transition-all duration-200 ease-out"
                style={{ width: `${progresso}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {errore && (
        <p className="text-xs font-medium text-red-700 bg-red-50 p-3 rounded-xl border border-red-200">
          {errore}
        </p>
      )}

      {/* Modale di Ritaglio */}
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
