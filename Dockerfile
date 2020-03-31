FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/lwm-ui /usr/share/nginx/html
