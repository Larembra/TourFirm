import re
from typing import Optional
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def safe_hash(password: str) -> Optional[str]:
    """Hash a password but truncate to 72 bytes for bcrypt if necessary."""
    try:
        if isinstance(password, str):
            if re.match(r"^\$2[aby]\$\d{2}\$[./=A-Za-z0-9]{53}$", password):
                return password
    except Exception:
        pass
    if password is None:
        return None
    b = password.encode('utf-8')
    if len(b) > 72:
        b = b[:72]
        try:
            password = b.decode('utf-8')
        except Exception:
            password = b.decode('utf-8', errors='ignore')
    try:
        return pwd_context.hash(password)
    except ValueError:
        try:
            import bcrypt as _bcrypt
            bb = b if len(b) <= 72 else b[:72]
            h = _bcrypt.hashpw(bb, _bcrypt.gensalt())
            return h.decode('utf-8')
        except Exception:
            raise

