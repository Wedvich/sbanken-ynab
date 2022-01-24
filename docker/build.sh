#!/bin/bash

# Copy nescecary files from  parent folder
mkdir ./tmp/
rsync -av ../. ./tmp/ --exclude docker

# Build docker image
docker build --no-cache -t sbanken-ynab .

# Remove intermediate builder image
docker image prune --filter label=stage=builder

# Remove temp files
rm -rf ./tmp