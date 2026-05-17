from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..core.database import Base
from .associations import tour_services


class Service(Base):
    __tablename__ = 'services'

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    cost = Column(Integer, default=0)

    tours = relationship('Tour', secondary=tour_services, back_populates='services')

