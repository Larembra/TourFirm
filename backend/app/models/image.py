from sqlalchemy import Boolean, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from ..core.database import Base


class TourImage(Base):
    __tablename__ = 'tour_images'

    id = Column(Integer, primary_key=True, index=True)
    tour_id = Column(Integer, ForeignKey('tours.id', ondelete='CASCADE'), nullable=False)
    url = Column(String, nullable=False)
    is_primary = Column(Boolean, default=False)
    order = Column(Integer, default=0)

    tour = relationship('Tour', back_populates='images')

