from sqlalchemy import Boolean, Column, Integer, String
from ..core.database import Base


class Client(Base):
    __tablename__ = 'clients'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    regular_customer = Column(Boolean, default=0)

