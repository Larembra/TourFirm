from sqlalchemy.orm import Session
from ..models import Client
from ..schemas import ClientCreate


def get_clients(db: Session):
    return db.query(Client).all()


def create_client(db: Session, client: ClientCreate):
    db_obj = Client(
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
    obj = db.query(Client).filter(Client.id == client_id).first()
    if not obj:
        return None
    for k, v in data.items():
        if hasattr(obj, k):
            setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


def delete_client(db: Session, client_id: int):
    obj = db.query(Client).filter(Client.id == client_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

