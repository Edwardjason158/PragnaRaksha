from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = ""
    REDIS_HOST: str = ""
    REDIS_PORT: int = 6379
    USE_REDIS: bool = False
    SECRET_KEY: str = "changeme"

settings = Settings()

# Only connect to DB if a valid DATABASE_URL is provided
_db_url = settings.DATABASE_URL or os.environ.get("DATABASE_URL", "")
_has_db = bool(_db_url and "localhost" not in _db_url and "127.0.0.1" not in _db_url and _db_url.startswith("postgresql"))

Base = declarative_base()

if _has_db:
    try:
        engine = create_engine(_db_url)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        print(f"Database engine created for: {_db_url[:30]}...")
    except Exception as e:
        print(f"DB engine creation failed: {e}. In-memory fallback will be used.")
        engine = None
        SessionLocal = None
        _has_db = False
else:
    print("No DATABASE_URL configured — using In-Memory mode")
    engine = None
    SessionLocal = None

def get_db():
    if SessionLocal is None:
        return None
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
