# Vivaio Finocchiaro — WebApp Catalogo & Listino All'Ingrosso

Catalogo e listino prezzi all'ingrosso per vivaio, ottimizzato per consultazione clienti e gestione mobile-first da parte del vivaista direttamente dallo smartphone in serra.

## Stack Tecnologico
- **Frontend**: React 18, Vite, Tailwind CSS, Lucide React, React Router DOM v6
- **Compressione Immagini**: `browser-image-compression` (ridimensionamento client-side a max 1600px, max ~800KB)
- **Backend & Database**: Supabase (PostgreSQL con Row Level Security, Supabase Auth, Supabase Storage bucket `foto-piante`)
- **Hosting & CI/CD**: Netlify con trigger automatico da GitHub
- **Anti-Down / Keep-Alive**: GitHub Action programmata che esegue un ping giornaliero alla REST API di Supabase per prevenire la sospensione del database gratuito

## Avvio in Locale

1. Clona il repository e installa le dipendenze:
   ```bash
   npm install
   ```

2. Crea il file `.env` (puoi copiare `.env.example`):
   ```bash
   cp .env.example .env
   ```
   Inserisci le chiavi del tuo progetto Supabase:
   ```env
   VITE_SUPABASE_URL=https://zwsgsenhyvrpprlmtufj.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

3. Avvia il server di sviluppo locale:
   ```bash
   npm run dev
   ```

4. Per verificare la compilazione di produzione:
   ```bash
   npm run build
   ```

## Struttura del Progetto
```
src/
  content/azienda.js       # Tutti i testi istituzionali, recapiti e numero WhatsApp
  lib/supabase.js          # Client singleton Supabase
  components/
    Navbar.jsx             # Barra superiore e navigazione
    CardPianta.jsx         # Card con foto, dati tecnici per carrello/pianale e CTA WhatsApp
    CategoriaAccordion.jsx # Fisarmonica fluida raggruppata per categoria botanica
    CampoFoto.jsx          # Input fotocamera, compressione client e upload Storage
    Lightbox.jsx           # Ingrandimento foto a pieno schermo
    RequireAuth.jsx        # Guardia per rotte admin
    Toast.jsx              # Notifiche di salvataggio/errore
  pages/
    Home.jsx               # Vetrina pubblica
    Login.jsx              # Login minimale protetto
    AdminLista.jsx         # Elenco compatto mobile-first con toggle visibilità immediato
    AdminForm.jsx          # Inserimento e modifica pianta
public/_redirects          # Regola SPA rewrite per Netlify
supabase/schema.sql        # Schema tabelle, indici, RLS e bucket storage
.github/workflows/         # Workflow keep-alive Supabase
```

## Credenziali Amministratore Predefinite
- **Email**: `sonomitic@gmail.com`
- **Password**: `ciao1234`
- **Pannello Admin**: `/admin`
