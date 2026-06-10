from pathlib import Path
import shutil
import subprocess
from app.services.subtitle_renderer import create_ass_subtitle_file

from app.config import CLIPS_DIR

def clip_file_url(output_path: str):
    path = Path(output_path).resolve()
    clips_root = CLIPS_DIR.resolve()

    try:
        relative_path = path.relative_to(clips_root)
    except ValueError:
        return None

    return "/clips/" + relative_path.as_posix()

def require_ffmpeg():
    ffmpeg_path = shutil.which("ffmpeg")

    if ffmpeg_path is None:
        raise RuntimeError(
            "FFmpeg was not found. Install FFmpeg and make sure it is available in PATH."
        )

    return ffmpeg_path

def escape_subtitle_path_for_ffmpeg(path: str) -> str:
    """
    FFmpeg subtitle filter on Windows needs escaped paths.
    Example:
    C:\\Users\\name\\file.ass
    becomes:
    C\\:/Users/name/file.ass
    """
    p = Path(path).resolve()
    text = str(p).replace("\\", "/")
    text = text.replace(":", "\\:")
    return text

def run_command(command: list[str]):
    try:
        subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True
        )
    except FileNotFoundError as e:
        raise RuntimeError(
            f"Executable not found while running command:\n{' '.join(command)}\n\n{e}"
        )
    except subprocess.CalledProcessError as e:
        raise RuntimeError(
            f"FFmpeg command failed:\n{' '.join(command)}\n\nSTDERR:\n{e.stderr}"
        )


def safe_filename(name: str) -> str:
    keep = []

    for char in name:
        if char.isalnum() or char in ["-", "_"]:
            keep.append(char)
        elif char.isspace():
            keep.append("_")

    cleaned = "".join(keep).strip("_")

    return cleaned[:80] or "video"


def cut_clip(video_path: str, start: float, end: float, output_path: str):
    ffmpeg_path = require_ffmpeg()
    duration = max(0.1, end - start)

    command = [
        ffmpeg_path,
        "-y",
        "-ss", str(start),
        "-i", video_path,
        "-t", str(duration),
        "-c:v", "libx264",
        "-c:a", "aac",
        "-preset", "veryfast",
        "-crf", "23",
        "-movflags", "+faststart",
        output_path
    ]

    run_command(command)

    return output_path


def export_clips(video_path: str, clips: list[dict]):
    video = Path(video_path)

    if not video.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    project_name = safe_filename(video.stem)
    project_dir = CLIPS_DIR / project_name
    project_dir.mkdir(parents=True, exist_ok=True)

    exported = []

    for index, clip in enumerate(clips, start=1):
        start = float(clip["start"])
        end = float(clip["end"])
        duration = float(clip.get("duration", end - start))

        output_path = project_dir / f"clip_{index:03d}_{int(start)}s_to_{int(end)}s.mp4"

        cut_clip(
            video_path=str(video),
            start=start,
            end=end,
            output_path=str(output_path)
        )

        exported.append({
            "index": index,
            "start": start,
            "end": end,
            "duration": duration,
            "output_path": str(output_path),
            "file_url": clip_file_url(str(output_path)),
            "title_suggestions": clip.get("title_suggestions", []),
        })

    return exported


def box_to_crop_filter(box: dict):
    return f"crop={box['width']}:{box['height']}:{box['x']}:{box['y']}"


def get_video_dimensions(video_path: str):
    """
    Uses ffprobe to get video width and height.
    """
    ffmpeg_path = require_ffmpeg()
    ffprobe_path = str(Path(ffmpeg_path).with_name("ffprobe.exe"))

    if not Path(ffprobe_path).exists():
        ffprobe_path = shutil.which("ffprobe")

    if not ffprobe_path:
        raise RuntimeError("ffprobe was not found. It usually installs with FFmpeg.")

    command = [
        ffprobe_path,
        "-v", "error",
        "-select_streams", "v:0",
        "-show_entries", "stream=width,height",
        "-of", "csv=s=x:p=0",
        video_path,
    ]

    result = subprocess.run(
        command,
        check=True,
        capture_output=True,
        text=True,
    )

    width_text, height_text = result.stdout.strip().split("x")

    return int(width_text), int(height_text)


def clamp(value, min_value, max_value):
    return max(min_value, min(value, max_value))


