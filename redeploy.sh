#!/bin/sh
set -ex

#nginx
#git pull origin main

cp hack/compose-template.yml docker-compose-prod.yml

COMMIT_SHA=$(git rev-parse HEAD)
sed -i "s/\${IMAGE_TAG}/$COMMIT_SHA/g" docker-compose-prod.yml


docker compose -f docker-compose-prod.yml down && docker compose -f docker-compose-prod.yml pull &&  docker compose -f docker-compose-prod.yml up -d 
