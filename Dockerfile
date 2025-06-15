FROM python:3.12-slim as backend

WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# ==== Frontend ====
FROM node:20 as frontend

WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# ==== Production image ====
FROM nginx:alpine

# Копируем собранный фронтенд
COPY --from=frontend /app/frontend/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Копируем backend-приложение (Flask) в отдельную папку
COPY --from=backend /app/backend /app/backend

# Устанавливаем переменные окружения для backend
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV YANDEX_MAPS_API_KEY="your_api_key_here"

# Открываем порты
EXPOSE 80
EXPOSE 5000

# Указываем команду запуска backend через gunicorn
CMD ["sh", "-c", "gunicorn --chdir /app/backend -b 0.0.0.0:5000 app:app & nginx -g 'daemon off;'"]