def smart_gameplay_crop_box(video_width: int, video_height: int, facecam_box: dict):
    """
    Creates a gameplay crop that tries to avoid the original facecam.

    We need a crop that can become 1080x1200 after scaling.
    Target aspect ratio = 1080 / 1200 = 0.9

    For a 1920x1080 source, a 0.9 aspect crop would be:
    width = 972
    height = 1080

    So we crop a vertical-ish area of gameplay, avoiding the facecam side.
    """

    target_ratio = 1080 / 1200

    # Use full source height, then calculate width for 0.9 aspect.
    crop_h = video_height
    crop_w = int(crop_h * target_ratio)

    if crop_w > video_width:
        crop_w = video_width
        crop_h = int(crop_w / target_ratio)

    face_x = facecam_box["x"]
    face_y = facecam_box["y"]
    face_w = facecam_box["width"]
    face_h = facecam_box["height"]

    face_center_x = face_x + face_w / 2
    face_center_y = face_y + face_h / 2

    # Default center crop.
    crop_x = int((video_width - crop_w) / 2)
    crop_y = int((video_height - crop_h) / 2)

    # If facecam is on left, choose right gameplay crop.
    if face_center_x < video_width * 0.40:
        crop_x = video_width - crop_w

    # If facecam is on right, choose left gameplay crop.
    elif face_center_x > video_width * 0.60:
        crop_x = 0

    # If facecam is centered horizontally but top/bottom,
    # keep center x and adjust y.
    if face_center_y < video_height * 0.35:
        crop_y = video_height - crop_h
    elif face_center_y > video_height * 0.65:
        crop_y = 0

    crop_x = clamp(crop_x, 0, video_width - crop_w)
    crop_y = clamp(crop_y, 0, video_height - crop_h)

    return {
        "x": int(crop_x),
        "y": int(crop_y),
        "width": int(crop_w),
        "height": int(crop_h),
    }


def full_vertical_crop_filter():
    """
    Good default for IRL/unknown.
    Center-crops source into 1080x1920.
    """
    return (
        "scale=1080:1920:force_original_aspect_ratio=increase,"
        "crop=1080:1920"
    )


def export_gaming_vertical_clip(
    video_path: str,
    start: float,
    end: float,
    output_path: str,
    facecam_box: dict
):
    """
    Improved gaming layout:
    - top 720px = detected facecam
    - bottom 1200px = gameplay crop that tries to avoid duplicate facecam
    - final output = 1080x1920
    """

    ffmpeg_path = require_ffmpeg()
    duration = max(0.1, end - start)

    video_width, video_height = get_video_dimensions(video_path)

    gameplay_box = smart_gameplay_crop_box(
        video_width=video_width,
        video_height=video_height,
        facecam_box=facecam_box,
    )

    face_crop = box_to_crop_filter(facecam_box)
    game_crop = box_to_crop_filter(gameplay_box)

    filter_complex = (
        f"[0:v]{face_crop},"
        f"scale=1080:720:force_original_aspect_ratio=increase,"
        f"crop=1080:720[face];"

        f"[0:v]{game_crop},"
        f"scale=1080:1200:force_original_aspect_ratio=increase,"
        f"crop=1080:1200[game];"

        f"[face][game]vstack=inputs=2[outv]"
    )

    command = [
        ffmpeg_path,
        "-y",
        "-ss", str(start),
        "-i", video_path,
        "-t", str(duration),
        "-filter_complex", filter_complex,
        "-map", "[outv]",
        "-map", "0:a?",
        "-c:v", "libx264",
        "-c:a", "aac",
        "-preset", "veryfast",
        "-crf", "23",
        "-movflags", "+faststart",
        output_path
    ]

    run_command(command)
    return output_path


def export_custom_gaming_vertical_clip(
    video_path: str,
    start: float,
    end: float,
    output_path: str,
    facecam_box: dict,
    gameplay_box: dict
):
    """
    Custom gaming vertical layout:
    - top 720px = user-selected facecam crop
    - bottom 1200px = user-selected gameplay crop
    - final output = 1080x1920
    """

    ffmpeg_path = require_ffmpeg()
    duration = max(0.1, end - start)

    face_crop = box_to_crop_filter(facecam_box)
    game_crop = box_to_crop_filter(gameplay_box)

    filter_complex = (
        f"[0:v]{face_crop},"
        f"scale=1080:720:force_original_aspect_ratio=increase,"
        f"crop=1080:720[face];"

        f"[0:v]{game_crop},"
        f"scale=1080:1200:force_original_aspect_ratio=increase,"
        f"crop=1080:1200[game];"

        f"[face][game]vstack=inputs=2[outv]"
    )

    command = [
        ffmpeg_path,
        "-y",
        "-ss", str(start),
        "-i", video_path,
        "-t", str(duration),
        "-filter_complex", filter_complex,
        "-map", "[outv]",
        "-map", "0:a?",
        "-c:v", "libx264",
        "-c:a", "aac",
        "-preset", "veryfast",
        "-crf", "23",
        "-movflags", "+faststart",
        output_path,
    ]

    run_command(command)
    return output_path

