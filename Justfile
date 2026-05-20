install:
    npm install
    npx lefthook install

start:
    just postgres
    just run
    sleep 1
    open "http://localhost:3000/api/status"

run:
    tmux new-session -d -s "tv-api"
    tmux send-keys -t "tv-api" "npm run start:dev" ENTER

stop:
    docker stop tv-fr-postgres
    tmux kill-session -t tv-fr-api

tests:
    npm run test
    npm run test:e2e

biome:
    npm run biome

clean_db:
    docker exec -it tv-fr-postgres psql -U tvfr -d tvfr -c 'DROP SCHEMA public CASCADE; CREATE SCHEMA public;'

postgres:
    set -a && source .env && set +a && \
    docker run --rm -d \
        --name tv-fr-postgres \
        -e POSTGRES_USER=$DATABASE_USER \
        -e POSTGRES_PASSWORD=$DATABASE_PASSWORD \
        -e POSTGRES_DB=$DATABASE_NAME \
        -p $DATABASE_PORT:5432 \
        -v tv-fr-postgres-data:/var/lib/postgresql/data \
        postgres:17-alpine

