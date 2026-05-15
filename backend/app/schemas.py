from typing import Optional
from pydantic import BaseModel


class ManagerBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None


class ManagerCreate(ManagerBase):
    password: Optional[str] = None


class ManagerRead(ManagerBase):
    id: int

    class Config:
        orm_mode = True


class ClientBase(BaseModel):
    name: str
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class ClientCreate(ClientBase):
    discount_percent: Optional[int] = 0


class ClientRead(ClientBase):
    id: int
    discount_percent: int

    class Config:
        orm_mode = True


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

    class Config:
        orm_mode = True


class SaleBase(BaseModel):
    tour_id: int
    client_id: int
    quantity: Optional[int] = 1


class SaleCreate(SaleBase):
    pass


class SaleRead(SaleBase):
    id: int
    date: Optional[str]

    class Config:
        orm_mode = True

