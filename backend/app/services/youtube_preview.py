import yt_dlp


def get_youtube_preview(url: str) -> dict:
    ydl_opts = {
        "quiet": True,
        "skip_download": True,
        "noplaylist": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    thumbnails = info.get("thumbnails") or []
    thumbnail = info.get("thumbnail")

    if thumbnails:
        best_thumbnail = thumbnails[-1]
        thumbnail = best_thumbnail.get("url") or thumbnail

    return {
        "success": True,
        "title": info.get("title") or "Untitled YouTube Video",
        "url": url,
        "thumbnail": thumbnail,
        "duration": info.get("duration"),
        "channel": info.get("channel") or info.get("uploader"),
    }