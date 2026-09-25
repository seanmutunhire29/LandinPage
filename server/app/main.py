"""FastAPI entrypoint. Run from server/: uv run uvicorn app.main:app --reload"""

import logging
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import config
from app.auth import User, current_user
from app.integrations.mcp_client import mcp_manager
from app.routes import projects, ws

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(name)s: %(message)s")


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await mcp_manager.start(config.MCP_CONFIG_PATH)
    yield
    await mcp_manager.stop()


app = FastAPI(title="LandInPage API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(projects.router)
app.include_router(ws.router)


@app.get("/health")
async def health():
    return {"ok": True}


@app.get("/me")
async def me(user: User = Depends(current_user)):
    return {"id": user.id, "email": user.email}
