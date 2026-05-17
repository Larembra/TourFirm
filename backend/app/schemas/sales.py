from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel
from .services import ServiceRead


class SaleBase(BaseModel):
    tour_id: int
    client_id: int
    quantity: Optional[int] = 1


class SaleCreate(SaleBase):
    service_ids: Optional[List[int]] = None


class SaleRead(SaleBase):
    id: int
    date: Optional[datetime]
    services: List[ServiceRead] = []

    class Config:
        orm_mode = True

