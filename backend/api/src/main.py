from fastapi import FastAPI
from .database import lifespan
from .routers import routes

app = FastAPI(lifespan=lifespan)
app.include_router(routes.router)
