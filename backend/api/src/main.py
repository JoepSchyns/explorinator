from fastapi import FastAPI
from .database import lifespan
from .routers import routes
from .routers import sources

app = FastAPI(lifespan=lifespan)
app.include_router(routes.router)
app.include_router(sources.router)
