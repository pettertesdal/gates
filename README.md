# Introduksjon
Dette er vårt prosjekt i forbindelse med faget DAT191 og den tilhørende bacheloroppgave. Ved sensur anbefales det at vercel (se link i systemdokumentasjonen) tas i bruk for å benytte seg av den tilhørende databasen gruppen har brukt underveis i utviklingen, men om dette ikke skulle være gjennomførbart kan gruppen kontaktes for å få tak i dens .env variabler. 

Når de korrekte avhengigheter er innstallert kjøres applikasjonen ved kommando npm run dev.



# Docker-basert utviklingsmiljø

Prosjektet kan nå kjøres lokalt med Docker og Docker Compose. Dette starter både applikasjonen og en SQL Server-instans med en ferdig konfigurert database. Compose bygger en lokal SQL Server-avbildning som inkluderer `sqlcmd`, siden det ikke lenger leveres i den offisielle `mcr.microsoft.com/mssql/server:2022-latest`-avbildningen.

1. Kopier `.env.example` til `.env` og juster eventuelle variabler ved behov.
2. Start miljøet med:

   ```bash
   docker compose up --build
   ```

   Tjenesten er tilgjengelig på [http://localhost:3000](http://localhost:3000) når byggingen er ferdig.

Compose-oppsettet oppretter databasen `gates` med brukeren `gates_user`. Miljøvariablene `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASS` og `DB_PORT` brukes av Nuxt-applikasjonen for å koble til databasen. Standardverdiene fungerer direkte mot Docker Compose-konfigurasjonen.



# Nuxt 3 Minimal Starter

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install the dependencies:

```bash
# Dette er vårt prosjekt i forbindelse med faget DAT191 og den tilhørende bacheloroppgave. Ved sensur anbefales det at vercel (se link i systemdokumentasjonen) tas i bruk for å benytte seg av den tilhørende databasen gruppen har brukt underveis i utviklingen, men om dette ikke skulle være gjennomførbart kan gruppen kontaktes for å få tak i dens .env variabler. 
# Når de korrekte avhengigheter er innstallert kjøres applikasjonen ved kommando npm run dev.

# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm run dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm run build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm run preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
# XT-Gates
