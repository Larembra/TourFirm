from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from . import crud, schemas
from .database import get_db

router = APIRouter()


@router.get('/managers', response_model=list[schemas.ManagerRead])
def list_managers(db: Session = Depends(get_db)):
    return crud.get_managers(db)


@router.post('/managers', response_model=schemas.ManagerRead)
def create_manager(mgr: schemas.ManagerCreate, db: Session = Depends(get_db)):
    return crud.create_manager(db, mgr)


@router.put('/managers/{manager_id}', response_model=schemas.ManagerRead)
def update_manager(manager_id: int, data: schemas.ManagerCreate, db: Session = Depends(get_db)):
    obj = crud.update_manager(db, manager_id, data.dict())
    if not obj:
        raise HTTPException(status_code=404, detail='Manager not found')
    return obj


@router.delete('/managers/{manager_id}')
def delete_manager(manager_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_manager(db, manager_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Manager not found')
    return {'ok': True}


@router.get('/clients', response_model=list[schemas.ClientRead])
def list_clients(db: Session = Depends(get_db)):
    return crud.get_clients(db)


@router.post('/clients', response_model=schemas.ClientRead)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    return crud.create_client(db, client)


@router.get('/tours', response_model=list[schemas.TourRead])
def list_tours(db: Session = Depends(get_db)):
    return crud.get_tours(db)


@router.post('/tours', response_model=schemas.TourRead)
def create_tour(tour: schemas.TourCreate, db: Session = Depends(get_db)):
    return crud.create_tour(db, tour)


@router.get('/sales', response_model=list[schemas.SaleRead])
def list_sales(db: Session = Depends(get_db)):
    return crud.get_sales(db)


@router.post('/sales', response_model=schemas.SaleRead)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    return crud.create_sale(db, sale)

