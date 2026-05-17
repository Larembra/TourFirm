from sqlalchemy import Column, DateTime, ForeignKey, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from ..core.database import Base
from .associations import sale_services


class Sale(Base):
    __tablename__ = 'sales'

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    tour_id = Column(Integer, ForeignKey('tours.id'))
    client_id = Column(Integer, ForeignKey('clients.id'))
    quantity = Column(Integer, default=1)

    tour = relationship('Tour')
    client = relationship('Client')
    services = relationship('Service', secondary=sale_services)

