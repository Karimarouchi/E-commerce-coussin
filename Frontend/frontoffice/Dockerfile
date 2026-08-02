FROM node:20 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG VITE_API_BASE_URL=http://187.127.94.149:8080/api/v1
ARG VITE_BACKOFFICE_URL=http://187.127.94.149:3000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_BACKOFFICE_URL=$VITE_BACKOFFICE_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
