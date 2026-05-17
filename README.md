# Tourfirm — приложение для туристической фирмы

В этом репозитории находится простое демо-приложение для управления путёвками, клиентами и продажами.

Структура проекта:
- `backend/` — FastAPI приложение: модели (SQLAlchemy), CRUD, роутеры, статика, тесты.
- `frontend/` — React-приложение (Create React App) — интерфейс для сотрудников турфирмы.

Основные возможности:
- управление менеджерами и руководителем (JWT авторизация);
- CRUD для клиентов, путёвок, услуг и продаж;
- загрузка изображений путёвок и фото сотрудников (сохраняются в `backend/static/uploads`);
- базовый набор тестов для backend (pytest).

Быстрый старт — бэкенд
1. Перейдите в папку `backend`, создайте виртуальное окружение и установите зависимости:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Создайте `.env` в папке `backend` с параметрами подключения к БД (пример):

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=Tourfirm
DB_USER=postgres
DB_PASS=postgres
# или DATABASE_URL=postgresql://user:pass@host:port/dbname
```

3. Запустите сервер:

```powershell
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API и документация будут доступны на http://127.0.0.1:8000 и http://127.0.0.1:8000/docs

Быстрый старт — фронтенд
1. Перейдите в `frontend` и запустите dev-сервер:

```powershell
cd frontend
npm install
npm start
```

Фронтенд по умолчанию доступен на http://localhost:3000 и ожидает бэкенд на http://127.0.0.1:8000

Тесты
- Backend: `cd backend && pytest -q` — тесты используют in-memory SQLite и не трогают вашу основную БД.




