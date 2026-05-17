from typing import Optional
from pydantic import BaseModel


class ServiceBase(BaseModel):
    name: str
    cost: Optional[int] = 0


class ServiceCreate(ServiceBase):
    pass


class ServiceRead(ServiceBase):
    id: int

    class Config:
        orm_mode = True

