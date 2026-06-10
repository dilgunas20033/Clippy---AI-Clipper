import subprocess
from pathlib import Path
from app.config import AUDIO_DIR


def extract_audio(video_path: str) -> str:
    video_file = Path(video_path)
    audio_path = AUDIO_DIR / f"{video_file.stem}.wav"

    command = [
        "ffmpeg",
        "-y",
        "-i", str(video_file),
        "-vn",
        "-acodec", "pcm_s16le",
        "-ar", "16000",
        "-ac", "1",
        str(audio_path),
    ]

    subprocess.run(command, check=True)

    return str(audio_path)