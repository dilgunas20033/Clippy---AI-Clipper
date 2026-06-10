# analyzer.py

from pathlib import Path

from app.config import AUDIO_DIR
from app.services.utils.ffmpeg_helpers import extract_audio
from app.services.transcriber import transcribe_audio
from app.services.clip_detector import detect_clip_moments
from app.services.audio_analyzer import compute_audio_energy
from app.services.reaction_detector import analyze_visual_reactions


def analyze_video_for_clips(
    video_path: str,
    max_clips: int = 50,
    min_score: float = 65,
    min_duration: int = 20,
    max_duration: int = 60,
    use_reaction_detection: bool = False,
):
    video = Path(video_path)

    if not video.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    safe_name = video.stem.replace(" ", "_")
    audio_path = AUDIO_DIR / f"{safe_name}.wav"

    extract_audio(
        video_path=str(video),
        output_path=str(audio_path),
    )

    transcript_segments = transcribe_audio(str(audio_path))

    audio_energy = compute_audio_energy(str(audio_path))

    reaction_data = []

    if use_reaction_detection:
        reaction_data = analyze_visual_reactions(
            str(video),
            sample_every_seconds=3.0,
            max_samples=220,
        )

    clips = detect_clip_moments(
        transcript_segments=transcript_segments,
        audio_energy=audio_energy,
        reaction_data=reaction_data,
        max_clips=max_clips,
        min_score=min_score,
        min_duration=min_duration,
        max_duration=max_duration,
    )

    return {
        "audio_path": str(audio_path),
        "transcript_segments": transcript_segments,
        "audio_energy": audio_energy,
        "reaction_data": reaction_data,
        "clips": clips,
    }