def export_custom_vertical_clip(
    video_path: str,
    clip: dict,
    facecam_box: dict,
    gameplay_box: dict
):
    """
    Exports one custom vertical clip using user-provided crop boxes.
    """

    video = Path(video_path)

    if not video.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    project_name = safe_filename(video.stem)
    project_dir = CLIPS_DIR / f"{project_name}_custom_vertical"
    project_dir.mkdir(parents=True, exist_ok=True)

    start = float(clip["start"])
    end = float(clip["end"])
    duration = float(clip.get("duration", end - start))

    output_path = project_dir / f"custom_vertical_{int(start)}s_to_{int(end)}s.mp4"

    export_custom_gaming_vertical_clip(
        video_path=str(video),
        start=start,
        end=end,
        output_path=str(output_path),
        facecam_box=facecam_box,
        gameplay_box=gameplay_box,
    )

    return {
        "index": int(clip.get("index", 1)),
        "start": start,
        "end": end,
        "duration": duration,
        "output_path": str(output_path),
        "file_url": clip_file_url(str(output_path)),
        "title_suggestions": clip.get("title_suggestions", []),
        "crop_debug": {
            "facecam_box": facecam_box,
            "gameplay_box": gameplay_box,
            "mode": "custom_vertical",
        },
    }

def export_full_vertical_clip(
    video_path: str,
    start: float,
    end: float,
    output_path: str
):
    """
    IRL/unknown layout:
    - use full video
    - center crop into 1080x1920

    Later, this becomes person-aware framing.
    """

    ffmpeg_path = require_ffmpeg()
    duration = max(0.1, end - start)

    video_filter = full_vertical_crop_filter()

    command = [
        ffmpeg_path,
        "-y",
        "-ss", str(start),
        "-i", video_path,
        "-t", str(duration),
        "-vf", video_filter,
        "-c:v", "libx264",
        "-c:a", "aac",
        "-preset", "veryfast",
        "-crf", "23",
        "-movflags", "+faststart",
        output_path
    ]

    run_command(command)
    return output_path


def export_smart_vertical_clips(
    video_path: str,
    clips: list[dict],
    layout: dict
):
    video = Path(video_path)

    if not video.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    project_name = safe_filename(video.stem)
    layout_type = layout.get("layout_type", "unknown")
    facecam_box = layout.get("facecam_box")

    project_dir = CLIPS_DIR / f"{project_name}_smart_vertical"
    project_dir.mkdir(parents=True, exist_ok=True)

    exported = []

    for index, clip in enumerate(clips, start=1):
        start = float(clip["start"])
        end = float(clip["end"])
        duration = float(clip.get("duration", end - start))

        output_path = project_dir / f"vertical_clip_{index:03d}_{int(start)}s_to_{int(end)}s.mp4"

        crop_debug = None

        if layout_type == "gaming_stream" and facecam_box:
            video_width, video_height = get_video_dimensions(str(video))
            gameplay_box = smart_gameplay_crop_box(
                video_width=video_width,
                video_height=video_height,
                facecam_box=facecam_box,
            )

            crop_debug = {
                "facecam_box": facecam_box,
                "gameplay_box": gameplay_box,
            }

            export_gaming_vertical_clip(
                video_path=str(video),
                start=start,
                end=end,
                output_path=str(output_path),
                facecam_box=facecam_box
            )
        else:
            crop_debug = {
                "mode": "full_vertical_center_crop"
            }

            export_full_vertical_clip(
                video_path=str(video),
                start=start,
                end=end,
                output_path=str(output_path)
            )

        exported.append({
            "index": index,
            "start": start,
            "end": end,
            "duration": duration,
            "output_path": str(output_path),
            "file_url": clip_file_url(str(output_path)),
            "title_suggestions": clip.get("title_suggestions", []),
            "crop_debug": crop_debug,
        })

    return exported

