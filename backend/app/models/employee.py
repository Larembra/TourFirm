from sqlalchemy import Column, Integer, String
from ..core.database import Base


class Employee(Base):
    __tablename__ = 'employees'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    password = Column(String, nullable=True)
    photo = Column(String, nullable=True)
    role = Column(String, nullable=False, default='manager')

