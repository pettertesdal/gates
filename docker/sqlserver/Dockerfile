FROM mcr.microsoft.com/mssql-tools AS tools

FROM mcr.microsoft.com/azure-sql-edge:latest

USER root

COPY --from=tools /opt/mssql-tools /opt/mssql-tools
RUN set -eux; \
    ln -s /opt/mssql-tools/bin/sqlcmd /usr/local/bin/sqlcmd; \
    ln -s /opt/mssql-tools/bin/bcp /usr/local/bin/bcp

ENV PATH=/opt/mssql-tools/bin:$PATH

USER mssql
