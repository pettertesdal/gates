# Gates

Gates is a Nuxt 3 application backed by a Microsoft SQL Server database.  The repository contains everything you need to run the
application locally with Docker, build production images, and deploy them to a remote server.

## Prerequisites

* Node.js 20.x (only required for running outside Docker)
* npm 9+
* Docker and Docker Compose v2

## 1. Configure environment variables

Copy the example file and adjust it to your needs:

```bash
cp .env.example .env
```

Key variables:

| Variable | Description |
| --- | --- |
| `DB_SERVER`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASS` | Connection settings used by the Nuxt server to talk to SQL Server. |
| `SA_PASSWORD` | Strong password for the `sa` administrator account used when provisioning SQL Server via Docker Compose. |
| `NUXT_TOKEN_SECRET`, `NUXT_TOKEN_EXPIRATION` | Secrets for signing and expiring JSON Web Tokens. |
| `APP_IMAGE`, `SQL_IMAGE` | Optional. Overrides that point to pre-built container images when using the `prod` compose profile. |

## 2. Run the stack with Docker Compose

The quickest way to get a fully working environment is to use Docker Compose.  The stack includes:

* `app-demo`: Nuxt development server with hot reload.
* `db-demo`: SQL Server Express instance built from `docker/sqlserver/Dockerfile` and seeded with schema and sample data from
  `docker/sqlserver/init.sql`.
* `db-init-demo`: One-shot container that applies the SQL script once the database is reachable.

Start everything:

```bash
docker compose --profile demo up --build
```

The Nuxt application becomes available at [http://localhost:3000](http://localhost:3000).  Database data files are stored in the
`mssql-data-demo` named volume so that restarts keep your data.

### Production-like profile

When you have published container images (see the deployment workflow below), you can run the same stack with the `prod` profile:

```bash
docker compose --profile prod up -d
```

For this to work you must define `APP_IMAGE` and `SQL_IMAGE` (for example in `.env`) so Compose knows which images to pull.

Both profiles expose the same environment variables to the Nuxt server, so the application connects to the correct SQL Server
instance without any code changes.

## 3. Developing without Docker

If you prefer running everything locally, make sure SQL Server is available and that the credentials in your `.env` file point to
it.  Then install dependencies and start the Nuxt dev server:

```bash
npm install
npm run dev
```

## 4. Database layout and seed data

`docker/sqlserver/init.sql` provisions the `gates` database, schemas, stored procedures, and seed data expected by the
application.  It creates the `gates_user` login, assigns it to the `db_owner` schema, and populates tables such as `validUsers`,
`user_roles`, `user_teams`, and `admin_pass`.  Three default users are available after bootstrapping:

| Username | Role | Notes |
| --- | --- | --- |
| `user` | Standard user | Password not required. |
| `admin` | Administrator | Password `admin`. |
| `superadmin` | Super administrator | Password `superadmin`. |

Feel free to change these credentials in the SQL script if you need other defaults.

## 5. CI/CD with GitHub Actions

`.github/workflows/deploy.yml` builds and publishes two images whenever `main` is updated:

1. `ghcr.io/<owner>/gates-app` – the production Nuxt image built from the multi-stage `Dockerfile`.
2. `ghcr.io/<owner>/gates-sqlserver` – the SQL Server image including the command-line tools required by the init container.

If the repository secrets `VPS_HOST`, `VPS_USER`, and `SSH_PRIVATE_KEY` are configured, the workflow also SSHes into your server,
changes to `~/docker/gates`, pulls the freshly built images, and restarts the stack with `docker compose --profile prod up -d
--remove-orphans`.

## 6. Deploying manually on a server

1. Copy the repository (or at least `docker-compose.yml` and the `docker/` directory) to the server, e.g. to `~/docker/gates`.
2. Provide a `.env` file with the production values for secrets and database credentials.
3. Run `docker compose --profile prod pull` followed by `docker compose --profile prod up -d`.

The same compose file used locally works in production, ensuring parity between environments.
