# project_service.py

import json
import shutil
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from app.config import PROJECTS_DIR
from app.db.models import Project


def safe_folder_name(name: str) -> str:
    keep = []

    for char in name:
        if char.isalnum() or char in ["-", "_"]:
            keep.append(char)
        elif char.isspace():
            keep.append("_")

    cleaned = "".join(keep).strip("_")
    return cleaned[:80] or "project"


def project_to_dict(project: Project):
    return {
        "id": project.id,
        "title": project.title,
        "video_path": project.video_path,
        "source_type": project.source_type,
        "duration": project.duration,
        "transcript_path": project.transcript_path,
        "layout_path": project.layout_path,
        "clips_path": project.clips_path,
        "exports_path": project.exports_path,
        "clip_count": project.clip_count,
        "created_at": project.created_at.isoformat() if project.created_at else None,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
    }


def get_project_dir(project_id: str, title: str):
    return PROJECTS_DIR / f"{safe_folder_name(title)}_{project_id[:8]}"


def create_project(
    db: Session,
    title: str,
    video_path: str,
    source_type: str,
    duration: Optional[float] = None,
):
    project = Project(
        title=title,
        video_path=video_path,
        source_type=source_type,
        duration=duration,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    project_dir = get_project_dir(project.id, project.title)
    project_dir.mkdir(parents=True, exist_ok=True)

    exports_dir = project_dir / "exports"
    exports_dir.mkdir(parents=True, exist_ok=True)

    project.exports_path = str(exports_dir)
    db.commit()
    db.refresh(project)

    return project


def list_projects(db: Session):
    projects = (
        db.query(Project)
        .order_by(Project.updated_at.desc())
        .all()
    )

    return [project_to_dict(project) for project in projects]


def get_project(db: Session, project_id: str):
    return db.query(Project).filter(Project.id == project_id).first()


def save_project_json(
    db: Session,
    project_id: str,
    filename: str,
    data,
    field_name: str,
):
    project = get_project(db, project_id)

    if not project:
        raise FileNotFoundError(f"Project not found: {project_id}")

    project_dir = get_project_dir(project.id, project.title)
    project_dir.mkdir(parents=True, exist_ok=True)

    output_path = project_dir / filename

    output_path.write_text(
        json.dumps(data, indent=2),
        encoding="utf-8"
    )

    setattr(project, field_name, str(output_path))

    if field_name == "clips_path" and isinstance(data, list):
        project.clip_count = len(data)

    db.commit()
    db.refresh(project)

    return str(output_path)


def load_json_file(path: Optional[str]):
    if not path:
        return None

    file_path = Path(path)

    if not file_path.exists():
        return None

    return json.loads(file_path.read_text(encoding="utf-8"))


def load_full_project(db: Session, project_id: str):
    project = get_project(db, project_id)

    if not project:
        return None

    base = project_to_dict(project)

    base["transcript_segments"] = load_json_file(project.transcript_path) or []
    base["layout"] = load_json_file(project.layout_path)
    base["clips"] = load_json_file(project.clips_path) or []
    base["exports"] = load_json_file(project.exports_path) if project.exports_path and Path(project.exports_path).is_file() else None

    return base

def delete_project(db: Session, project_id: str):
    project = get_project(db, project_id)

    if not project:
        raise FileNotFoundError(f"Project not found: {project_id}")

    deleted_project_id = project.id

    db.delete(project)
    db.commit()

    return deleted_project_id