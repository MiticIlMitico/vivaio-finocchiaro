/**
 * Configurazione dei campi visibili ai clienti nella card e nel modale di dettaglio.
 * Permette al titolare di gestire preset e singoli flag dalla sezione Admin con mockup interattivo.
 */

export const DEFAULT_CAMPI_VISIBILI = {
  foto: true,
  nome_comune: true,
  categoria: true,
  tipologia: true,
  vaso_cm: true,
  altezza_cm: true,
  disponibile: true,          // Disponibilità Vendita (pz)
  giacenza: false,            // Giacenza Magazzino (pz)
  disponibilita_carrelli: false,
  pz_carrello: true,
  pz_pianale: true,
  peso_kg: false,
  prezzo: false,
  note: true
};

export const PRESET_CAMPI = {
  solo_disponibile: {
    id: 'solo_disponibile',
    nome: 'Solo Disp. Vendita',
    badge: 'Vendita',
    desc: 'Mostra solo la disponibilità vendita (pz) e nasconde le giacenze magazzino.',
    valori: {
      foto: true,
      nome_comune: true,
      categoria: true,
      tipologia: true,
      vaso_cm: true,
      altezza_cm: true,
      disponibile: true,
      giacenza: false,
      disponibilita_carrelli: false,
      pz_carrello: true,
      pz_pianale: true,
      peso_kg: false,
      prezzo: false,
      note: true
    }
  },
  solo_giacenza: {
    id: 'solo_giacenza',
    nome: 'Solo Giacenze Magazzino',
    badge: 'Magazzino',
    desc: 'Mostra solo le giacenze magazzino e nasconde la disponibilità vendita.',
    valori: {
      foto: true,
      nome_comune: true,
      categoria: true,
      tipologia: true,
      vaso_cm: true,
      altezza_cm: true,
      disponibile: false,
      giacenza: true,
      disponibilita_carrelli: false,
      pz_carrello: true,
      pz_pianale: true,
      peso_kg: false,
      prezzo: false,
      note: true
    }
  },
  entrambi: {
    id: 'entrambi',
    nome: 'Entrambe le Quantità',
    badge: 'Vendita + Scorte',
    desc: 'Mostra sia la disponibilità di vendita sia la giacenza effettiva di magazzino.',
    valori: {
      foto: true,
      nome_comune: true,
      categoria: true,
      tipologia: true,
      vaso_cm: true,
      altezza_cm: true,
      disponibile: true,
      giacenza: true,
      disponibilita_carrelli: true,
      pz_carrello: true,
      pz_pianale: true,
      peso_kg: false,
      prezzo: false,
      note: true
    }
  },
  ingrosso: {
    id: 'ingrosso',
    nome: 'Standard Ingrosso',
    badge: 'Consigliato',
    desc: 'Specifiche logistiche e commerciali complete, disponibilità vendita attiva e prezzi riservati.',
    valori: {
      foto: true,
      nome_comune: true,
      categoria: true,
      tipologia: true,
      vaso_cm: true,
      altezza_cm: true,
      disponibile: true,
      giacenza: false,
      disponibilita_carrelli: false,
      pz_carrello: true,
      pz_pianale: true,
      peso_kg: false,
      prezzo: false,
      note: true
    }
  },
  nessuna: {
    id: 'nessuna',
    nome: 'Nessuna Quantità (Riservato)',
    badge: 'Riservato',
    desc: 'Nasconde tutti i conteggi numerici (mostra solo "Pronto in serra" e dettagli tecnici).',
    valori: {
      foto: true,
      nome_comune: true,
      categoria: true,
      tipologia: true,
      vaso_cm: true,
      altezza_cm: true,
      disponibile: false,
      giacenza: false,
      disponibilita_carrelli: false,
      pz_carrello: true,
      pz_pianale: true,
      peso_kg: false,
      prezzo: false,
      note: true
    }
  },
  completo: {
    id: 'completo',
    nome: 'Tutto Visibile',
    badge: 'Completo',
    desc: 'Tutti i campi attivi inclusi prezzi, giacenze magazzino e disponibilità carrelli.',
    valori: {
      foto: true,
      nome_comune: true,
      categoria: true,
      tipologia: true,
      vaso_cm: true,
      altezza_cm: true,
      disponibile: true,
      giacenza: true,
      disponibilita_carrelli: true,
      pz_carrello: true,
      pz_pianale: true,
      peso_kg: true,
      prezzo: true,
      note: true
    }
  },
  essenziale: {
    id: 'essenziale',
    nome: 'Vetrina Essenziale',
    badge: 'Minimale',
    desc: 'Scheda snella: solo foto, nome comune, categoria, diametro vaso e altezza.',
    valori: {
      foto: true,
      nome_comune: true,
      categoria: true,
      tipologia: false,
      vaso_cm: true,
      altezza_cm: true,
      disponibile: false,
      giacenza: false,
      disponibilita_carrelli: false,
      pz_carrello: false,
      pz_pianale: false,
      peso_kg: false,
      prezzo: false,
      note: false
    }
  }
};

export const ELENCO_CAMPI = [
  { chiave: 'disponibile', etichetta: 'Disponibilità Vendita (pz)', categoria: 'Disponibilità' },
  { chiave: 'giacenza', etichetta: 'Giacenza Magazzino (pz)', categoria: 'Disponibilità' },
  { chiave: 'disponibilita_carrelli', etichetta: 'Carrelli Pronti (volume)', categoria: 'Disponibilità' },
  { chiave: 'pz_carrello', etichetta: 'Pezzi per Carrello CC', categoria: 'Logistica' },
  { chiave: 'pz_pianale', etichetta: 'Pezzi per Pianale', categoria: 'Logistica' },
  { chiave: 'vaso_cm', etichetta: 'Diametro Vaso (cm)', categoria: 'Dati Botanici' },
  { chiave: 'altezza_cm', etichetta: 'Altezza Pianta (cm)', categoria: 'Dati Botanici' },
  { chiave: 'nome_comune', etichetta: 'Nome Comune / Volgare', categoria: 'Dati Botanici' },
  { chiave: 'categoria', etichetta: 'Categoria nel Catalogo', categoria: 'Dati Botanici' },
  { chiave: 'tipologia', etichetta: 'Tipologia Pianta', categoria: 'Dati Botanici' },
  { chiave: 'foto', etichetta: 'Foto Pianta', categoria: 'Media' },
  { chiave: 'peso_kg', etichetta: 'Peso Stimato (kg)', categoria: 'Logistica' },
  { chiave: 'prezzo', etichetta: 'Prezzo Unitario (€)', categoria: 'Commerciale' },
  { chiave: 'note', etichetta: 'Note Coltivazione', categoria: 'Commerciale' }
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
