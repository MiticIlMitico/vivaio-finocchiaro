# Setup — ordine delle operazioni

Fai questi passi **prima** di lanciare il prompt, così Antigravity trova già tutto collegato e non deve indovinare niente.

## 1. Supabase

1. Crea un nuovo progetto. Segnati la password del database.
2. **Settings > API**: copia `Project URL` e la chiave `anon public`. La chiave `service_role` la copi solo se ti serve l'import CSV, e la tieni fuori dal repo.
3. **SQL Editor**: incolla e lancia tutto `supabase/schema.sql`.
4. **Authentication > Providers > Email**: disattiva *Enable sign ups*. Senza questo, chiunque trovi la pagina di login può registrarsi da solo e ritrovarsi con accesso in scrittura al catalogo.
5. **Authentication > Users > Add user**: crea l'account del tuo amico con email e password. Spunta *Auto Confirm User*, altrimenti resta in attesa di una mail di conferma che non arriverà mai.
6. **Storage**: verifica che il bucket `foto-piante` esista e sia `public`. Lo crea lo script SQL, ma controlla.

## 2. Progetto locale

Crea un `.env` (mai committato) con:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
```

La chiave `anon` nel frontend è normale e non è un buco di sicurezza: è pensata per stare lì. Quello che protegge i dati sono le policy RLS che hai appena creato. La `service_role` invece non deve mai comparire nel codice del sito.

## 3. Netlify

- Collega il repo GitHub.
- Build command `npm run build`, publish directory `dist`.
- **Site settings > Environment variables**: aggiungi `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Vengono lette al momento della build, quindi se le aggiungi dopo il primo deploy devi rilanciare la build.
- Verifica che `public/_redirects` contenga `/*  /index.html  200`. Senza, un refresh su `/admin` restituisce 404.

## 4. Caricamento iniziale delle 200 piante

Non inserirle a mano. Due strade:

**A — CSV (consigliata).** Manda al tuo amico `scripts/piante-template.csv`, che lo apra con Excel o Google Fogli e riempia le righe. Poi:

```bash
npm i @supabase/supabase-js papaparse
SUPABASE_URL="..." SUPABASE_SERVICE_KEY="..." node scripts/importa-csv.mjs suo-file.csv
```

Le foto restano da caricare: le fa lui dal pannello, pianta per pianta, oppure le carichi tu in blocco nel bucket e incolli gli URL nella colonna `foto_url` prima dell'import.

**B — Insieme, di persona.** È quello che ha chiesto lui. Inserite insieme le 15–20 piante principali dal pannello, così impara il flusso, e il resto lo fa da solo nelle settimane successive.

## 5. Prima dell'incontro

Arriva con l'app già deployata e popolata di esempi. Fagli fare **lui** la prima pianta, dall'inizio alla fine, dal suo telefono, con te che guardi in silenzio. Ogni punto in cui esita è un punto da sistemare nell'interfaccia, non da spiegare a voce.

Stampagli `GUIDA_UTENTE.md` su un foglio.

## Cose a cui pensare prima di andare online

**I prezzi all'ingrosso sono pubblici.** Chiunque, concorrenti compresi, può vedere il listino. Se è un problema, la variante è tenere pubblica la vetrina senza prezzi e mostrarli solo dopo un login cliente. Chiediglielo esplicitamente prima del lancio: è una scelta commerciale, non tecnica, e cambiarla dopo costa lavoro.

**Il costo.** Piano gratuito Supabase: 500 MB di database e 1 GB di Storage. Con foto compresse a ~500 KB, 200 piante stanno in ~100 MB. Ci sta larghissimo. Netlify gratuito regge senza problemi il traffico di un vivaio. Attenzione a una cosa sola: i progetti Supabase gratuiti vengono messi in pausa dopo un periodo di inattività, ma un sito con visite regolari non ci arriva.

**Backup.** Una volta al mese esporta la tabella `piante` in CSV dalla dashboard Supabase. Sono trenta secondi e ti coprono da una cancellazione sbagliata.

**Il dominio.** Se il vivaio ha già un dominio, si punta un sottodominio tipo `catalogo.nomevivaio.it` su Netlify. Fa una differenza enorme su come viene percepito rispetto a un indirizzo `.netlify.app`.
