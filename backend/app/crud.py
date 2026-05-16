from sqlalchemy.orm import Session
from . import models, schemas


# Managers
def get_managers(db: Session):
    # backend now stores users in `employees` table; return those with role 'manager' and also include leaders if needed elsewhere
    return db.query(models.Employee).filter(models.Employee.role == 'manager').all()


def create_manager(db: Session, manager: schemas.ManagerCreate):
    # create an employee row with role defaulting to 'manager' unless provided
    role = getattr(manager, 'role', None) or 'manager'
    db_obj = models.Employee(name=manager.name, email=manager.email, phone=manager.phone, password=manager.password, role=role)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_manager(db: Session, manager_id: int, data: dict):
    obj = db.query(models.Employee).filter(models.Employee.id == manager_id).first()
    if not obj:
        return None
    for k, v in data.items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


def delete_manager(db: Session, manager_id: int):
    obj = db.query(models.Employee).filter(models.Employee.id == manager_id).first()
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


def update_client(db: Session, client_id: int, data: dict):
    obj = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not obj:
        return None
    for k, v in data.items():
        if hasattr(obj, k):
            setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


def delete_client(db: Session, client_id: int):
    obj = db.query(models.Client).filter(models.Client.id == client_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


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
    # attach services if provided
    if getattr(sale, 'service_ids', None):
        for sid in sale.service_ids:
            svc = db.query(models.Service).filter(models.Service.id == sid).first()
            if svc and svc not in db_obj.services:
                db_obj.services.append(svc)
        db.commit()
        db.refresh(db_obj)
    return db_obj


def update_tour(db: Session, tour_id: int, data: dict):
    obj = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    if not obj:
        return None
    for k, v in data.items():
        if hasattr(obj, k):
            setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


def delete_tour(db: Session, tour_id: int):
    obj = db.query(models.Tour).filter(models.Tour.id == tour_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True


