Backend (FastAPI) для приложения Tourfirm

Кратко:
- API реализован в `backend/app/routers` и предоставляет CRUD для сотрудников, клиентов, путёвок, услуг и продаж.
- Статические файлы (загруженные фотографии) хранятся в `backend/static/uploads` и доступны по пути `/static/uploads/...`.

Запуск (локально):

1. Создайте виртуальное окружение и установите зависимости:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Создайте `backend/.env` с параметрами подключения к БД (пример):

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Tourfirm
DB_USER=postgres
DB_PASS=postgres
# или DATABASE_URL=postgresql://user:pass@host:port/dbname
```

3. Запустите приложение:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Основные endpoints (не полный список):
- GET /api/auth/login — вход и получение JWT
- GET /api/employees, POST /api/employees/protected — управление сотрудниками (только для leader)
- GET /api/clients, POST /api/clients — клиенты
- GET /api/tours, POST /api/tours, PUT /api/tours/{id}, DELETE /api/tours/{id} — путёвки
- POST /api/tours/{tour_id}/images — загрузка изображения путёвки (leader)
- GET /api/services, POST /api/services — услуги
- GET /api/sales, POST /api/sales — продажи

Документация API доступна по /docs после запуска.

