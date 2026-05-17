from typing import Optional
from pydantic import BaseModel


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

