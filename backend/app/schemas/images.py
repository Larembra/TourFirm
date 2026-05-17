from typing import Optional
from pydantic import BaseModel


class TourImageRead(BaseModel):
    id: int
    url: str
    is_primary: Optional[bool] = False
    order: Optional[int] = 0

    class Config:
        orm_mode = True

