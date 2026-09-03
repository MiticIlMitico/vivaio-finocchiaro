# Prompt unico — da incollare in Antigravity

> Prima di lanciare questo prompt: metti `AGENTS.md`, `supabase/schema.sql` e la cartella `docs/` nella root del progetto vuoto. Poi incolla tutto quello che segue in un unico messaggio.

---

Costruisci una web app completa e funzionante per il catalogo/listino di un vivaio all'ingrosso.

## Contesto

Il cliente è un vivaio che vende piante all'ingrosso a rivenditori e garden center. Oggi manda un PDF o fa vedere le piante di persona. Vuole una vetrina online sempre aggiornata e, soprattutto, vuole poterla aggiornare da solo dal telefono mentre è in serra, senza toccare codice, senza Canva, senza rimandare file a nessuno.

Il catalogo ha circa 200 piante. I dati cambiano ogni settimana (prezzi e disponibilità carrelli soprattutto).

L'utente che gestirà il pannello **non è tecnico**. È l'unico vincolo veramente importante del progetto: se il pannello admin non è usabile da uno smartphone, con un dito, in mezzo alle piante, il progetto è fallito.

## Stack (già disponibile via MCP, usalo)

- Vite + React 18 + JavaScript (no TypeScript)
- react-router-dom v6
- Tailwind CSS
- Supabase (database Postgres, Auth email/password, Storage per le foto)
- Deploy su Netlify, repo su GitHub

Non aggiungere librerie UI pesanti (no MUI, no Chakra, no shadcn). Solo Tailwind + `lucide-react` per le icone. Per la compressione delle foto lato client usa `browser-image-compression`.

## Cosa devi fare, in ordine

### 1. Database

Esegui il contenuto di `supabase/schema.sql` sul progetto Supabase collegato. Crea la tabella `piante`, il bucket Storage `foto-piante`, le policy RLS e il trigger su `updated_at`. Non inventare uno schema diverso: quello nel file è già quello concordato col cliente.

Poi popola il database con **12 piante di esempio realistiche** (nomi botanici veri di piante mediterranee e succulente da vivaio: Crassula ovata, Chamaerops humilis, Olea europaea, Nerium oleander, Aloe arborescens, Strelitzia reginae, Dracaena marginata, Rosmarinus officinalis, Lavandula stoechas, Citrus limon, Ficus lyrata, Sansevieria trifasciata), con prezzi all'ingrosso plausibili (2–35 €), foto placeholder da Unsplash e due piante con `visibile = false` così si vede subito il comportamento del filtro.

### 2. Struttura app

Una sola app React, un solo repo, un solo deploy. Routing:

| Rotta | Accesso | Cosa fa |
|---|---|---|
| `/` | pubblica | Vetrina: azienda + catalogo piante visibili |
| `/login` | pubblica | Email + password |
| `/admin` | protetta | Elenco gestionale con CRUD |
| `/admin/nuova` | protetta | Form nuova pianta |
| `/admin/:id` | protetta | Form modifica pianta |

`/admin/*` protetta da un componente `RequireAuth` che controlla la sessione Supabase e reindirizza a `/login`. Gestisci anche lo stato di caricamento iniziale della sessione, senza sfarfallii che mandano l'utente al login mentre la sessione si sta ancora idratando.

Client Supabase unico in `src/lib/supabase.js`, chiavi da variabili d'ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`. Crea anche `.env.example`. Mai chiavi hardcoded nel codice.

### 3. Pagina pubblica `/`

Sezioni, dall'alto:

1. **Hero.** Nome azienda, una riga su cosa fanno, foto di sfondo. Tutti i testi presi da un unico file `src/content/azienda.js` con dei segnaposto chiaramente marcati `[DA COMPILARE]`, perché la parte istituzionale non è ancora definita e va riempita dopo senza cercare stringhe sparse nel codice.
2. **Chi siamo / località.** Blocchi segnaposto, stessa fonte.
3. **Catalogo.** È il cuore della pagina.
4. **Contatti.** Telefono, WhatsApp, email, indirizzo, orari. Sempre da `azienda.js`.

Il catalogo:

- Query: `select * from piante where visibile = true order by categoria, nome`.
- **Raggruppamento a fisarmonica per categoria** (il cliente lo ha chiesto esplicitamente: "menù a tendina fluido"). Ogni categoria è una sezione collassabile, con il conteggio delle piante a fianco. Prima categoria aperta di default, le altre chiuse. L'animazione di apertura deve essere fluida e rispettare `prefers-reduced-motion`.
- Dentro ogni categoria, griglia di card responsive: 1 colonna su mobile, 2 su tablet, 3 su desktop.
- Card: foto grande in alto (`aspect-[4/3]`, `object-cover`, `loading="lazy"`), nome botanico in evidenza, vaso in un badge, poi i dati tecnici (tipologia, peso, pz per pianale, pz per carrello, disponibilità carrelli), prezzo in fondo ben leggibile, pulsante "Ordina su WhatsApp".
- Il pulsante WhatsApp apre `https://wa.me/<numero>?text=...` con un messaggio precompilato che contiene nome della pianta e vaso.
- **Barra di ricerca** in cima al catalogo che filtra per nome mentre si scrive, e apre automaticamente le categorie che contengono risultati.
- Filtro rapido per diametro vaso (chip cliccabili).
- Click sulla foto: lightbox a schermo intero.
- Stato vuoto e stato di caricamento con skeleton, non uno spinner nudo.

### 4. Pannello `/admin`

