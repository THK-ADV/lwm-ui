FROM node:16.18.1-alpine3.17 as node
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build:production

FROM nginx:stable-alpine
COPY --from=node /app/dist/lwm-ui /usr/share/nginx/html
RUN mkdir /usr/share/nginx/html/public
