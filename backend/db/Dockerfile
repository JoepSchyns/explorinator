FROM postgis/postgis:17-master

COPY init/*.sql /docker-entrypoint-initdb.d/

ENV POSTGRES_DB=explorinator
ENV POSTGRES_USER=postgres

EXPOSE 5432
