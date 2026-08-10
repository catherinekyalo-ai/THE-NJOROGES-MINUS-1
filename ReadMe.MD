# Chama Ledger

A savings & loans ledger for a chama — track member contributions, interest, deductions, loan disbursements, and repayments, each with a running balance. Built with React, Vite, Tailwind, and Supabase.

## Setup

1. **Install dependencies**
   ```
   npm install
   ```

2. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com), sign up, and create a new project.
   - Open **SQL Editor > New query**, paste the contents of `supabase-schema.sql`, and click Run.
   - Go to **Project Settings > API** and copy your Project URL and anon public key.

3. **Configure environment variables**
   ```
   cp .env.example .env
   ```
   Then fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env`.

4. **Run it locally**
   ```
   npm run dev
   ```
   Open the URL it prints (usually http://localhost:5173).

## Deploying

Push this project to GitHub, then import it into [Vercel](https://vercel.com) or [Netlify](https://netlify.com). Add the same two environment variables in their dashboard (Project Settings > Environment Variables), and it will build and deploy automatically.

## Project structure

```
├── supabase-schema.sql       # Run this in Supabase's SQL editor
├── index.html
├── src/
│   ├── main.jsx               # App entry point
│   ├── App.jsx
│   ├── index.css              # Tailwind import
│   ├── ChamaLedger.jsx        # Main ledger UI
│   └── lib/
│       ├── supabaseClient.js  # Supabase connection
│       └── ledgerStore.js     # Data functions (load/add/delete members & entries)
```

## Notes

- The database policy in `supabase-schema.sql` is open by default (anyone with your anon key can read/write) — fine for a private link shared only with your chama. Ask if you'd like to add member logins with Supabase Auth later.
- Currency is formatted as KES; change the `fmt()` function in `ChamaLedger.jsx` if you use a different currency.