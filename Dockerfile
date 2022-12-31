FROM node:16.17.0

LABEL project="moeflow-frontend"

COPY . /app
WORKDIR /app

RUN yarn install
RUN yarn run build