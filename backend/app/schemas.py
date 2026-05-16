from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class ManagerBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    photo: Optional[str] = None
    # for compatibility with new employees table we may include role here
    role: Optional[str] = 'manager'


class ManagerCreate(ManagerBase):
    password: Optional[str] = None


class ManagerRead(ManagerBase):
    id: int
    role: Optional[str] = 'manager'
    photo: Optional[str] = None

    class Config:
        orm_mode = True


class ClientBase(BaseModel):
    name: str
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None


class ClientCreate(ClientBase):
    regular_customer: Optional[bool] = False


class ClientRead(ClientBase):
    id: int
    regular_customer: bool

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
    services: List['ServiceRead'] = []
    images: List['TourImageRead'] = []

    class Config:
        orm_mode = True


class SaleBase(BaseModel):
    tour_id: int
    client_id: int
    quantity: Optional[int] = 1


class SaleCreate(SaleBase):
    service_ids: Optional[List[int]] = None


class SaleRead(SaleBase):
    id: int
    date: Optional[datetime]
    services: List['ServiceRead'] = []

    class Config:
        orm_mode = True


class ServiceBase(BaseModel):
    name: str
    cost: Optional[int] = 0


class ServiceCreate(ServiceBase):
    pass


class ServiceRead(ServiceBase):
    id: int

    class Config:
        orm_mode = True

# поддержка отложенной аннотации списка ServiceRead в TourRead
from pydantic import BaseModel as _BaseModel  # noqa: F401



class TourImageRead(BaseModel):
    id: int
    url: str
    is_primary: Optional[bool] = False
    order: Optional[int] = 0

    class Config:
        orm_mode = True


TourRead.update_forward_refs()
SaleRead.update_forward_refs()



