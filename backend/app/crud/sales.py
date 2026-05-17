from sqlalchemy.orm import Session
from ..models import Sale, Service
from ..schemas import SaleCreate


def get_sales(db: Session):
    return db.query(Sale).all()


def create_sale(db: Session, sale: SaleCreate):
    db_obj = Sale(tour_id=sale.tour_id, client_id=sale.client_id, quantity=sale.quantity or 1)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    if getattr(sale, 'service_ids', None):
        for sid in sale.service_ids:
            svc = db.query(Service).filter(Service.id == sid).first()
            if svc and svc not in db_obj.services:
                db_obj.services.append(svc)
        db.commit()
        db.refresh(db_obj)
    return db_obj

