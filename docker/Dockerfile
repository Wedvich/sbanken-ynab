# Based on https://rsbh.dev/blog/dockerize-react-app
FROM node:17-alpine AS builder
WORKDIR /app
COPY ../package.json ./
COPY ../yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginx:1.21-alpine AS server
COPY --from=builder ./app/build /usr/share/nginx/html