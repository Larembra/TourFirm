import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..models import Employee
from ..schemas import ManagerCreate, ManagerRead
from ..crud import employees as employees_crud
from ..crud.security import pwd_context
from .auth import get_current_user

router = APIRouter()


@router.get('/managers', response_model=list[ManagerRead])
@router.get('/employees', response_model=list[ManagerRead])
def list_managers(db: Session = Depends(get_db)):
    return employees_crud.get_managers(db)


@router.post('/managers', response_model=ManagerRead)
@router.post('/employees', response_model=ManagerRead)
def create_manager(mgr: ManagerCreate, db: Session = Depends(get_db)):
    raise HTTPException(status_code=401, detail='Authentication required')


@router.put('/managers/{manager_id}', response_model=ManagerRead)
@router.put('/employees/{manager_id}', response_model=ManagerRead)
def update_manager(manager_id: int, data: dict, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    if current_user.role != 'leader' and current_user.id != manager_id:
        raise HTTPException(status_code=403, detail='Forbidden')

    if current_user.id == manager_id and 'password' in data:
        old = data.pop('old_password', None)
        if not old:
            raise HTTPException(status_code=400, detail='Current password required to change password')
        verified = False
        try:
            verified = pwd_context.verify(old, current_user.password)
        except Exception:
            try:
                import bcrypt as _bcrypt
                pw_bytes = old.encode('utf-8')
                if len(pw_bytes) > 72:
                    pw_bytes = pw_bytes[:72]
                verified = _bcrypt.checkpw(pw_bytes, current_user.password.encode('utf-8'))
            except Exception:
                verified = False
        if not verified:
            raise HTTPException(status_code=401, detail='Current password is incorrect')

    obj = employees_crud.update_manager(db, manager_id, data)
    if not obj:
        raise HTTPException(status_code=404, detail='Manager not found')
    return obj


@router.delete('/managers/{manager_id}')
@router.delete('/employees/{manager_id}')
def delete_manager(manager_id: int, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    ok = employees_crud.delete_manager(db, manager_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Manager not found')
    return {'ok': True}


@router.post('/employees/protected', response_model=ManagerRead)
def create_employee_protected(mgr: ManagerCreate, db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    return employees_crud.create_manager(db, mgr)


@router.post('/employees/{employee_id}/photo')
async def upload_employee_photo(employee_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: Employee = Depends(get_current_user)):
    if current_user.role != 'leader' and current_user.id != employee_id:
        raise HTTPException(status_code=403, detail='Forbidden')
    emp = db.query(Employee).filter(Employee.id == employee_id).first()
    if not emp:
        raise HTTPException(status_code=404, detail='Employee not found')
    if not file.content_type.startswith('image/'):
        raise HTTPException(status_code=400, detail='File must be an image')
    uploads_dir = os.path.join(os.path.dirname(__file__), '../..', 'static', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    safe_name = os.path.basename(file.filename)
    filename = f"{uuid.uuid4().hex}_{safe_name}"
    save_path = os.path.join(uploads_dir, filename)
    content = await file.read()
    with open(save_path, 'wb') as f:
        f.write(content)
    url = f"/static/uploads/{filename}"
    emp.photo = url
    db.add(emp)
    db.commit()
    db.refresh(emp)
    return JSONResponse({'id': emp.id, 'url': url, 'photo': emp.photo})

