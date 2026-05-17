import os
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import urllib.parse

# Попытка загрузить .env из папки backend (расположение: backend/.env)
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env')
load_dotenv(env_path)

# Поддерживаем как единый DATABASE_URL, так и отдельные переменные DB_*
DATABASE_URL = os.environ.get('DATABASE_URL')
if not DATABASE_URL:
    db_user = os.environ.get('DB_USER', 'postgres')
    db_pass = os.environ.get('DB_PASS', 'postgres')
    db_name = os.environ.get('DB_NAME', 'Tourfirm')
    db_host = os.environ.get('DB_HOST', 'localhost')
    db_port = os.environ.get('DB_PORT', '5432')
    # на всякий случай экранируем user/pass
    db_user_esc = urllib.parse.quote_plus(db_user)
    db_pass_esc = urllib.parse.quote_plus(db_pass)
    DATABASE_URL = f"postgresql://{db_user_esc}:{db_pass_esc}@{db_host}:{db_port}/{db_name}"

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

