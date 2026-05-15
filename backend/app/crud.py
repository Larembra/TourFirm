from sqlalchemy.orm import Session
from . import models, schemas


# Managers
def get_managers(db: Session):
    return db.query(models.Manager).all()


def create_manager(db: Session, manager: schemas.ManagerCreate):
    db_obj = models.Manager(name=manager.name, email=manager.email, phone=manager.phone, password=manager.password)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_manager(db: Session, manager_id: int, data: dict):
    obj = db.query(models.Manager).filter(models.Manager.id == manager_id).first()
    if not obj:
        return None
    for k, v in data.items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


def delete_manager(db: Session, manager_id: int):
    obj = db.query(models.Manager).filter(models.Manager.id == manager_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


# Clients
def get_clients(db: Session):
    return db.query(models.Client).all()


def create_client(db: Session, client: schemas.ClientCreate):
    db_obj = models.Client(
        name=client.name,
        city=client.city,
        phone=client.phone,
        email=client.email,
        regular_customer=client.regular_customer or False,
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


# Tours
def get_tours(db: Session):
    return db.query(models.Tour).all()


def create_tour(db: Session, tour: schemas.TourCreate):
    db_obj = models.Tour(**tour.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


# Services
def get_services(db: Session):
    return db.query(models.Service).all()


def create_service(db: Session, service: schemas.ServiceCreate):
    db_obj = models.Service(name=service.name, cost=service.cost or 0)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_services_by_tour(db: Session, tour_id: int):
    tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    return tour.services if tour else []


def add_service_to_tour(db: Session, tour_id: int, service_id: int):
    tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not tour or not service:
        return None
    if service not in tour.services:
        tour.services.append(service)
        db.commit()
        db.refresh(tour)
    return tour


def remove_service_from_tour(db: Session, tour_id: int, service_id: int):
    tour = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    service = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not tour or not service:
        return None
    if service in tour.services:
        tour.services.remove(service)
        db.commit()
        db.refresh(tour)
    return tour

# Sales
def get_sales(db: Session):
    return db.query(models.Sale).all()


def create_sale(db: Session, sale: schemas.SaleCreate):
    db_obj = models.Sale(tour_id=sale.tour_id, client_id=sale.client_id, quantity=sale.quantity or 1)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


