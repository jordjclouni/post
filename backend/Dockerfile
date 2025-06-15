# backend/Dockerfile
FROM python:3.12-slim

RUN useradd -m appuser
WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .
RUN chown appuser:appuser /app

ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
# Используем лёгкий образ Python
FROM python:3.12-slim

# Создаём пользователя
RUN useradd -m appuser

# Рабочая директория внутри контейнера
WORKDIR /app

# Копируем зависимости и устанавливаем
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем всё остальное
COPY . .

# Меняем владельца
RUN chown -R appuser:appuser /app

# Настройки среды
ENV FLASK_APP=app.py
ENV FLASK_RUN_HOST=0.0.0.0
ENV YANDEX_MAPS_API_KEY="your-key"

# Открываем порт
EXPOSE 5000

# Переход под пользователя
USER appuser

# Запуск через gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]

EXPOSE 5000
USER appuser
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