Progettato **mobile-first**, non desktop-first ridotto. L'utente lo userà in serra col telefono in una mano.

Elenco:
- Lista di righe compatte: miniatura, nome, vaso, prezzo, disponibilità.
- Ricerca in cima.
- Su ogni riga tre azioni, tutte con area di tocco minima 44×44 px:
  - **icona occhio** — toggle `visibile` con un solo tap, aggiornamento ottimistico dello stato locale e rollback in caso di errore. Occhio pieno = pubblicata, occhio barrato + riga sbiadita = nascosta.
  - **matita** — modifica
  - **cestino** — elimina, con conferma esplicita che nomina la pianta ("Vuoi eliminare Crassula ovata? L'operazione non si annulla."), e che cancella anche il file dallo Storage usando `foto_path`.
- Pulsante "Aggiungi pianta" fisso e sempre raggiungibile.
- In cima un riepilogo: quante piante in totale, quante pubblicate, quante nascoste.

Form nuova/modifica:
- Un campo per riga, etichette in italiano parlato, non nomi di colonna: "Nome della pianta", "Diametro vaso (cm)", "Pezzi per pianale", "Pezzi per carrello", "Carrelli disponibili", "Prezzo (€)", "Peso (kg)", "Tipologia", "Descrizione", "Note".
- Categoria: menu a tendina che si popola con le categorie già esistenti nel database, più la possibilità di scriverne una nuova. Così le categorie non si frammentano in venti varianti scritte male.
- Foto: `<input type="file" accept="image/*" capture="environment">` così su mobile si apre direttamente la fotocamera. Al momento della scelta: anteprima immediata, compressione lato client con `browser-image-compression` (max 1600 px sul lato lungo, max ~800 KB), upload su Supabase Storage nel bucket `foto-piante`, salvataggio di `foto_url` (public URL) e `foto_path` (path interno). Barra di avanzamento durante l'upload. L'utente non deve mai vedere un URL né ridimensionare niente a mano.
- In modifica, se si carica una nuova foto, cancella la vecchia dallo Storage.
- Solo `nome` e `prezzo` sono obbligatori. Tutto il resto può restare vuoto: il cliente inserisce le piante di corsa e completa dopo.
- Salvataggio con toast di conferma esplicito ("Crassula ovata salvata") e ritorno all'elenco.
- Gestione errori leggibile: mai `error.message` grezzo di Postgres a schermo, ma un messaggio che dice cosa fare.

### 5. Login

Pagina minimale: email, password, un pulsante "Entra". Nessun link "registrati", nessun social login: l'account è uno solo e lo creo io dalla dashboard Supabase. Errore credenziali in italiano. Dopo il login, redirect a `/admin`. Nel pannello, un pulsante "Esci" visibile.

### 6. Deploy

- `public/_redirects` con `/*  /index.html  200` (senza, le rotte React su Netlify danno 404 al refresh).
- `netlify.toml` con build command e publish dir.
- `.gitignore` che escluda `.env` e `node_modules`.
- `README.md` con: come far partire il progetto in locale, quali variabili d'ambiente servono, come rifare il deploy.

## Direzione visiva

Non voglio il layout SaaS generico. Il soggetto sono piante vendute a peso e a carrello: è un mestiere concreto, agricolo, all'ingrosso. Il design deve sembrare fatto per un vivaio, non per una startup.

- Palette costruita su verdi profondi e naturali con un neutro caldo di terracotta o terra, non il solito grigio-blu. Evita il cream `#F4F1EA` con accento terracotta `#D97757`: è il default che genera qualunque modello.
- Una famiglia tipografica, due al massimo e chiaramente distinte. Non usare Inter come display.
- La foto della pianta è l'elemento più importante di ogni card: dalle spazio, tutto il resto sta zitto intorno.
- I dati tecnici (pianale, carrello, disponibilità) sono l'informazione che fa comprare: devono essere scansionabili a colpo d'occhio, allineati, con la stessa struttura su ogni card.
- Niente ombre uguali su ogni cosa, niente eyebrow in maiuscoletto sopra ogni titolo, niente animazioni di entrata su ogni sezione.
- Il prezzo all'ingrosso ha un peso commerciale: rendilo leggibile ma non urlato, questo non è un e-commerce al dettaglio.
- Accessibile: focus da tastiera visibile, contrasto sufficiente, alt text sulle foto col nome della pianta.

## Criteri di accettazione

Prima di dirmi che hai finito, verifica che:

1. `npm run dev` parte senza errori e senza warning in console.
2. La home mostra le 10 piante visibili raggruppate per categoria, e **non** mostra le 2 nascoste.
3. Aprendo `/admin` da sloggato vengo mandato a `/login`.
4. Dopo il login vedo tutte e 12 le piante, comprese le nascoste.
5. Il tap sull'occhio cambia la visibilità e, ricaricando la home, la pianta compare o sparisce davvero.
6. Creo una pianta nuova con una foto caricata dal file system: la foto finisce nel bucket e compare in home.
7. Elimino una pianta: sparisce dal database e il file sparisce dallo Storage.
8. A 375 px di larghezza tutto è leggibile e cliccabile, e nessuna riga sfora in orizzontale.
9. `npm run build` completa senza errori.

## Come lavorare

Spiegami cosa stai facendo mentre procedi, in italiano. Se una scelta è ambigua, prendi la decisione più semplice da usare per una persona non tecnica e dimmi cosa hai scelto. Non generare 200 piante finte: 12 bastano per provare tutto.
