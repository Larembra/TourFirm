from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from . import crud, schemas, models
from .database import get_db
import os

from fastapi.responses import JSONResponse

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


@router.put('/tours/{tour_id}', response_model=schemas.TourRead)
def update_tour(tour_id: int, tour: schemas.TourCreate, db: Session = Depends(get_db)):
    obj = crud.update_tour(db, tour_id, tour.dict())
    if not obj:
        raise HTTPException(status_code=404, detail='Tour not found')
    return obj


@router.delete('/tours/{tour_id}')
def delete_tour(tour_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_tour(db, tour_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Tour not found')
    return {'ok': True}


@router.get('/sales', response_model=list[schemas.SaleRead])
def list_sales(db: Session = Depends(get_db)):
    return crud.get_sales(db)


@router.post('/sales', response_model=schemas.SaleRead)
def create_sale(sale: schemas.SaleCreate, db: Session = Depends(get_db)):
    return crud.create_sale(db, sale)


# Services endpoints
@router.get('/services', response_model=list[schemas.ServiceRead])
def list_services(db: Session = Depends(get_db)):
    return crud.get_services(db)


@router.post('/services', response_model=schemas.ServiceRead)
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db)):
    return crud.create_service(db, service)


@router.get('/tours/{tour_id}/services', response_model=list[schemas.ServiceRead])
def list_services_by_tour(tour_id: int, db: Session = Depends(get_db)):
    return crud.get_services_by_tour(db, tour_id)


@router.post('/tours/{tour_id}/services/{service_id}', response_model=schemas.TourRead)
def add_service(tour_id: int, service_id: int, db: Session = Depends(get_db)):
    tour = crud.add_service_to_tour(db, tour_id, service_id)
    if not tour:
        raise HTTPException(status_code=404, detail='Tour or Service not found')
    return tour


@router.delete('/tours/{tour_id}/services/{service_id}', response_model=schemas.TourRead)
def remove_service(tour_id: int, service_id: int, db: Session = Depends(get_db)):
    tour = crud.remove_service_from_tour(db, tour_id, service_id)
    if not tour:
        raise HTTPException(status_code=404, detail='Tour or Service not found')
    return tour


# Upload tour image
@router.post('/tours/{tour_id}/images')
async def upload_tour_image(tour_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail='Tour not found')
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='File must be an image')
    uploads_dir = os.path.join(os.path.dirname(__file__), '..', 'static', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    filename = f"{file.filename}"
    save_path = os.path.join(uploads_dir, filename)
    content = await file.read()
    with open(save_path, 'wb') as f:
        f.write(content)
    url = f"/static/uploads/{filename}"
    img = models.TourImage(tour_id=tour_id, url=url)
    db.add(img)
    db.commit()
    db.refresh(img)
    return JSONResponse({'id': img.id, 'url': url, 'is_primary': img.is_primary, 'order': img.order})


