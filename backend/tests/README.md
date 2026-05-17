Тесты для backend приложения (FastAPI)

Запуск (локально):

1. Создайте виртуальное окружение и установите зависимости из `requirements.txt` (в том числе pytest):

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

2. Запуск тестов:

```powershell
cd backend
pytest -q
```

Что делает набор тестов:
- `conftest.py` — подготавливает TestClient, переопределяет зависимость `get_db` на in-memory SQLite.
- `test_auth.py` — тесты для логина/авторизации.
- `test_tours.py` — проверка прав доступа при создании/редактировании путёвок (leader vs manager).

Советы:
- Тесты используют sqlite:///:memory: и не затрагивают вашу основную БД.
- Если тесты падают из-за несовместимости версии библиотек, обновите зависимости в `requirements.txt`.

