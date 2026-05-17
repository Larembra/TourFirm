from datetime import datetime, timedelta, timezone
import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from passlib.exc import UnknownHashError
from ..core.database import get_db
from ..models import Employee
from ..crud.security import pwd_context, safe_hash

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl='/api/auth/login')

SECRET_KEY = os.environ.get('JWT_SECRET') or 'change-this-secret'
ALGORITHM = 'HS256'
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24


def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
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
    user = db.query(Employee).filter(Employee.id == int(user_id)).first()
    if not user:
        raise credentials_exception
    return user


@router.post('/auth/login')
def login(payload: dict, db: Session = Depends(get_db)):
    email = payload.get('email')
    password = payload.get('password')
    if not email or not password:
        raise HTTPException(status_code=400, detail='Email and password required')
    emp = db.query(Employee).filter(Employee.email == email).first()
    if not emp or not emp.password:
        raise HTTPException(status_code=401, detail='Invalid credentials')

    verified = False
    try:
        verified = pwd_context.verify(password, emp.password)
    except (UnknownHashError, ValueError):
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
            try:
                emp.password = safe_hash(password)
                db.add(emp)
                db.commit()
            except Exception:
                pass

    if not verified:
        raise HTTPException(status_code=401, detail='Invalid credentials')
    access_token = create_access_token(data={'sub': str(emp.id), 'role': emp.role})
    return {
        'access_token': access_token,
        'token_type': 'bearer',
        'user': {
            'id': emp.id,
            'name': emp.name,
            'email': emp.email,
            'phone': emp.phone,
            'photo': emp.photo,
            'role': emp.role,
        },
    }

