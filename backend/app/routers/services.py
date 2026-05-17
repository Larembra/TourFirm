from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..schemas import ServiceCreate, ServiceRead, TourRead
from ..crud import services as services_crud
from .auth import get_current_user

router = APIRouter()


@router.get('/services', response_model=list[ServiceRead])
def list_services(db: Session = Depends(get_db)):
    return services_crud.get_services(db)


@router.post('/services', response_model=ServiceRead)
def create_service(service: ServiceCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    return services_crud.create_service(db, service)


@router.get('/tours/{tour_id}/services', response_model=list[ServiceRead])
def list_services_by_tour(tour_id: int, db: Session = Depends(get_db)):
    return services_crud.get_services_by_tour(db, tour_id)


@router.post('/tours/{tour_id}/services/{service_id}', response_model=TourRead)
def add_service(tour_id: int, service_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    tour = services_crud.add_service_to_tour(db, tour_id, service_id)
    if not tour:
        raise HTTPException(status_code=404, detail='Tour or Service not found')
    return tour


@router.delete('/tours/{tour_id}/services/{service_id}', response_model=TourRead)
def remove_service(tour_id: int, service_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    tour = services_crud.remove_service_from_tour(db, tour_id, service_id)
    if not tour:
        raise HTTPException(status_code=404, detail='Tour or Service not found')
    return tour

