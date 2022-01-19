#!/bin/bash

cp ../package.json ../yarn.lock ./
docker build -t sbanken-ynab .
rm package.json yarn.lock