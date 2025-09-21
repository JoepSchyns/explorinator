import asyncpg
from fastapi import FastAPI, Request
from contextlib import asynccontextmanager
from .config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.db_pool = await asyncpg.create_pool(
        host=settings.db_host,
        port=settings.db_port,
        user=settings.db_user,
        password=settings.db_password,
        database=settings.db_name
    )
    try:
        yield
    finally:
        await app.state.db_pool.close()


async def get_db(request: Request):
    async with request.app.state.db_pool.acquire() as conn:
        yield conn
        