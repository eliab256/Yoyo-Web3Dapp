# syntax = docker/dockerfile:1.6
FROM ghcr.io/joshstevens19/rindexer:latest AS rindexer

USER root
RUN apt-get update && \
    apt-get install -y lsof net-tools procps && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ARG PROJECT_PATH="./rindexer"

WORKDIR /usr/src/app

COPY ${PROJECT_PATH} /usr/src/app/rindexer-app

ARG PORT="3001"
ENV PORT=${PORT}

EXPOSE ${PORT}

ENTRYPOINT ["/app/rindexer"]
CMD ["start", "-p", "./rindexer-app", "all"]
