# main.py

import shutil
import os

from fastapi import FastAPI, HTTPException, UploadFile, File, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from fastapi.staticfiles import StaticFiles

from app.services.youtube_preview import get_youtube_preview

from app.schemas import (
    DownloadRequest,
    DownloadResponse,
    AnalyzeRequest,
    AnalyzeResponse,
    ExportClipRequest,
    ExportClipResponse,
    LayoutDetectionRequest,
    LayoutDetectionResponse,
    ExportSmartVerticalRequest,
    ExportSmartVerticalResponse,
    ExportSmartVerticalSubtitledRequest,
    ExportSmartVerticalSubtitledResponse,
    ProjectListResponse,
    ProjectDetailResponse,
    SaveProjectDataRequest,
    SaveProjectDataResponse,
    GenerateSocialCopyRequest, 
    GenerateSocialCopyResponse,
    CropPresetRequest,
    CropPresetResponse,
    ExportCustomVerticalClipRequest,
    ExportCustomVerticalClipResponse,
    YouTubePreviewRequest, 
    YouTubePreviewResponse,
    DeleteProjectResponse,
)

from app.services.downloader import download_video
from app.services.analyzer import analyze_video_for_clips
from app.services.content_generator import generate_social_copy_for_clip

from app.services.video_editor import ( 
    export_clips, 
    export_smart_vertical_clips, 
    export_smart_vertical_subtitled_clips,
)

from app.services.project_service import (
    create_project,
    list_projects,
    load_full_project,
    save_project_json,
    delete_project,
)

from app.services.layout_detector import detect_layout
from pathlib import Path
import shutil
from app.config import DOWNLOADS_DIR, CLIPS_DIR

from app.db.database import get_db
from app.db.init_db import init_db

from app.services.video_editor import (
    get_default_crop_preset,
    export_custom_vertical_clip,
)

app = FastAPI(title="AI Clipper")

@app.get("/health")
def health_check():
    return {
        "success": True,
        "message": "AI Clipper backend is running",
    }

app.mount("/clips", StaticFiles(directory=str(CLIPS_DIR)), name="clips")

@app.on_event("startup")
def on_startup():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"message": "AI Clipper backend is running"}


@app.post("/download", response_model=DownloadResponse)
def download(payload: DownloadRequest, db: Session = Depends(get_db)):
    result = download_video(
        url=payload.url,
        quality=payload.quality,
    )

    project = create_project(
        db=db,
        title=result["video_title"],
        video_path=result["video_path"],
        source_type="youtube",
        duration=result.get("duration"),
    )

    return {
        "success": True,
        **result,
        "project_id": project.id,
    }
    
