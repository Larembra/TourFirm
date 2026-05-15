from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine
from . import models
from .routers import router as api_router


models.Base.metadata.create_all(bind=engine)

app = FastAPI(title='Tourfirm API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def root():
    return {'status': 'ok'}


app.include_router(api_router, prefix='/api')

