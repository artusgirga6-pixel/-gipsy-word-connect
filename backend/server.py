from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")


# ---------- Models ----------
class PlayerProgress(BaseModel):
    player_id: str
    name: Optional[str] = None
    completed_levels: List[int] = Field(default_factory=list)
    current_level: int = 1
    discovered_phrases: List[dict] = Field(default_factory=list)  # [{level, phrase, translation, ts}]
    best_times: dict = Field(default_factory=dict)  # {level_str: seconds}
    updated_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class ProgressInit(BaseModel):
    name: Optional[str] = None


class NameUpdate(BaseModel):
    name: Optional[str] = None


class LevelCompletion(BaseModel):
    player_id: str
    level: int
    phrase: str
    translation: Optional[str] = None
    theme: Optional[str] = None
    time_seconds: Optional[int] = None


# ---------- Routes ----------
@api_router.get("/")
async def root():
    return {"message": "Romani Word Search API", "version": "1.0"}


@api_router.post("/progress/init", response_model=PlayerProgress)
async def init_progress(payload: ProgressInit):
    player_id = str(uuid.uuid4())
    prog = PlayerProgress(player_id=player_id, name=payload.name)
    await db.player_progress.insert_one(prog.model_dump())
    return prog


@api_router.get("/progress/{player_id}", response_model=PlayerProgress)
async def get_progress(player_id: str):
    doc = await db.player_progress.find_one({"player_id": player_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Player not found")
    return PlayerProgress(**doc)


@api_router.post("/progress/complete", response_model=PlayerProgress)
async def complete_level(payload: LevelCompletion):
    doc = await db.player_progress.find_one({"player_id": payload.player_id}, {"_id": 0})
    if not doc:
        # auto-create
        doc = PlayerProgress(player_id=payload.player_id).model_dump()
        await db.player_progress.insert_one(doc)

    prog = PlayerProgress(**doc)
    if payload.level not in prog.completed_levels:
        prog.completed_levels.append(payload.level)
        prog.completed_levels.sort()
    prog.current_level = max(prog.current_level, min(payload.level + 1, 30))
    prog.discovered_phrases = [p for p in prog.discovered_phrases if p.get("level") != payload.level]
    prog.discovered_phrases.append({
        "level": payload.level,
        "phrase": payload.phrase,
        "translation": payload.translation,
        "theme": payload.theme,
        "time_seconds": payload.time_seconds,
        "ts": datetime.now(timezone.utc).isoformat(),
    })
    # Track best (lowest) time per level
    if payload.time_seconds is not None and payload.time_seconds > 0:
        key = str(payload.level)
        current_best = prog.best_times.get(key)
        if current_best is None or payload.time_seconds < current_best:
            prog.best_times[key] = payload.time_seconds
    prog.updated_at = datetime.now(timezone.utc).isoformat()

    await db.player_progress.update_one(
        {"player_id": payload.player_id},
        {"$set": prog.model_dump()},
        upsert=True,
    )
    return prog


@api_router.post("/progress/reset/{player_id}", response_model=PlayerProgress)
async def reset_progress(player_id: str):
    existing = await db.player_progress.find_one({"player_id": player_id}, {"_id": 0})
    name = existing.get("name") if existing else None
    prog = PlayerProgress(player_id=player_id, name=name)
    await db.player_progress.update_one(
        {"player_id": player_id},
        {"$set": prog.model_dump()},
        upsert=True,
    )
    return prog


@api_router.post("/progress/{player_id}/name", response_model=PlayerProgress)
async def update_name(player_id: str, payload: NameUpdate):
    doc = await db.player_progress.find_one({"player_id": player_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Player not found")
    name = (payload.name or "").strip() or None
    await db.player_progress.update_one(
        {"player_id": player_id},
        {"$set": {"name": name, "updated_at": datetime.now(timezone.utc).isoformat()}},
    )
    doc["name"] = name
    return PlayerProgress(**doc)


@api_router.get("/leaderboard")
async def leaderboard(limit: int = 20):
    cursor = db.player_progress.find({}, {"_id": 0})
    rows = await cursor.to_list(length=500)
    enriched = []
    for r in rows:
        bt = r.get("best_times", {}) or {}
        total_time = sum(bt.values()) if bt else 0
        enriched.append({
            "name": r.get("name") or "Hráč",
            "completed": len(r.get("completed_levels", [])),
            "current_level": r.get("current_level", 1),
            "total_best_time": total_time,
            "updated_at": r.get("updated_at"),
        })
    enriched.sort(key=lambda x: (-x["completed"], x["total_best_time"] or 9_999_999))
    return enriched[:limit]


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
