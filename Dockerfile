# ==== BACKEND BUILD ====
FROM python:3.12-slim AS backend

WORKDIR /app/backend

# Копируем backend зависимости и устанавливаем
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь backend код
COPY backend/ .

# ==== FRONTEND BUILD ====
FROM node:20 AS frontend

WORKDIR /app/frontend

# Копируем frontend зависимости
COPY frontend/package*.json ./
RUN npm install

# Копируем остальной фронтенд
COPY frontend/ .

# Билдим React приложение
RUN npm run build

# ==== FINAL IMAGE ====
FROM python:3.12-slim

# Устанавливаем nginx
RUN apt-get update && apt-get install -y nginx && rm -rf /var/lib/apt/lists/*

# Копируем backend
WORKDIR /app
COPY --from=backend /app/backend /app

# Копируем frontend билд в директорию nginx
COPY --from=frontend /app/frontend/dist /var/www/html

# Копируем nginx конфиг
COPY nginx.conf /etc/nginx/sites-enabled/default

# Экспонируем порты
EXPOSE 80 5000

# Переменные окружения
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0

# Запускаем и backend, и nginx
CMD service nginx start && gunicorn --bind 0.0.0.0:5000 app:app
