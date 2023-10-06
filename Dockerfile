FROM node:16.17.0 AS builder
# NOTE Dockerfile只用来打包 (否则给多个arch构建镜像会更慢)
# `docker build` 前应先执行 `yarn build` .
COPY . /app

#######

FROM nginx:1
COPY --from=builder /app/build /build
