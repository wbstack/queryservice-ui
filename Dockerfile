FROM node:20 as builder

WORKDIR /src/app

COPY package.json package-lock.json ./

RUN npm install -g npm@latest

# TODO remove the --force from the install...
RUN npm install --force && npm update && npm cache clean --force

COPY . .

RUN npm run-script build


FROM nginx:1-alpine
LABEL org.opencontainers.image.source="https://github.com/wbstack/queryservice-ui"


COPY ./docker/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /src/app/build /usr/share/nginx/html
