from sqlalchemy.orm import Session
from ..models import Tour
from ..schemas import TourCreate


def get_tours(db: Session):
    return db.query(Tour).all()


def create_tour(db: Session, tour: TourCreate):
    db_obj = Tour(**tour.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_tour(db: Session, tour_id: int, data: dict):
    obj = db.query(Tour).filter(Tour.id == tour_id).first()
    if not obj:
        return None
    for k, v in data.items():
        if hasattr(obj, k):
            setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


def delete_tour(db: Session, tour_id: int):
    obj = db.query(Tour).filter(Tour.id == tour_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

