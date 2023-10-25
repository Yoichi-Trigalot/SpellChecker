FROM node:latest as base

EXPOSE 5000

FROM base as development
ENV NODE_ENV=development
RUN npm install
COPY . /

RUN npm run start


