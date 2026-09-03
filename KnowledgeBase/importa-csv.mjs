/**
 * Importa in Supabase un elenco di piante da un file CSV.
 * Serve per il caricamento iniziale delle ~200 piante, così non si inseriscono a mano.
 *
 * Uso:
 *   npm i @supabase/supabase-js papaparse
 *   SUPABASE_URL="https://xxxx.supabase.co" \
 *   SUPABASE_SERVICE_KEY="chiave_service_role" \
 *   node scripts/importa-csv.mjs scripts/piante-template.csv
 *
 * ATTENZIONE: la service_role key bypassa RLS. Va usata solo qui, da terminale.
 * Non deve mai finire nel codice del sito né su GitHub.
 */

import fs from 'node:fs';
import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';

const URL = process.env.SUPABASE_URL;
const KEY = process.env.SUPABASE_SERVICE_KEY;
const FILE = process.argv[2];

if (!URL || !KEY || !FILE) {
  console.error('Mancano SUPABASE_URL, SUPABASE_SERVICE_KEY o il percorso del CSV.');
  process.exit(1);
}

const supabase = createClient(URL, KEY, { auth: { persistSession: false } });

const numero = (v) => {
  if (v === undefined || v === null || String(v).trim() === '') return null;
  const n = Number(String(v).replace(',', '.').replace(/[^\d.-]/g, ''));
  return Number.isFinite(n) ? n : null;
};

const testo = (v) => {
  const s = v === undefined || v === null ? '' : String(v).trim();
  return s === '' ? null : s;
};

const csv = fs.readFileSync(FILE, 'utf8');
const { data, errors } = Papa.parse(csv, { header: true, skipEmptyLines: true });

if (errors.length) {
  console.error('Il CSV ha delle righe malformate:', errors.slice(0, 5));
  process.exit(1);
}

const righe = data
  .filter((r) => testo(r.nome))
  .map((r) => ({
    nome: testo(r.nome),
    nome_comune: testo(r.nome_comune),
    categoria: testo(r.categoria) ?? 'Altre piante',
    tipologia: testo(r.tipologia),
    descrizione: testo(r.descrizione),
    vaso_cm: numero(r.vaso_cm),
    altezza_cm: testo(r.altezza_cm),
    peso_kg: numero(r.peso_kg),
    pz_pianale: testo(r.pz_pianale),
    pz_carrello: testo(r.pz_carrello),
    disponibilita_carrelli: testo(r.disponibilita_carrelli),
    prezzo: numero(r.prezzo),
    note: testo(r.note),
    foto_url: testo(r.foto_url),
    visibile: String(r.visibile ?? 'si').trim().toLowerCase() !== 'no',
  }));

console.log(`Righe valide trovate: ${righe.length}`);

const BLOCCO = 200;
let inserite = 0;

for (let i = 0; i < righe.length; i += BLOCCO) {
  const blocco = righe.slice(i, i + BLOCCO);
  const { error } = await supabase.from('piante').insert(blocco);
  if (error) {
    console.error(`Errore sul blocco che parte dalla riga ${i + 1}:`, error.message);
    process.exit(1);
  }
  inserite += blocco.length;
  console.log(`Inserite ${inserite}/${righe.length}`);
}

console.log('Import completato.');
console.log('Le foto vanno caricate dal pannello /admin, una per una, oppure incollando gli URL nella colonna foto_url del CSV prima dell\'import.');
