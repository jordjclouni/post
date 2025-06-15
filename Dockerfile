# Сборка фронтенда
FROM node:20 AS build-frontend
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

# Сборка бэкенда
FROM python:3.12-slim AS build-backend
RUN useradd -m appuser
WORKDIR /app/backend
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
RUN chown appuser:appuser /app
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV YANDEX_MAPS_API_KEY="6ad7e365-54e3-4482-81b5-bd65125aafbf"

# Финальный образ с Nginx и бэкендом
FROM nginx:alpine
# Копируем собранный фронтенд
COPY --from=build-frontend /app/frontend/dist /usr/share/nginx/html
# Копируем бэкенд
COPY --from=build-backend /app/backend /app/backend
# Копируем конфигурацию Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Устанавливаем зависимости для запуска Python (например, gunicorn)
RUN apk add --no-cache python3 py3-pip
RUN pip install --no-cache-dir gunicorn

# Настраиваем пользователя и права
RUN chown -R appuser:appuser /app/backend
USER appuser

# Открываем порты
EXPOSE 80 5000

# Запуск Nginx и Flask через gunicorn
CMD sh -c "gunicorn --bind 0.0.0.0:5000 app:app & nginx -g 'daemon off;'"