import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../lib/cropImage';
import { RotateCw, ZoomIn, Check, X, Crop } from 'lucide-react';

export default function ModalRitagliaFoto({ imageSrc, onConfirmCrop, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(4 / 3); // Default 4:3 come le card del vivaio
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [elaborazione, setElaborazione] = useState(false);

  const onCropComplete = useCallback((_croppedArea, pixels) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleSalvaRitaglio = async () => {
    if (!croppedAreaPixels) return;
    setElaborazione(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      onConfirmCrop(croppedBlob);
    } catch (err) {
      console.error('Errore durante il ritaglio dell\'immagine:', err);
      alert('Impossibile ritagliare l\'immagine. Riprova.');
    } finally {
      setElaborazione(false);
    }
  };

  const handleRuota = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/90 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 select-none animate-in fade-in duration-200">
      {/* Header Modal */}
      <div className="w-full max-w-2xl flex items-center justify-between text-white pb-3 border-b border-white/10 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
            <Crop className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-sm sm:text-base">
              Modifica & Ritaglia Foto
            </h3>
            <p className="text-[10px] text-stone-400">
              Trascina per inquadrare e usa il cursore o le dita per zoomare
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-stone-300 hover:text-white transition-colors touch-target"
          aria-label="Annulla modifica"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Area Cropper Centrale */}
      <div className="relative w-full max-w-2xl flex-1 my-3 bg-stone-900 rounded-2xl overflow-hidden shadow-2xl border border-white/10 min-h-[320px] sm:min-h-[420px]">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          rotation={rotation}
          aspect={aspectRatio}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
          showGrid={true}
          style={{
            containerStyle: {
              background: '#0c0a09',
            },
            cropAreaStyle: {
              border: '2px solid #10b981',
              boxShadow: '0 0 0 9999em rgba(0, 0, 0, 0.65)',
            }
          }}
        />
      </div>

      {/* Controlli Inferiori: Zoom, Rotazione, Formati e Azioni */}
      <div className="w-full max-w-2xl bg-stone-900/90 border border-white/10 p-3 sm:p-4 rounded-2xl flex flex-col gap-3 text-white z-10">
        {/* Riga Selezione Proporzioni / Dimensioni */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-semibold text-stone-400 flex items-center gap-1 flex-shrink-0">
            Formato:
          </span>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              type="button"
              onClick={() => setAspectRatio(4 / 3)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                aspectRatio === 4 / 3
                  ? 'bg-emerald-700 text-white font-bold shadow'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              4:3 (Ideale Vivaio)
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio(1)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                aspectRatio === 1
                  ? 'bg-emerald-700 text-white font-bold shadow'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              1:1 (Quadrato)
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio(16 / 9)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                aspectRatio === 16 / 9
                  ? 'bg-emerald-700 text-white font-bold shadow'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              16:9 (Largo)
            </button>

            <button
              type="button"
              onClick={() => setAspectRatio(undefined)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                aspectRatio === undefined
                  ? 'bg-emerald-700 text-white font-bold shadow'
                  : 'bg-white/10 text-stone-300 hover:bg-white/20'
              }`}
            >
              Libero
            </button>
          </div>

          <button
            type="button"
            onClick={handleRuota}
            className="px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-medium flex items-center gap-1.5 transition-colors ml-auto flex-shrink-0 touch-target"
            title="Ruota di 90 gradi"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Ruota 90°</span>
          </button>
        </div>

        {/* Cursore Zoom */}
        <div className="flex items-center gap-3 pt-1 border-t border-white/10">
          <ZoomIn className="w-4 h-4 text-stone-400 flex-shrink-0" />
          <input
            type="range"
            min={1}
            max={3}
            step={0.05}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full accent-emerald-500 h-1.5 bg-stone-700 rounded-lg cursor-pointer"
          />
          <span className="text-[11px] text-stone-400 w-10 text-right font-mono">
            {zoom.toFixed(1)}x
          </span>
        </div>

        {/* Pulsanti Conferma / Annulla */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={elaborazione}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-stone-300 transition-colors touch-target"
          >
            Annulla
          </button>

          <button
            type="button"
            onClick={handleSalvaRitaglio}
            disabled={elaborazione}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg transition-all flex items-center gap-1.5 touch-target active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>{elaborazione ? 'Elaborazione...' : 'Applica Ritaglio'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
