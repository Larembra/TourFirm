from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from ..core.database import Base
from .associations import tour_services


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

    services = relationship('Service', secondary=tour_services, back_populates='tours')
    images = relationship('TourImage', back_populates='tour', cascade='all, delete-orphan')

