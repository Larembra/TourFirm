from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..schemas import ClientCreate, ClientRead
from ..crud import clients as clients_crud

router = APIRouter()


@router.get('/clients', response_model=list[ClientRead])
def list_clients(db: Session = Depends(get_db)):
    return clients_crud.get_clients(db)


@router.post('/clients', response_model=ClientRead)
def create_client(client: ClientCreate, db: Session = Depends(get_db)):
    return clients_crud.create_client(db, client)


@router.put('/clients/{client_id}', response_model=ClientRead)
def update_client(client_id: int, client: ClientCreate, db: Session = Depends(get_db)):
    obj = clients_crud.update_client(db, client_id, client.dict())
    if not obj:
        raise HTTPException(status_code=404, detail='Client not found')
    return obj


@router.delete('/clients/{client_id}')
def delete_client(client_id: int, db: Session = Depends(get_db)):
    ok = clients_crud.delete_client(db, client_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Client not found')
    return {'ok': True}

