/**
 * Configurazione dei campi visibili ai clienti nella card e nel modale di dettaglio.
 * Permette al titolare di gestire preset e singoli flag dalla sezione Admin.
 */

export const DEFAULT_CAMPI_VISIBILI = {
  giacenza: false,
  disponibilita_carrelli: false,
  pz_carrello: true,
  pz_pianale: true,
  vaso_cm: true,
  altezza_cm: true,
  peso_kg: false,
  prezzo: false,
  note: true,
  nome_comune: true
};

export const PRESET_CAMPI = {
  ingrosso: {
    id: 'ingrosso',
    nome: 'Standard Ingrosso (Consigliato)',
    badge: 'Consigliato',
    desc: 'Mostra dati logistici e tecnici (vaso, carrello, pianale, altezza), nascondendo le giacenze esatte.',
    valori: {
      giacenza: false,
      disponibilita_carrelli: false,
      pz_carrello: true,
      pz_pianale: true,
      vaso_cm: true,
      altezza_cm: true,
      peso_kg: false,
      prezzo: false,
      note: true,
      nome_comune: true
    }
  },
  completo: {
    id: 'completo',
    nome: 'Tutto Visibile',
    badge: 'Completo',
    desc: 'Mostra tutti i campi disponibili, inclusi numeri esatti di giacenza e carrelli.',
    valori: {
      giacenza: true,
      disponibilita_carrelli: true,
      pz_carrello: true,
      pz_pianale: true,
      vaso_cm: true,
      altezza_cm: true,
      peso_kg: true,
      prezzo: true,
      note: true,
      nome_comune: true
    }
  },
  essenziale: {
    id: 'essenziale',
    nome: 'Vetrina Essenziale',
    badge: 'Minimale',
    desc: 'Scheda snella: solo foto, nome botanico, nome comune, diametro vaso e altezza.',
    valori: {
      giacenza: false,
      disponibilita_carrelli: false,
      pz_carrello: false,
      pz_pianale: false,
      vaso_cm: true,
      altezza_cm: true,
      peso_kg: false,
      prezzo: false,
      note: false,
      nome_comune: true
    }
  }
};

export const ELENCO_CAMPI = [
  {
    chiave: 'giacenza',
    etichetta: 'Giacenza & Quantità Numeriche',
    descrizione: 'Numero esatto di piante disponibili (es. "1.200 pz")',
    categoria: 'Disponibilità'
  },
  {
    chiave: 'disponibilita_carrelli',
    etichetta: 'Carrelli Pronti Disponibili',
    descrizione: 'Disponibilità espressa in carrelli CC (es. "6 CC")',
    categoria: 'Disponibilità'
  },
  {
    chiave: 'pz_carrello',
    etichetta: 'Pezzi per Carrello CC',
    descrizione: 'Capienza piante per carrello danese roll CC',
    categoria: 'Logistica'
  },
  {
    chiave: 'pz_pianale',
    etichetta: 'Pezzi per Pianale',
    descrizione: 'Quantità di vasi per singolo ripiano/pianale',
    categoria: 'Logistica'
  },
  {
    chiave: 'vaso_cm',
    etichetta: 'Diametro Vaso & Calibri',
    descrizione: 'Misura vaso in cm e pulsanti selezione formato',
    categoria: 'Dati Botanici'
  },
  {
    chiave: 'altezza_cm',
    etichetta: 'Altezza Pianta',
    descrizione: 'Altezza media della pianta (in centimetri)',
    categoria: 'Dati Botanici'
  },
  {
    chiave: 'nome_comune',
    etichetta: 'Nome Comune',
    descrizione: 'Nome volgare o commerciale sotto il nome botanico',
    categoria: 'Dati Botanici'
  },
  {
    chiave: 'peso_kg',
    etichetta: 'Peso Stimato',
    descrizione: 'Peso stimato in kg della singola pianta',
    categoria: 'Logistica'
  },
  {
    chiave: 'prezzo',
    etichetta: 'Prezzo Unitario',
    descrizione: 'Prezzo all\'ingrosso (se non attivo, si richiede su WhatsApp)',
    categoria: 'Commerciale'
  },
  {
    chiave: 'note',
    etichetta: 'Note di Fornitura',
    descrizione: 'Dettagli su fioritura, uniformità del lotto e coltivazione',
    categoria: 'Commerciale'
  }
];

/**
 * Normalizza l'oggetto di configurazione unendo con i default
 */
export function normalizzaCampiVisibili(rawConfig) {
  if (!rawConfig || typeof rawConfig !== 'object') {
    return { ...DEFAULT_CAMPI_VISIBILI };
  }
  return {
    ...DEFAULT_CAMPI_VISIBILI,
    ...rawConfig
  };
}
