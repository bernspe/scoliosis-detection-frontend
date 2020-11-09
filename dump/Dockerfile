# build stage
FROM node:lts-alpine as build-stage
WORKDIR /app
COPY ../package.json ./
RUN npm install
COPY .. .
RUN npm run build

# production stage
FROM nginx as production-stage
COPY --from=build-stage /app/dist /usr/share/nginx/html
#COPY /app/data/cert /etc/nginx/cert
COPY --from=build-stage /app/data/nginx /etc/nginx/conf.d
EXPOSE 8001
CMD ["nginx", "-g", "daemon off;"]