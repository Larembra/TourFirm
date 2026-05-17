# Тесты для backend-приложения (FastAPI)

Этот документ описывает, как запускать и расширять тесты для backend-части проекта.

Требования
- Python 3.10/3.11 (совместимо с зависимостями в `requirements.txt`)
- Рекомендуется виртуальное окружение (venv)

Быстрый запуск (PowerShell)

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
pytest -q
```

Запуск одного теста

```powershell
pytest tests/test_auth.py::test_login_with_existing_user -q
```

Запуск по ключевому слову (например, все тесты про tours)

```powershell
pytest -k tours -q
```

Что находится в наборе тестов
- `conftest.py` — общие фикстуры для тестов:
  - настраивает in-memory SQLite (sqlite:///:memory:) с `StaticPool`, чтобы TestClient и фикстуры видели одну и ту же БД в памяти;
  - устанавливает переменную окружения `TESTING=1` (чтобы приложение не выполняло автоматическое заполнение/миграции при импорте);
  - переопределяет зависимость `get_db` на фикстурную сессию;
  - предоставляет фикстуры `client`, `db_session`, `leader_token`, `manager_token`.
- `test_auth.py` — проверка логина/получения JWT и неуспешных попыток;
- `test_tours.py` — проверка CRUD путёвок и прав доступа (leader vs manager);
- `test_employees.py` — создание сотрудника (через защищённый endpoint), загрузка фото профиля, смена пароля;
- `test_services.py` — создание услуги, привязка/отвязка услуги к путёвке;
- `test_sales.py` — создание продажи.

Особенности реализации тестовой среды
- В памяти создаётся вся схема через `Base.metadata.create_all(bind=engine)` в фикстуре `prepare_database` — это изолированная тестовая схема и не затрагивает вашу реальную БД.
- Тесты используют JWT- токены, созданные функцией `create_access_token` из приложения, чтобы проверять авторизацию через `Authorization: Bearer <token>`.
- Для загрузки файлов тесты передают небольшой байтовый буфер (фейковое изображение); файлы сохраняются в `backend/static/uploads`. Тесты не удаляют эти файлы — при необходимости добавьте очистку в фикстуры.

