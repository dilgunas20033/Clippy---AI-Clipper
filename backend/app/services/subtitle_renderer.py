from pathlib import Path
import re


def format_timestamp_ass(seconds: float) -> str:
    """
    ASS format timestamp:
    H:MM:SS.cs
    Example: 0:00:05.23
    """
    seconds = max(0, float(seconds))

    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)
    centiseconds = int((seconds - int(seconds)) * 100)

    return f"{hours}:{minutes:02d}:{secs:02d}.{centiseconds:02d}"


def clean_subtitle_text(text: str) -> str:
    text = text.strip()
    text = re.sub(r"\s+", " ", text)

    # Viral style: uppercase, clean.
    text = text.upper()

    # Avoid extremely long single subtitle lines.
    if len(text) > 70:
        words = text.split()
        midpoint = len(words) // 2
        text = " ".join(words[:midpoint]) + r"\N" + " ".join(words[midpoint:])

    return text


def get_segments_for_clip(transcript_segments: list[dict], clip_start: float, clip_end: float):
    selected = []

    for segment in transcript_segments:
        seg_start = float(segment["start"])
        seg_end = float(segment["end"])

        if seg_end >= clip_start and seg_start <= clip_end:
            relative_start = max(0, seg_start - clip_start)
            relative_end = max(relative_start + 0.4, seg_end - clip_start)

            selected.append({
                "start": relative_start,
                "end": relative_end,
                "text": segment["text"]
            })

    return selected


def create_ass_subtitle_file(
    transcript_segments: list[dict],
    clip_start: float,
    clip_end: float,
    output_path: str
):
    """
    Creates .ass subtitles with viral-style text.
    Good first version:
    - bold
    - white
    - black outline
    - centered
    - near lower-middle
    """

    output = Path(output_path)
    output.parent.mkdir(parents=True, exist_ok=True)

    selected_segments = get_segments_for_clip(
        transcript_segments=transcript_segments,
        clip_start=clip_start,
        clip_end=clip_end
    )

    ass_header = """[Script Info]
Title: AI Clipper Subtitles
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Viral,Arial,78,&H00FFFFFF,&H000000FF,&H00000000,&H7F000000,-1,0,0,0,100,100,0,0,1,6,2,2,80,80,470,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""

    lines = [ass_header]

    for segment in selected_segments:
        text = segment.get("text", "").strip()

        if not text:
            continue

        start_ts = format_timestamp_ass(segment["start"])
        end_ts = format_timestamp_ass(segment["end"])

        lines.append(
            f"Dialogue: 0,{start_ts},{end_ts},Viral,,0,0,0,,{text}\n"
        )

    output.write_text("".join(lines), encoding="utf-8")

    return str(output)