@app.post("/upload-video", response_model=DownloadResponse)
def upload_video(file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        filename = file.filename or "uploaded_video.mp4"

        if not filename.lower().endswith((".mp4", ".mov", ".mkv", ".webm")):
            raise HTTPException(
                status_code=400,
                detail="Only video files are supported: .mp4, .mov, .mkv, .webm"
            )

        safe_name = "".join(
            char if char.isalnum() or char in ["-", "_", ".", " "] else "_"
            for char in filename
        ).strip()

        output_path = DOWNLOADS_DIR / safe_name

        counter = 1
        original_stem = Path(safe_name).stem
        original_suffix = Path(safe_name).suffix

        while output_path.exists():
            output_path = DOWNLOADS_DIR / f"{original_stem}_{counter}{original_suffix}"
            counter += 1

        with output_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        project = create_project(
            db=db,
            title=Path(output_path).stem,
            video_path=str(output_path),
            source_type="local_upload",
            duration=None,
        )

        return DownloadResponse(
            success=True,
            video_title=Path(output_path).stem,
            video_path=str(output_path),
            duration=None,
            project_id=project.id,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze_video(payload: AnalyzeRequest):
    try:
        result = analyze_video_for_clips(
            video_path=payload.video_path,
            max_clips=payload.max_clips,
            min_score=payload.min_score,
            min_duration=payload.min_duration,
            max_duration=payload.max_duration,
            use_reaction_detection=payload.use_reaction_detection,
        )

        return AnalyzeResponse(
            success=True,
            audio_path=result["audio_path"],
            transcript_segments=result["transcript_segments"],
            clips=result["clips"]
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/export-clips", response_model=ExportClipResponse)
def export_video_clips(payload: ExportClipRequest):
    try:
        clip_dicts = [clip.model_dump() for clip in payload.clips]

        exported = export_clips(
            video_path=payload.video_path,
            clips=clip_dicts
        )

        return ExportClipResponse(
            success=True,
            exported_clips=exported
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/detect-layout", response_model=LayoutDetectionResponse)
def detect_video_layout(payload: LayoutDetectionRequest):
    try:
        result = detect_layout(payload.video_path)

        return LayoutDetectionResponse(
            success=True,
            layout_type=result["layout_type"],
            confidence=result["confidence"],
            video_width=result["video_width"],
            video_height=result["video_height"],
            facecam_box=result["facecam_box"],
            gameplay_box=result["gameplay_box"],
            reason=result["reason"],
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/export-smart-vertical-clips", response_model=ExportSmartVerticalResponse)
def export_video_smart_vertical_clips(payload: ExportSmartVerticalRequest):
    try:
        layout = detect_layout(payload.video_path)
        clip_dicts = [clip.model_dump() for clip in payload.clips]

        exported = export_smart_vertical_clips(
            video_path=payload.video_path,
            clips=clip_dicts,
            layout=layout
        )

        return ExportSmartVerticalResponse(
            success=True,
            layout_type=layout["layout_type"],
            confidence=layout["confidence"],
            reason=layout["reason"],
            exported_clips=exported
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/export-smart-vertical-subtitled-clips", response_model=ExportSmartVerticalSubtitledResponse)
def export_video_smart_vertical_subtitled_clips(payload: ExportSmartVerticalSubtitledRequest):
    try:
        layout = detect_layout(payload.video_path)

        clip_dicts = [clip.model_dump() for clip in payload.clips]
        transcript_dicts = [segment.model_dump() for segment in payload.transcript_segments]

        exported = export_smart_vertical_subtitled_clips(
            video_path=payload.video_path,
            clips=clip_dicts,
            transcript_segments=transcript_dicts,
            layout=layout
        )

        return ExportSmartVerticalSubtitledResponse(
            success=True,
            layout_type=layout["layout_type"],
            confidence=layout["confidence"],
            reason=layout["reason"],
            exported_clips=exported
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@app.get("/projects", response_model=ProjectListResponse)
def get_projects(db: Session = Depends(get_db)):
    try:
        projects = list_projects(db)

        return ProjectListResponse(
            success=True,
            projects=projects
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/projects/{project_id}", response_model=ProjectDetailResponse)
def get_project_detail(project_id: str, db: Session = Depends(get_db)):
    try:
        project = load_full_project(db, project_id)

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        return ProjectDetailResponse(
            success=True,
            project=project
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.delete("/projects/{project_id}", response_model=DeleteProjectResponse)
def delete_project_endpoint(project_id: str, db: Session = Depends(get_db)):
    try:
        deleted_project_id = delete_project(db, project_id)

        return DeleteProjectResponse(
            success=True,
            deleted_project_id=deleted_project_id,
            message="Project removed from dashboard. Local files were not deleted.",
        )

    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Project not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/projects/save-data", response_model=SaveProjectDataResponse)
def save_project_data(payload: SaveProjectDataRequest, db: Session = Depends(get_db)):
    try:
        mapping = {
            "transcript": ("transcript.json", "transcript_path"),
            "clips": ("clips.json", "clips_path"),
            "layout": ("layout.json", "layout_path"),
            "exports": ("exports.json", "exports_path"),
        }

        if payload.data_type not in mapping:
            raise HTTPException(
                status_code=400,
                detail="data_type must be one of: transcript, clips, layout, exports"
            )

        filename, field_name = mapping[payload.data_type]

        path = save_project_json(
            db=db,
            project_id=payload.project_id,
            filename=filename,
            data=payload.data,
            field_name=field_name,
        )

        return SaveProjectDataResponse(
            success=True,
            path=path
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.post("/generate-social-copy", response_model=GenerateSocialCopyResponse)
def generate_social_copy(payload: GenerateSocialCopyRequest):
    social_copy = generate_social_copy_for_clip(payload.clip)

    return {
        "social_copy": social_copy
    }

@app.post("/crop-preset", response_model=CropPresetResponse)
def crop_preset(payload: CropPresetRequest):
    preset = get_default_crop_preset(
        video_path=payload.video_path,
        layout=payload.layout,
    )

    return preset


@app.post("/export-custom-vertical-clip", response_model=ExportCustomVerticalClipResponse)
def export_custom_vertical(payload: ExportCustomVerticalClipRequest):
    exported_clip = export_custom_vertical_clip(
        video_path=payload.video_path,
        clip=payload.clip,
        facecam_box=payload.facecam_box.model_dump(),
        gameplay_box=payload.gameplay_box.model_dump(),
    )

    return {
        "exported_clip": exported_clip,
    }

@app.get("/system-check")
def system_check():
    ffmpeg_path = shutil.which("ffmpeg")
    ffprobe_path = shutil.which("ffprobe")

    openai_key_exists = bool(os.getenv("OPENAI_API_KEY"))

    return {
        "success": True,
        "checks": {
            "backend": True,
            "ffmpeg": bool(ffmpeg_path),
            "ffmpeg_path": ffmpeg_path,
            "ffprobe": bool(ffprobe_path),
            "ffprobe_path": ffprobe_path,
            "openai_key": openai_key_exists,
        },
    }

@app.post("/youtube-preview", response_model=YouTubePreviewResponse)
def youtube_preview(payload: YouTubePreviewRequest):
    return get_youtube_preview(payload.url)