from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..schemas import SaleCreate, SaleRead
from ..crud import sales as sales_crud
from .auth import get_current_user

router = APIRouter()


@router.get('/sales', response_model=list[SaleRead])
def list_sales(db: Session = Depends(get_db)):
    return sales_crud.get_sales(db)


@router.post('/sales', response_model=SaleRead)
def create_sale(sale: SaleCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return sales_crud.create_sale(db, sale, employee_id=current_user.id)
