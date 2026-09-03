# Da dove si comincia

Cinque file, in ordine d'uso.

1. **docs/SETUP.md** — fallo per primo. Crea il progetto Supabase, lancia lo schema, crea l'account del cliente, collega Netlify.
2. **supabase/schema.sql** — da incollare nel SQL Editor di Supabase. Tabella, bucket foto, policy di sicurezza.
3. **AGENTS.md** — copialo nella root del progetto. Antigravity lo legge da solo a ogni richiesta e si ricorda il contesto senza che tu lo ripeta.
4. **PROMPT.md** — il prompt unico. Incolla il contenuto in un solo messaggio ad Antigravity dopo aver messo `AGENTS.md` e `supabase/schema.sql` nella root.
5. **docs/GUIDA_UTENTE.md** — da stampare e lasciare al tuo amico dopo che gli hai fatto vedere il pannello.

Extra: `scripts/importa-csv.mjs` e `scripts/piante-template.csv` per caricare le ~200 piante in blocco invece che a mano.
