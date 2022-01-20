# Based on https://rsbh.dev/blog/dockerize-react-app
FROM node:17 AS builder
LABEL stage=builder
WORKDIR /app
COPY tmp/ ./ 
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginx:1.21-alpine AS server
COPY --from=builder ./app/wwwroot /usr/share/nginx/html