# schema.py

from pydantic import BaseModel
from typing import Any, List, Optional


class DownloadRequest(BaseModel):
    url: str
    quality: str = "best"


class DownloadResponse(BaseModel):
    success: bool
    video_title: str
    video_path: str
    duration: Optional[float] = None
    source_type: Optional[str] = None
    cookie_mode_used: Optional[str] = None
    download_quality: Optional[str] = None
    project_id: Optional[str] = None
    project_options: Optional[dict] = None


class AnalyzeRequest(BaseModel):
    video_path: str
    max_clips: int = 50
    min_score: float = 65
    min_duration: int = 20
    max_duration: int = 60
    use_reaction_detection: bool = False


class TranscriptSegment(BaseModel):
    start: float
    end: float
    text: str


class ClipMoment(BaseModel):
    start: float
    end: float
    duration: float
    score: float
    reason: str
    transcript_preview: str
    title_suggestions: List[str]

    text_score: Optional[float] = None
    audio_score: Optional[float] = None
    density_score: Optional[float] = None

    peak_audio_time: Optional[float] = None
    peak_audio_z_score: Optional[float] = None

    reaction_score: Optional[float] = None
    peak_reaction_time: Optional[float] = None
    motion_score: Optional[float] = None
    face_movement_score: Optional[float] = None
    face_size_score: Optional[float] = None

    ai_generated: Optional[bool] = None
    theme: Optional[str] = None
    hook_text: Optional[str] = None
    caption: Optional[str] = None
    description: Optional[str] = None
    hashtags: Optional[List[str]] = None
    pinned_comment: Optional[str] = None


class AnalyzeResponse(BaseModel):
    success: bool
    audio_path: str
    transcript_segments: List[TranscriptSegment]
    clips: List[ClipMoment]


class ExportClipRequest(BaseModel):
    video_path: str
    clips: List[ClipMoment]


class ExportedClip(BaseModel):
    index: int
    start: float
    end: float
    duration: float
    output_path: str
    title_suggestions: List[str]
    file_url: Optional[str] = None
    crop_debug: Optional[dict] = None


class ExportClipResponse(BaseModel):
    success: bool
    exported_clips: List[ExportedClip]


class CropBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


class LayoutDetectionRequest(BaseModel):
    video_path: str


class DetectedBox(BaseModel):
    x: int
    y: int
    width: int
    height: int


class LayoutDetectionResponse(BaseModel):
    success: bool
    layout_type: str
    confidence: float
    video_width: int
    video_height: int
    facecam_box: Optional[DetectedBox] = None
    gameplay_box: Optional[DetectedBox] = None
    reason: str


class ExportSmartVerticalRequest(BaseModel):
    video_path: str
    clips: List[ClipMoment]


class ExportSmartVerticalResponse(BaseModel):
    success: bool
    layout_type: str
    confidence: float
    reason: str
    facecam_box: Optional[DetectedBox] = None
    gameplay_box: Optional[DetectedBox] = None
    exported_clips: List[ExportedClip]


class ExportSmartVerticalSubtitledRequest(BaseModel):
    video_path: str
    clips: List[ClipMoment]
    transcript_segments: List[TranscriptSegment]


class ExportSmartVerticalSubtitledResponse(BaseModel):
    success: bool
    layout_type: str
    confidence: float
    reason: str
    facecam_box: Optional[DetectedBox] = None
    gameplay_box: Optional[DetectedBox] = None
    exported_clips: List[ExportedClip]


class ProjectSummary(BaseModel):
    id: str
    title: str
    video_path: str
    source_type: str
    duration: Optional[float] = None
    transcript_path: Optional[str] = None
    layout_path: Optional[str] = None
    clips_path: Optional[str] = None
    exports_path: Optional[str] = None
    clip_count: int = 0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class ProjectListResponse(BaseModel):
    success: bool
    projects: List[ProjectSummary]


class ProjectDetailResponse(BaseModel):
    success: bool
    project: dict


class SaveProjectDataRequest(BaseModel):
    project_id: str
    data_type: str
    data: Any


class SaveProjectDataResponse(BaseModel):
    success: bool
    path: str

class DeleteProjectResponse(BaseModel):
    success: bool
    deleted_project_id: str
    message: str

class GenerateSocialCopyRequest(BaseModel):
    clip: dict


class GenerateSocialCopyResponse(BaseModel):
    social_copy: dict


class CropPresetRequest(BaseModel):
    video_path: str
    layout: dict


class CropPresetResponse(BaseModel):
    layout_type: str
    video_width: int
    video_height: int
    facecam_box: CropBox
    gameplay_box: CropBox


class ExportCustomVerticalClipRequest(BaseModel):
    video_path: str
    clip: dict
    facecam_box: CropBox
    gameplay_box: CropBox


class ExportCustomVerticalClipResponse(BaseModel):
    exported_clip: ExportedClip

class YouTubePreviewRequest(BaseModel):
    url: str


class YouTubePreviewResponse(BaseModel):
    success: bool
    title: str
    url: str
    thumbnail: str | None = None
    duration: float | None = None
    channel: str | None = None