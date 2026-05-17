from fastapi.testclient import TestClient
import pytest
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from sqlalchemy.orm import sessionmaker
import os
import sys

# Ensure the backend package is importable when pytest is run from the backend folder
# conftest.py is in backend/tests, so add backend/ (parent) to sys.path
here = os.path.dirname(__file__)
backend_dir = os.path.abspath(os.path.join(here, '..'))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

# mark testing mode so app.main will skip seeding/creating production DB objects
os.environ['TESTING'] = '1'

# import the FastAPI app and DB models
from app.main import app
from app.core import database as real_database
from app.models import Base, Employee, Tour
from app.crud.security import safe_hash
from app.routers.auth import create_access_token


# Create a fresh in-memory SQLite database for tests (shared across threads)
TEST_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope='session', autouse=True)
def prepare_database():
    # create tables
    Base.metadata.create_all(bind=engine)
    yield
    # drop all if desired
    Base.metadata.drop_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# override the dependency in the FastAPI app
app.dependency_overrides[real_database.get_db] = override_get_db


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def db_session():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture()
def leader_token(db_session):
    # create a leader user and return a JWT token
    leader = db_session.query(Employee).filter(Employee.email == 'leader@test').first()
    if not leader:
        leader = Employee(name='Test Leader', email='leader@test', phone='+70000000000', password=safe_hash('leaderpw'), role='leader')
        db_session.add(leader)
        db_session.commit()
        db_session.refresh(leader)
    token = create_access_token({'sub': str(leader.id), 'role': leader.role})
    return token


@pytest.fixture()
def manager_token(db_session):
    mgr = db_session.query(Employee).filter(Employee.email == 'mgr@test').first()
    if not mgr:
        mgr = Employee(name='Test Manager', email='mgr@test', phone='+70000000001', password=safe_hash('mgrpw'), role='manager')
        db_session.add(mgr)
        db_session.commit()
        db_session.refresh(mgr)
    token = create_access_token({'sub': str(mgr.id), 'role': mgr.role})
    return token





