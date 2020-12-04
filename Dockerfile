FROM node:12 as builder

WORKDIR /src/app

COPY package.json package-lock.json ./

# TODO remove the --force from the install...
RUN npm install --force && npm cache clean --force

COPY . .

RUN npm run-script build


FROM nginx:1-alpine

ADD ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder --chown=nginx:nginx /src/app/build /usr/share/nginx/html
