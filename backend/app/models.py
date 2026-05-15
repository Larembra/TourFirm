from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base


class Manager(Base):
    __tablename__ = 'managers'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=True)
    password = Column(String, nullable=True)


class Client(Base):
    __tablename__ = 'clients'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    city = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    email = Column(String, nullable=True)
    discount_percent = Column(Integer, default=0)


class Tour(Base):
    __tablename__ = 'tours'
    id = Column(Integer, primary_key=True, index=True)
    city = Column(String, nullable=False)
    title = Column(String, nullable=False)
    price = Column(Integer, nullable=False, default=0)
    start_date = Column(String, nullable=True)
    end_date = Column(String, nullable=True)
    description = Column(String, nullable=True)
    seats = Column(Integer, default=0)


# Association table for many-to-many Tour <-> Service
tour_services = Table(
    'tour_services', Base.metadata,
    Column('tour_id', Integer, ForeignKey('tours.id')),
    Column('service_id', Integer, ForeignKey('services.id')),
)


class Service(Base):
    __tablename__ = 'services'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    cost = Column(Integer, default=0)

    tours = relationship('Tour', secondary=tour_services, back_populates='services')


class Sale(Base):
    __tablename__ = 'sales'
    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    tour_id = Column(Integer, ForeignKey('tours.id'))
    client_id = Column(Integer, ForeignKey('clients.id'))
    quantity = Column(Integer, default=1)

    tour = relationship('Tour')
    client = relationship('Client')


# add relationship on Tour side to services
Tour.services = relationship('Service', secondary=tour_services, back_populates='tours')


