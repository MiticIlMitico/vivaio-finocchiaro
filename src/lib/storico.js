import { supabase } from './supabase';

/**
 * Registra un evento nello storico delle attività dell'amministratore.
 * Tipi ammessi: 'inserimento' | 'eliminazione' | 'visibilita' | 'giacenza'
 */
export async function registraAttivita({
  tipo,
  piantaNome,
  pianta_nome,
  piantaId = null,
  pianta_id = null,
  descrizione,
  dettagli = {},
  operatore = 'Admin'
}) {
  const nomeEffettivo = piantaNome || pianta_nome;
  const idEffettivo = piantaId || pianta_id || null;

  try {
    if (!tipo || !nomeEffettivo || !descrizione) {
      console.warn('Parametri mancanti per registrazione attività:', { tipo, nomeEffettivo, descrizione });
      return false;
    }

    const { error } = await supabase
      .from('storico_attivita')
      .insert([
        {
          pianta_id: idEffettivo,
          pianta_nome: nomeEffettivo,
          tipo,
          descrizione,
          dettagli,
          operatore,
          created_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Errore durante inserimento storico_attivita:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Eccezione in registraAttivita:', err);
    return false;
  }
}

/**
 * Carica gli eventi dello storico con filtri opzionali
 */
export async function caricaStorico({ limit = 100, filtroTipo = 'tutti', ricerca = '' } = {}) {
  try {
    let query = supabase
      .from('storico_attivita')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (filtroTipo && filtroTipo !== 'tutti') {
      query = query.eq('tipo', filtroTipo);
    }

    if (ricerca && ricerca.trim()) {
      query = query.ilike('pianta_nome', `%${ricerca.trim()}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('Errore nel caricamento storico_attivita:', err);
    return [];
  }
}

/**
 * Formatta timestamp in formato italiano con ora e data precisa
 */
export function formattaDataOra(isoString) {
  if (!isoString) return { data: '-', ora: '-', relativo: '-' };

  const dataObj = new Date(isoString);
  if (isNaN(dataObj.getTime())) return { data: '-', ora: '-', relativo: '-' };

  const adesso = new Date();
  const diffMs = adesso.getTime() - dataObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffOre = Math.floor(diffMin / 60);
  const diffGiorni = Math.floor(diffOre / 24);

  let relativo = '';
  if (diffSec < 60) {
    relativo = 'Pochi secondi fa';
  } else if (diffMin < 60) {
    relativo = `${diffMin} ${diffMin === 1 ? 'minuto' : 'minuti'} fa`;
  } else if (diffOre < 24 && adesso.getDate() === dataObj.getDate()) {
    relativo = `Oggi alle ${dataObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffGiorni === 1 || (diffGiorni === 0 && adesso.getDate() !== dataObj.getDate())) {
    relativo = `Ieri alle ${dataObj.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    relativo = dataObj.toLocaleDateString('it-IT', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  const dataCompleta = dataObj.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const oraCompleta = dataObj.toLocaleTimeString('it-IT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return {
    data: dataCompleta,
    ora: oraCompleta,
    relativo,
    estesa: `${dataCompleta}, ${oraCompleta}`
  };
}
