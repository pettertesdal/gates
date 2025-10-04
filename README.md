# Introduksjon
Dette er vårt prosjekt i forbindelse med faget DAT191 og den tilhørende bacheloroppgave. Ved sensur anbefales det at vercel (se link i systemdokumentasjonen) tas i bruk for å benytte seg av den tilhørende databasen gruppen har brukt underveis i utviklingen, men om dette ikke skulle være gjennomførbart kan gruppen kontaktes for å få tak i dens .env variabler. 

Når de korrekte avhengigheter er innstallert kjøres applikasjonen ved kommando npm run dev.



# Docker-basert utviklingsmiljø

Prosjektet kan nå kjøres lokalt med Docker og Docker Compose. Dette starter både applikasjonen og en SQL Server-instans med en ferdig konfigurert database. Compose tilbyr to profiler slik at du kan velge mellom et lokalt "demo"-oppsett (bygger containerne fra kildekoden din) og et "prod"-oppsett som trekker ferdigbygde avbildninger fra GitHub Container Registry (GHCR).

1. Kopier `.env.example` til `.env` og juster eventuelle variabler ved behov.
2. Kjør én av profilene:

   - Lokal demo med live-reload og lokalt bygde bilder:

     ```bash
     docker compose --profile demo up --build
     ```

   - Produksjonslignende kjøring med bilder fra GHCR (krever at `APP_IMAGE` og `SQL_IMAGE` er satt i `.env`):

     ```bash
     docker compose --profile prod up -d
     ```

   Begge variantene eksponerer applikasjonen på [http://localhost:3000](http://localhost:3000).

Compose-oppsettet oppretter databasen `gates` med brukeren `gates_user`. Miljøvariablene `DB_SERVER`, `DB_NAME`, `DB_USER`, `DB_PASS` og `DB_PORT` brukes av Nuxt-applikasjonen for å koble til databasen. Profilene setter automatisk riktig `DB_SERVER`-verdi (hhv. `db-demo` og `db-prod`).

For `prod`-profilen må du angi hvilke containere som skal hentes fra GHCR:

```env
APP_IMAGE=ghcr.io/<eier>/gates-app:latest
SQL_IMAGE=ghcr.io/<eier>/gates-sqlserver:latest
```

Disse variablene kan også peke til andre tagger (for eksempel commit-hashene workflowen publiserer).

For innlogging og sesjonshåndtering brukes JSON Web Tokens. Sett `NUXT_TOKEN_SECRET` til en valgfri streng for å signere tokenene og `NUXT_TOKEN_EXPIRATION` til ønsket gyldighetstid (for eksempel `12h`). Docker Compose-konfigurasjonen fyller inn sikre standardverdier dersom variablene ikke er definert.

Den medfølgende init-scriptet oppretter nødvendige tabeller, visninger og prosedyrer som applikasjonen forventer (bl.a. `validUsers`, `user_teams`, `user_roles`, `projectModel`, `DuplicateProject` m.m.) og fyller dem med et minimum av testdata. Etter oppstart finnes tre forhåndsopprettede brukere:

| Rolle-ID | Brukernavn    | Passord        | Beskrivelse                |
|----------|---------------|----------------|----------------------------|
| 1        | `user`        | *(ikke nødvendig)* | Vanlig bruker uten passord |
| 2        | `admin`       | `admin`        | Administrator               |
| 3        | `superadmin`  | `superadmin`   | Superadministrator          |

Vanlige brukere identifiseres kun med brukernavn, mens administrator og superadministrator må oppgi passord ved innlogging.

## CI/CD og utrulling til VPS

Repositoryet inneholder en GitHub Actions-workflow (`.github/workflows/deploy.yml`) som bygger og publiserer Docker-avbildninger hver gang `main`-grenen oppdateres. Workflowen:

1. Logger inn mot GitHub Container Registry (GHCR) med `GITHUB_TOKEN`.
2. Bygger produksjonsvarianten av applikasjonsavbildningen (`ghcr.io/<eier>/gates-app`) og SQL Server-avbildningen (`ghcr.io/<eier>/gates-sqlserver`), tagget med både `latest` og commit-SHA.
3. Utfører en SSH-deploy til en VPS dersom hemmelighetene `VPS_HOST`, `VPS_USER` og `SSH_PRIVATE_KEY` er konfigurert. På serveren forventes et oppsett i `~/docker/gates` som kan oppdateres med `docker compose --profile prod pull` og `docker compose --profile prod up -d`.

### Nødvendige hemmeligheter

- `VPS_HOST`: IP eller hostname til serveren som skal oppdateres.
- `VPS_USER`: Brukeren workflowen skal logge inn som.
- `SSH_PRIVATE_KEY`: Privatnøkkel (typisk i PEM-format) for innlogging på serveren.

Dersom en eller flere av disse hemmelighetene ikke er satt, hoppes deploy-trinnet over, men containerne pushes fortsatt til GHCR slik at de kan hentes manuelt.



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
