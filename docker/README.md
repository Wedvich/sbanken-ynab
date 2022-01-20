# Docker setup

## Prereq.
For å bygge og kjøre denne docker containeren, må du ha docker installert på maskinen (evt. buildah og podman, men er ikke testet med dette enda)

## Bygg
For å bygge imaget, trenger du bare å kjøre build.sh (i Linux).  
Dette vil først kopiere root-mappen inn i en tmp-mappe, og så bruke innholdet i den til å bygge container-imaget.  
Når den er bygget blir tmp-mappen og build-imaget slettet, og imaget vil ligge klart i docker lokalt.

## Kjør
Denne kommandoen vil kjøre containeren i docker på port 8080
```sh
docker run -p 8080:80 -d sbanken-ynab
```