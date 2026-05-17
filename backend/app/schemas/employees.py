from typing import Optional
from pydantic import BaseModel


class ManagerBase(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    photo: Optional[str] = None
    role: Optional[str] = 'manager'


class ManagerCreate(ManagerBase):
    password: Optional[str] = None


class ManagerRead(ManagerBase):
    id: int
    role: Optional[str] = 'manager'
    photo: Optional[str] = None

    class Config:
        orm_mode = True

