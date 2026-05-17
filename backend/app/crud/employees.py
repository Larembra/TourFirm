from sqlalchemy.orm import Session
from ..models import Employee
from ..schemas import ManagerCreate
from .security import safe_hash


def get_managers(db: Session):
    return db.query(Employee).filter(Employee.role == 'manager').all()


def create_manager(db: Session, manager: ManagerCreate):
    role = getattr(manager, 'role', None) or 'manager'
    hashed = None
    if getattr(manager, 'password', None):
        hashed = safe_hash(manager.password)
    db_obj = Employee(name=manager.name, email=manager.email, phone=manager.phone, password=hashed, role=role)
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_manager(db: Session, manager_id: int, data: dict):
    obj = db.query(Employee).filter(Employee.id == manager_id).first()
    if not obj:
        return None
    if 'password' in data:
        pw = data.pop('password')
        if pw:
            obj.password = safe_hash(pw)
    for k, v in data.items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj


def delete_manager(db: Session, manager_id: int):
    obj = db.query(Employee).filter(Employee.id == manager_id).first()
    if not obj:
        return False
    db.delete(obj)
    db.commit()
    return True

