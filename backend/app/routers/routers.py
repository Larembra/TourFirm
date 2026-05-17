from fastapi import APIRouter
from .auth import router as auth_router
from .clients import router as clients_router
from .employees import router as employees_router
from .sales import router as sales_router
from .services import router as services_router
from .tours import router as tours_router

router = APIRouter()

router.include_router(auth_router)
router.include_router(employees_router)
router.include_router(clients_router)
router.include_router(tours_router)
router.include_router(services_router)
router.include_router(sales_router)
