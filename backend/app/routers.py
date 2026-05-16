from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from . import crud, schemas, models
from .database import get_db
import os

from fastapi.responses import JSONResponse
from passlib.exc import UnknownHashError
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from .crud import pwd_context
import os

# JWT settings
SECRET_KEY = os.environ.get('JWT_SECRET') or 'change-this-secret'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({'exp': expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(status_code=401, detail='Could not validate credentials')
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = str(payload.get('sub'))
        if user_id is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = db.query(models.Employee).filter(models.Employee.id == int(user_id)).first()
    if not user:
        raise credentials_exception
    return user

router = APIRouter()


@router.post('/auth/login')
def login(payload: dict, db: Session = Depends(get_db)):
    """Authenticate user and return JWT + user info"""
    email = payload.get('email')
    password = payload.get('password')
    if not email or not password:
        raise HTTPException(status_code=400, detail='Email and password required')
    emp = db.query(models.Employee).filter(models.Employee.email == email).first()
    if not emp or not emp.password:
        # no such user or no password set
        raise HTTPException(status_code=401, detail='Invalid credentials')

    verified = False
    try:
        verified = pwd_context.verify(password, emp.password)
    except (UnknownHashError, ValueError):
        # password in DB is not a recognized hash (probably plaintext) or bcrypt backend failed
        if isinstance(emp.password, str) and emp.password.startswith('$2'):
            try:
                import bcrypt as _bcrypt
                pw_bytes = password.encode('utf-8')
                if len(pw_bytes) > 72:
                    pw_bytes = pw_bytes[:72]
                verified = _bcrypt.checkpw(pw_bytes, emp.password.encode('utf-8'))
            except Exception:
                verified = False
        if not verified and password == emp.password:
            verified = True
            # migrate: replace plaintext password with hashed version (use safe_hash from crud)
            try:
                emp.password = crud.safe_hash(password)
                db.add(emp)
                db.commit()
            except Exception:
                # fallback: ignore migration failure but allow login
                pass

    if not verified:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    access_token = create_access_token(data={'sub': str(emp.id), 'role': emp.role})
    return {'access_token': access_token, 'token_type': 'bearer', 'user': {'id': emp.id, 'name': emp.name, 'email': emp.email, 'phone': emp.phone, 'role': emp.role}}


@router.get('/managers', response_model=list[schemas.ManagerRead])
@router.get('/employees', response_model=list[schemas.ManagerRead])
def list_managers(db: Session = Depends(get_db)):
    return crud.get_managers(db)


@router.post('/managers', response_model=schemas.ManagerRead)
@router.post('/employees', response_model=schemas.ManagerRead)
def create_manager(mgr: schemas.ManagerCreate, db: Session = Depends(get_db)):
    # require leader role to create employees
    raise HTTPException(status_code=401, detail='Authentication required')


@router.put('/managers/{manager_id}', response_model=schemas.ManagerRead)
@router.put('/employees/{manager_id}', response_model=schemas.ManagerRead)
def update_manager(manager_id: int, data: schemas.ManagerCreate, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    obj = crud.update_manager(db, manager_id, data.dict())
    if not obj:
        raise HTTPException(status_code=404, detail='Manager not found')
    return obj


@router.delete('/managers/{manager_id}')
@router.delete('/employees/{manager_id}')
def delete_manager(manager_id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    ok = crud.delete_manager(db, manager_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Manager not found')
    return {'ok': True}


@router.post('/employees/protected', response_model=schemas.ManagerRead)
def create_employee_protected(mgr: schemas.ManagerCreate, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    return crud.create_manager(db, mgr)


@router.get('/clients', response_model=list[schemas.ClientRead])
def list_clients(db: Session = Depends(get_db)):
    return crud.get_clients(db)


@router.post('/clients', response_model=schemas.ClientRead)
def create_client(client: schemas.ClientCreate, db: Session = Depends(get_db)):
    return crud.create_client(db, client)


@router.put('/clients/{client_id}', response_model=schemas.ClientRead)
def update_client(client_id: int, client: schemas.ClientCreate, db: Session = Depends(get_db)):
    obj = crud.update_client(db, client_id, client.dict())
    if not obj:
        raise HTTPException(status_code=404, detail='Client not found')
    return obj


@router.delete('/clients/{client_id}')
def delete_client(client_id: int, db: Session = Depends(get_db)):
    ok = crud.delete_client(db, client_id)
    if not ok:
        raise HTTPException(status_code=404, detail='Client not found')
    return {'ok': True}


@router.get('/tours', response_model=list[schemas.TourRead])
def list_tours(db: Session = Depends(get_db)):
    return crud.get_tours(db)


@router.post('/tours', response_model=schemas.TourRead)
def create_tour(tour: schemas.TourCreate, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    return crud.create_tour(db, tour)


@router.put('/tours/{tour_id}', response_model=schemas.TourRead)
def update_tour(tour_id: int, tour: schemas.TourCreate, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    obj = crud.update_tour(db, tour_id, tour.dict())
    if not obj:
        raise HTTPException(status_code=404, detail='Tour not found')
    return obj


@router.delete('/tours/{tour_id}')
def delete_tour(tour_id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
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
def create_service(service: schemas.ServiceCreate, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    return crud.create_service(db, service)


@router.get('/tours/{tour_id}/services', response_model=list[schemas.ServiceRead])
def list_services_by_tour(tour_id: int, db: Session = Depends(get_db)):
    return crud.get_services_by_tour(db, tour_id)


@router.post('/tours/{tour_id}/services/{service_id}', response_model=schemas.TourRead)
def add_service(tour_id: int, service_id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    tour = crud.add_service_to_tour(db, tour_id, service_id)
    if not tour:
        raise HTTPException(status_code=404, detail='Tour or Service not found')
    return tour


@router.delete('/tours/{tour_id}/services/{service_id}', response_model=schemas.TourRead)
def remove_service(tour_id: int, service_id: int, db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
    tour = crud.remove_service_from_tour(db, tour_id, service_id)
    if not tour:
        raise HTTPException(status_code=404, detail='Tour or Service not found')
    return tour


# Upload tour image
@router.post('/tours/{tour_id}/images')
async def upload_tour_image(tour_id: int, file: UploadFile = File(...), db: Session = Depends(get_db), current_user: models.Employee = Depends(get_current_user)):
    if current_user.role != 'leader':
        raise HTTPException(status_code=403, detail='Forbidden')
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


