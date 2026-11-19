FROM node:22-alpine AS build

WORKDIR /app/
COPY package.json yarn.lock /app/
RUN yarn

COPY . /app/
ENV prod=true
RUN yarn build

ENTRYPOINT node .output/server/index.mjs

