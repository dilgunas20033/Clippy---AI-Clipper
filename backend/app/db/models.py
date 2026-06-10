# models.py

from sqlalchemy import Column, String, Float, DateTime, Integer
from datetime import datetime, timezone
import uuid

from app.db.database import Base


def utc_now():
    return datetime.now(timezone.utc)


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))

    title = Column(String, nullable=False)
    video_path = Column(String, nullable=False)
    source_type = Column(String, nullable=False, default="unknown")

    duration = Column(Float, nullable=True)

    transcript_path = Column(String, nullable=True)
    layout_path = Column(String, nullable=True)
    clips_path = Column(String, nullable=True)
    exports_path = Column(String, nullable=True)

    clip_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=utc_now)
    updated_at = Column(DateTime, default=utc_now, onupdate=utc_now)