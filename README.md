# Onboarding Tracker

StayVista's property onboarding tracker — acquisition through go-live and launch, built with Next.js, Postgres and the StayVista brand (Cambria/Larken + Inter, Warm Black / SV-Bloom / SV-Shine / SV-Sky).

## One-time setup after this is deployed on Vercel

### 1. Database (required)

The app needs a Postgres database to store properties.

1. Open the project on vercel.com → **Storage** tab → **Create Database** → **Postgres**.
2. Follow the prompts and connect it to this project. Vercel sets the `DATABASE_URL` (or `POSTGRES_URL`) environment variable automatically.
3. Redeploy (Vercel usually does this for you after linking storage).

Without this, the app loads but every save will show an error.

### 2. Google Sheets auto-sync (optional)

There is no export button — instead, every time a property is created, edited, or deleted, the backend automatically clears and rewrites a tab named **Onboarding Tracker** in a Google Sheet you control, so the sheet is always current. It needs three environment variables; without them, the sync is silently skipped and everything else keeps working.

1. In [Google Cloud Console](https://console.cloud.google.com/), create a project (or reuse one) and enable the **Google Sheets API**.
2. Create a **Service Account** (IAM & Admin → Service Accounts), then create a JSON key for it and download it.
3. Create a new Google Sheet (or use an existing one) and **share it** with the service account's email address (found in the JSON key as `client_email`) as an **Editor**.
4. In Vercel's project → **Settings → Environment Variables**, add:
   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` — the `client_email` from the JSON key.
   - `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY` — the `private_key` from the JSON key, pasted as-is (keep the `\n` sequences — paste the whole string on one line).
   - `GOOGLE_SHEET_ID` — the long ID in the sheet's URL: `docs.google.com/spreadsheets/d/`**`THIS_PART`**`/edit`.
5. Redeploy.

From then on, saving any property anywhere in the app updates the sheet within a couple of seconds — nobody has to remember to export.

## Brand

Colors and type pairing come from StayVista's brand guidelines (`app/globals.css`):

| Token | Hex |
|---|---|
| Warm Black | `#1E1E1E` |
| Warm White | `#FAF7F2` |
| Cool White | `#FFFFFF` |
| SV-Bloom | `#E9A0A7` |
| SV-Shine | `#FDD5A9` |
| SV-Sky | `#9CCDFB` |

Headlines are set in the brand's headline serif, **Larken** — that's a licensed font, so this build falls back to **Cambria** (the same fallback the brand guideline itself lists) until Larken's font files are added. To use the real Larken: drop its `.woff2` files into `public/fonts/` and add an `@font-face` rule at the top of `app/globals.css` pointing `--font-display` at it. Body text and UI use **Inter**, loaded free from Google Fonts, exactly as the brand guideline specifies.

## Local development

```bash
npm install
cp .env.example .env.local   # fill in DATABASE_URL at minimum
npm run dev
```