def burn_subtitles_into_video(
    input_video_path: str,
    subtitle_path: str,
    output_path: str
):
    ffmpeg_path = require_ffmpeg()

    escaped_subtitle_path = escape_subtitle_path_for_ffmpeg(subtitle_path)

    video_filter = f"ass='{escaped_subtitle_path}'"

    command = [
        ffmpeg_path,
        "-y",
        "-i", input_video_path,
        "-vf", video_filter,
        "-c:v", "libx264",
        "-c:a", "aac",
        "-preset", "veryfast",
        "-crf", "23",
        "-movflags", "+faststart",
        output_path
    ]

    run_command(command)

    return output_path

def export_smart_vertical_subtitled_clips(
    video_path: str,
    clips: list[dict],
    transcript_segments: list[dict],
    layout: dict
):
    video = Path(video_path)

    if not video.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    project_name = safe_filename(video.stem)
    layout_type = layout.get("layout_type", "unknown")
    facecam_box = layout.get("facecam_box")

    project_dir = CLIPS_DIR / f"{project_name}_smart_vertical_subtitled"
    raw_dir = project_dir / "raw"
    subtitle_dir = project_dir / "subtitles"

    project_dir.mkdir(parents=True, exist_ok=True)
    raw_dir.mkdir(parents=True, exist_ok=True)
    subtitle_dir.mkdir(parents=True, exist_ok=True)

    exported = []

    for index, clip in enumerate(clips, start=1):
        start = float(clip["start"])
        end = float(clip["end"])
        duration = float(clip.get("duration", end - start))

        raw_output_path = raw_dir / f"vertical_clip_{index:03d}_raw.mp4"
        subtitle_path = subtitle_dir / f"vertical_clip_{index:03d}.ass"
        final_output_path = project_dir / f"vertical_clip_{index:03d}_subtitled.mp4"

        crop_debug = None

        # 1. Export smart vertical raw clip.
        if layout_type == "gaming_stream" and facecam_box:
            video_width, video_height = get_video_dimensions(str(video))
            gameplay_box = smart_gameplay_crop_box(
                video_width=video_width,
                video_height=video_height,
                facecam_box=facecam_box,
            )

            crop_debug = {
                "facecam_box": facecam_box,
                "gameplay_box": gameplay_box,
            }

            export_gaming_vertical_clip(
                video_path=str(video),
                start=start,
                end=end,
                output_path=str(raw_output_path),
                facecam_box=facecam_box,
            )
        else:
            crop_debug = {
                "mode": "full_vertical_center_crop",
            }

            export_full_vertical_clip(
                video_path=str(video),
                start=start,
                end=end,
                output_path=str(raw_output_path),
            )

        # 2. Create subtitle file for this clip.
        create_ass_subtitle_file(
            transcript_segments=transcript_segments,
            clip_start=start,
            clip_end=end,
            output_path=str(subtitle_path),
        )

        # 3. Burn subtitles into final video.
        burn_subtitles_into_video(
            input_video_path=str(raw_output_path),
            subtitle_path=str(subtitle_path),
            output_path=str(final_output_path),
        )

        exported.append({
            "index": index,
            "start": start,
            "end": end,
            "duration": duration,
            "output_path": str(final_output_path),
            "file_url": clip_file_url(str(final_output_path)),
            "title_suggestions": clip.get("title_suggestions", []),
            "crop_debug": crop_debug,
        })

    return exported

def get_default_crop_preset(video_path: str, layout: dict):
    """
    Returns default crop boxes for the editor.
    Uses detected facecam box and smart gameplay crop.
    """

    video_width, video_height = get_video_dimensions(video_path)

    layout_type = layout.get("layout_type", "unknown")
    facecam_box = layout.get("facecam_box")

    if layout_type == "gaming_stream" and facecam_box:
        gameplay_box = smart_gameplay_crop_box(
            video_width=video_width,
            video_height=video_height,
            facecam_box=facecam_box,
        )

        return {
            "layout_type": layout_type,
            "video_width": video_width,
            "video_height": video_height,
            "facecam_box": facecam_box,
            "gameplay_box": gameplay_box,
        }

    # Fallback boxes for unknown/IRL.
    # This still gives the editor something usable.
    fallback_facecam_box = {
        "x": int(video_width * 0.25),
        "y": int(video_height * 0.05),
        "width": int(video_width * 0.50),
        "height": int(video_height * 0.35),
    }

    fallback_gameplay_box = {
        "x": int(video_width * 0.25),
        "y": int(video_height * 0.25),
        "width": int(video_width * 0.50),
        "height": int(video_height * 0.70),
    }

    return {
        "layout_type": layout_type,
        "video_width": video_width,
        "video_height": video_height,
        "facecam_box": fallback_facecam_box,
        "gameplay_box": fallback_gameplay_box,
    }