import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import Tour, TourImage
from ..schemas import TourCreate, TourRead
from ..crud import tours as tours_crud
from .auth import get_current_user

router = APIRouter()


@router.get('/tours', response_model=list[TourRead])
def list_tours(db: Session = Depends(get_db)):
    return tours_crud.get_tours(db)


@router.post('/tours', response_model=TourRead)
def create_tour(tour: TourCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    return tours_crud.create_tour(db, tour)


@router.put('/tours/{tour_id}', response_model=TourRead)
def update_tour(tour_id: int, tour: TourCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    obj = tours_crud.update_tour(db, tour_id, tour.dict())
    if not obj:
        raise HTTPException(status_code=404, detail='Tour not found')
    return obj


@router.delete('/tours/{tour_id}')
def delete_tour(tour_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    ok = tours_crud.delete_tour(db, tour_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Tour not found')
    return {'ok': True}


@router.post('/tours/{tour_id}/images')
async def upload_tour_image(tour_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    if not tour:
        raise HTTPException(status_code=404, detail='Tour not found')
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='File must be an image')
    uploads_dir = os.path.join(os.path.dirname(__file__), '../..', 'static', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    filename = f"{file.filename}"
    save_path = os.path.join(uploads_dir, filename)
    content = await file.read()
    with open(save_path, 'wb') as f:
        f.write(content)
    url = f"/static/uploads/{filename}"
    img = TourImage(tour_id=tour_id, url=url)
    db.add(img)
    db.commit()
    db.refresh(img)
    return JSONResponse({'id': img.id, 'url': url, 'is_primary': img.is_primary, 'order': img.order})

