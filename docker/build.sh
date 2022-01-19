#!/bin/bash

# Copy nescecary files from  parent folder
mkdir ./tmp/
cp -r ../. ./tmp/

# Build docker image
docker build --no-cache -t sbanken-ynab .

# Remove temp files
rm -rf ./tmp