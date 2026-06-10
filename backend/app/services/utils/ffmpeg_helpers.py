import shutil
import subprocess
from pathlib import Path


def require_ffmpeg():
    ffmpeg_path = shutil.which("ffmpeg")

    if ffmpeg_path is None:
        raise RuntimeError(
            "FFmpeg was not found. Install FFmpeg and make sure ffmpeg.exe is available in PATH. "
            "Test it by running: ffmpeg -version"
        )

    return ffmpeg_path


def run_command(command: list[str]):
    try:
        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
        )
        return result

    except FileNotFoundError as e:
        raise RuntimeError(
            f"Executable not found while running command:\n{' '.join(command)}\n\n"
            f"Original error: {e}\n\n"
            "This usually means ffmpeg is not installed or not added to PATH."
        )

    except subprocess.CalledProcessError as e:
        raise RuntimeError(
            f"Command failed:\n{' '.join(command)}\n\nSTDERR:\n{e.stderr}"
        )


def extract_audio(video_path: str, output_path: str):
    ffmpeg_path = require_ffmpeg()

    video = Path(video_path)

    if not video.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    Path(output_path).parent.mkdir(parents=True, exist_ok=True)

    command = [
        ffmpeg_path,
        "-y",
        "-i",
        str(video),
        "-vn",
        "-acodec",
        "pcm_s16le",
        "-ar",
        "16000",
        "-ac",
        "1",
        output_path,
    ]

    run_command(command)

    return output_path