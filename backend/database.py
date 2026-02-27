from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Default to local postgres. User should ensure PostGIS is installed on local postgres.
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/pchas_db"
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    USE_REDIS: bool = False # Set to True if local redis is running

settings = Settings()

engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
