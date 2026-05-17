from typing import List, Optional
from pydantic import BaseModel
from .images import TourImageRead
from .services import ServiceRead


class TourBase(BaseModel):
    city: str
    title: str
    price: int
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    seats: Optional[int] = 0


class TourCreate(TourBase):
    pass


class TourRead(TourBase):
    id: int
    services: List[ServiceRead] = []
    images: List[TourImageRead] = []

    class Config:
        orm_mode = True

