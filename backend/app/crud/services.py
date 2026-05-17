from sqlalchemy.orm import Session
from ..models import Service, Tour
from ..schemas import ServiceCreate


def get_services(db: Session):
    return db.query(Service).all()


def create_service(db: Session, service: ServiceCreate):
    db_obj = Service(name=service.name, cost=service.cost or 0)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_services_by_tour(db: Session, tour_id: int):
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    return tour.services if tour else []


def add_service_to_tour(db: Session, tour_id: int, service_id: int):
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    service = db.query(Service).filter(Service.id == service_id).first()
    if not tour or not service:
        return None
    if service not in tour.services:
        tour.services.append(service)
        db.commit()
        db.refresh(tour)
    return tour


def remove_service_from_tour(db: Session, tour_id: int, service_id: int):
    tour = db.query(Tour).filter(Tour.id == tour_id).first()
    service = db.query(Service).filter(Service.id == service_id).first()
    if not tour or not service:
        return None
    if service in tour.services:
        tour.services.remove(service)
        db.commit()
        db.refresh(tour)
    return tour

