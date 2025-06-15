# Сборка React-фронтенда
FROM node:20 as frontend-build
WORKDIR /frontend
COPY frontend/package.json frontend/package-lock.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Сборка backend (Flask)
FROM python:3.12-slim as backend
WORKDIR /app
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .

# Копируем сборку фронтенда во Flask-папку
COPY --from=frontend-build /frontend/dist /app/static

# Настройки Flask
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV YANDEX_MAPS_API_KEY="6ad7e365-54e3-4482-81b5-bd65125aafbf"

EXPOSE 5000

CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
