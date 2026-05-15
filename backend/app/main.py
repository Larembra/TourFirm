from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, SessionLocal
from . import models
from .routers import router as api_router


# create tables
models.Base.metadata.create_all(bind=engine)


def seed_data():
    """Заполнить БД тестовыми данными (по 3 записи). Выполняется только если таблицы пусты."""
    db = SessionLocal()
    try:

        if not db.query(models.Manager).first():
            mgrs = [
                models.Manager(name='Иван Иванов', email='ivan@example.com', phone='+70001112233', password='pass1'),
                models.Manager(name='Мария Петрова', email='maria@example.com', phone='+70002223344', password='pass2'),
                models.Manager(name='Алексей Сидоров', email='alex@example.com', phone='+70003334455', password='pass3'),
            ]
            db.add_all(mgrs)


        if not db.query(models.Client).first():
            clients = [
                models.Client(name='Пётр Смирнов', city='Москва', phone='+79001234567', email='petr@example.com', discount_percent=5),
                models.Client(name='Ольга Кузнецова', city='Санкт-Петербург', phone='+79007654321', email='olga@example.com', discount_percent=10),
                models.Client(name='Николай Орлов', city='Казань', phone='+79009876543', email='nikolay@example.com', discount_percent=0),
            ]
            db.add_all(clients)


        if not db.query(models.Tour).first():
            tours = [
                models.Tour(city='Сочи', title='Пляжный отдых в Сочи', price=25000, start_date='2026-06-01', end_date='2026-06-08', description='Отдых у моря', seats=20),
                models.Tour(city='Крым', title='Экскурсионный тур по Крыму', price=18000, start_date='2026-07-10', end_date='2026-07-17', description='Достопримечательности Крыма', seats=15),
                models.Tour(city='Алтай', title='Горный тур на Алтай', price=30000, start_date='2026-08-05', end_date='2026-08-12', description='Походы и природа', seats=10),
            ]
            db.add_all(tours)


        db.commit()


        if not db.query(models.Sale).first():

            tours_db = db.query(models.Tour).limit(3).all()
            clients_db = db.query(models.Client).limit(3).all()
            sales = []
            for i in range(min(len(tours_db), len(clients_db))):
                sales.append(models.Sale(tour_id=tours_db[i].id, client_id=clients_db[i].id, quantity=1 + i))
            if sales:
                db.add_all(sales)
                db.commit()

    finally:
        db.close()


app = FastAPI(title='Tourfirm API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event('startup')
def on_startup():

    try:
        seed_data()
    except Exception:

        pass


@app.get('/')
def root():
    return {'status': 'ok'}


app.include_router(api_router, prefix='/api')

