# Этап сборки
FROM node:20 AS build

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install
COPY . .

# Аргумент для API URL
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

# Сборка
RUN npm run build

# Этап запуска — nginx
FROM nginx:alpine

# Конфиг nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем собранное приложение
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
