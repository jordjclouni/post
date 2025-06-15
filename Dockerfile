# Сборка React-фронтенда
FROM node:20 AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install --legacy-peer-deps
COPY frontend/ .
RUN npm run build || { echo "Build failed. Node version: $(node -v), NPM version: $(npm -v)"; exit 1; }

# Сборка backend (Flask)
FROM python:3.12-slim AS backend
WORKDIR /app
COPY backend/requirements.txt .
# Создаем виртуальную среду для обхода externally-managed-environment
RUN python3 -m venv /app/venv
RUN /app/venv/bin/pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Копируем сборку фронтенда во Flask-папку
COPY --from=frontend-build /app/frontend/dist /app/static

# Настройки Flask
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV YANDEX_MAPS_API_KEY="6ad7e365-54e3-4482-81b5-bd65125aafbf"
ENV PATH="/app/venv/bin:$PATH"

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]