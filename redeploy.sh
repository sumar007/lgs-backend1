#!/bin/sh
set -ex

#nginx
git pull origin main


COMMIT_SHA=$(git rev-parse HEAD)
sed -i "s/\${IMAGE_TAG}/$COMMIT_SHA/g" docker-compose.yml


docker compose down && docker compose pull &&  docker compose up -d 