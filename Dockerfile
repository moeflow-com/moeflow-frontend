FROM node:16.17.0 AS builder
COPY . /app
WORKDIR /app
RUN yarn install
RUN yarn run build

FROM nginx:1
COPY --from=builder /app/build /build
