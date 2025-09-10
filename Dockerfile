FROM node:22.13.0-alpine3.21 as node
WORKDIR /app
COPY . .
RUN npm install --legacy-peer-deps
RUN npm run prod

FROM nginx:1.27.3-alpine3.20
COPY --from=node /app/dist/lwm-ui /usr/share/nginx/html
RUN mkdir /usr/share/nginx/html/public
