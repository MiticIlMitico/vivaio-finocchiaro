# Contesto di progetto

Catalogo/listino online per un vivaio all'ingrosso. Due facce della stessa app: una vetrina pubblica in sola lettura e un pannello privato dove il titolare aggiorna i dati da solo.

## Il vincolo che decide tutto

Chi userà il pannello non è una persona tecnica e lo userà **dallo smartphone, in serra**. Ogni volta che c'è una scelta tra "più potente" e "più semplice da usare col pollice", vince la seconda. Niente tabelle a scorrimento orizzontale, niente modali annidate, niente campi obbligatori non necessari, niente messaggi di errore tecnici.

## Stack

React 18 + Vite + JavaScript (no TypeScript) · Tailwind CSS · react-router-dom v6 · Supabase (Postgres + Auth + Storage) · lucide-react per le icone · browser-image-compression per le foto · GitHub + Netlify.

Nessuna libreria di componenti UI. Nessun backend custom: si parla direttamente con Supabase dal client, la sicurezza sta nelle policy RLS.

## Struttura file attesa

```
src/
  lib/supabase.js          client unico, chiavi da env
  content/azienda.js       TUTTI i testi istituzionali e i contatti
  components/
    CardPianta.jsx
    CategoriaAccordion.jsx
    RequireAuth.jsx
    CampoFoto.jsx          input file + compressione + upload + progress
    Toast.jsx
  pages/
    Home.jsx
    Login.jsx
    AdminLista.jsx
    AdminForm.jsx          usata sia per nuova che per modifica
public/_redirects
supabase/schema.sql
```

## Dati

Tabella `piante`, bucket Storage `foto-piante`. Schema autorevole: `supabase/schema.sql`. Non modificarlo senza dirlo.

Campi che vengono direttamente dalle richieste del cliente e non vanno tolti: foto, nome, tipologia, peso, diametro vaso, pezzi per pianale, pezzi per carrello, disponibilità carrelli, prezzo.

`pz_pianale`, `pz_carrello` e `disponibilita_carrelli` sono `text`, non numeri: nel mestiere si scrivono valori come "21/33" o "6 CC". Non convertirli in interi.

`visibile` (boolean) è ciò che comanda l'icona a forma di occhio. Nascondere non è cancellare: la pianta esaurita resta nel database e torna visibile la settimana dopo.

## Sicurezza

- `anon` legge solo le righe con `visibile = true`.
- `authenticated` fa tutto.
- Nel client si usa **solo** la chiave `anon`. La `service_role` non entra mai nel frontend: sta solo negli script di import lanciati da terminale.
- La registrazione pubblica su Supabase Auth va disattivata. L'account è uno, creato a mano.

## Lingua

Interfaccia interamente in italiano. Nomi di variabili e commenti anche in italiano dove riguardano il dominio (pianta, vaso, carrello, pianale): è il vocabolario del cliente e rende il codice leggibile a chi lo riprenderà in mano.

## Cose da non fare

- Non aggiungere carrello, checkout o pagamenti. Gli ordini si chiudono per telefono o WhatsApp.
- Non aggiungere multi-utente, ruoli o permessi. C'è un solo account.
- Non aggiungere internazionalizzazione.
- Non trasformare la pagina pubblica in un e-commerce.
- Non generare centinaia di dati finti: 12 piante di esempio bastano.
