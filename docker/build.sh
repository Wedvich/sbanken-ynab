#!/bin/bash

# Copy nescecary files from  parent folder
mkdir ./tmp/
rsync -av ../. ./tmp/ --exclude docker

# Build docker image
docker build --no-cache -t sbanken-ynab .

# Remove temp files
rm -rf ./tmp