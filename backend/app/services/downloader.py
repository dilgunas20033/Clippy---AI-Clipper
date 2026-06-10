from pathlib import Path
import shutil
from typing import Optional, Dict, Any

import yt_dlp

from app.config import DOWNLOADS_DIR


def get_format_selector(quality: str) -> str:
    """
    Returns yt-dlp format selectors.

    best:
      Best video + best audio, merged to mp4 if possible.

    1080p:
      Best video up to 1080p + best audio.

    720p:
      Best video up to 720p + best audio.

    fast_720p:
      Prefer already-merged mp4 up to 720p when possible.
      Usually faster because there is less merging/conversion.
    """

    quality = (quality or "best").lower().strip()

    if quality == "1080p":
        return (
            "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/"
            "bestvideo[height<=1080]+bestaudio/"
            "best[height<=1080]/best"
        )

    if quality == "720p":
        return (
            "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/"
            "bestvideo[height<=720]+bestaudio/"
            "best[height<=720]/best"
        )

    if quality == "fast_720p":
        return (
            "best[height<=720][ext=mp4]/"
            "bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/"
            "best[height<=720]/best"
        )

    return (
        "bestvideo[ext=mp4]+bestaudio[ext=m4a]/"
        "bestvideo+bestaudio/"
        "best"
    )


def get_download_options(url: str, quality: str, cookie_mode: str = "none") -> Dict[str, Any]:
    DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)

    output_template = str(DOWNLOADS_DIR / "%(title).120s_%(id)s.%(ext)s")

    options = {
        "format": get_format_selector(quality),
        "outtmpl": output_template,
        "merge_output_format": "mp4",
        "noplaylist": True,
        "quiet": False,
        "no_warnings": False,
        "retries": 3,
        "fragment_retries": 3,
        "continuedl": True,
        "windowsfilenames": True,
        "restrictfilenames": True,
        "ignoreerrors": False,
        "prefer_ffmpeg": True,
        "postprocessors": [
            {
                "key": "FFmpegVideoConvertor",
                "preferedformat": "mp4",
            }
        ],
    }

    cookies_txt = Path("data/cookies.txt")

    if cookie_mode == "cookies_txt" and cookies_txt.exists():
        options["cookiefile"] = str(cookies_txt)

    elif cookie_mode == "edge":
        options["cookiesfrombrowser"] = ("edge",)

    elif cookie_mode == "firefox":
        options["cookiesfrombrowser"] = ("firefox",)

    elif cookie_mode == "chrome":
        options["cookiesfrombrowser"] = ("chrome",)

    return options


def find_downloaded_file(info: dict) -> Optional[str]:
    """
    yt-dlp may return requested_downloads, filepath, _filename, etc.
    This helper tries the common places.
    """

    requested_downloads = info.get("requested_downloads") or []

    for item in requested_downloads:
        filepath = item.get("filepath")
        if filepath and Path(filepath).exists():
            return filepath

    filepath = info.get("filepath")
    if filepath and Path(filepath).exists():
        return filepath

    filename = info.get("_filename")
    if filename and Path(filename).exists():
        return filename

    # Last fallback: look for newest mp4 in downloads.
    mp4_files = list(DOWNLOADS_DIR.glob("*.mp4"))

    if mp4_files:
        newest = max(mp4_files, key=lambda p: p.stat().st_mtime)
        return str(newest)

    return None


def get_downloaded_video_info(file_path: str, info: dict, quality: str, cookie_mode: str):
    return {
        "video_title": info.get("title") or Path(file_path).stem,
        "video_path": file_path,
        "duration": info.get("duration"),
        "source_type": "youtube",
        "cookie_mode_used": cookie_mode,
        "download_quality": quality,
    }


def try_download_with_cookie_mode(url: str, quality: str, cookie_mode: str):
    ydl_opts = get_download_options(
        url=url,
        quality=quality,
        cookie_mode=cookie_mode,
    )

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    if not info:
        raise RuntimeError("yt-dlp did not return video info.")

    file_path = find_downloaded_file(info)

    if not file_path:
        raise RuntimeError("Download finished, but downloaded file could not be found.")

    return get_downloaded_video_info(
        file_path=file_path,
        info=info,
        quality=quality,
        cookie_mode=cookie_mode,
    )


def download_video(url: str, quality: str = "best"):
    """
    Main downloader.

    Tries:
    1. backend/data/cookies.txt
    2. Edge cookies
    3. Firefox cookies
    4. Chrome cookies
    5. No cookies

    This keeps your previous working behavior but adds quality selection.
    """

    quality = (quality or "best").lower().strip()

    allowed_qualities = {"best", "1080p", "720p", "fast_720p"}

    if quality not in allowed_qualities:
        quality = "best"

    cookie_modes = []

    cookies_txt = Path("data/cookies.txt")
    if cookies_txt.exists():
        cookie_modes.append("cookies_txt")

    cookie_modes.extend(["edge", "firefox", "chrome", "none"])

    errors = []

    for cookie_mode in cookie_modes:
        try:
            print(f"[downloader] Trying quality={quality}, cookie_mode={cookie_mode}")

            return try_download_with_cookie_mode(
                url=url,
                quality=quality,
                cookie_mode=cookie_mode,
            )

        except Exception as e:
            error_message = f"{cookie_mode}: {e}"
            print(f"[downloader] Failed with {error_message}")
            errors.append(error_message)

    raise RuntimeError(
        "All download methods failed.\n\n"
        + "\n\n".join(errors)
    )