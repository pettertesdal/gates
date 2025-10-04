FROM mcr.microsoft.com/mssql/server:2022-latest

USER root

RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends curl gnupg2 ca-certificates; \
    curl https://packages.microsoft.com/keys/microsoft.asc | apt-key add -; \
    curl https://packages.microsoft.com/config/ubuntu/22.04/prod.list > /etc/apt/sources.list.d/mssql-release.list; \
    apt-get update; \
    ACCEPT_EULA=Y apt-get install -y --no-install-recommends msodbcsql18 mssql-tools18; \
    ln -s /opt/mssql-tools18/bin/sqlcmd /usr/local/bin/sqlcmd; \
    ln -s /opt/mssql-tools18/bin/bcp /usr/local/bin/bcp; \
    apt-get clean; \
    rm -rf /var/lib/apt/lists/*;

ENV PATH=/opt/mssql-tools18/bin:$PATH

USER mssql
