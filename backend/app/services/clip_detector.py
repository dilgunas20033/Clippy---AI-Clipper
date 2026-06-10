import re
from typing import List, Dict, Optional

from app.services.audio_analyzer import get_audio_score_for_window, find_audio_spike_moments

from app.services.reaction_detector import (
    get_reaction_score_for_window,
    find_reaction_spike_moments,
)


VIRAL_PHRASES = {
    "no way": 18,
    "what": 10,
    "what the": 14,
    "oh my god": 20,
    "oh my gosh": 18,
    "bro": 8,
    "wait": 8,
    "hold on": 10,
    "are you serious": 18,
    "that scared me": 22,
    "i'm scared": 16,
    "im scared": 16,
    "why": 7,
    "run": 12,
    "go go go": 14,
    "nah": 10,
    "no no no": 18,
    "he's right there": 16,
    "it's right there": 16,
    "i can't": 10,
    "i cant": 10,
    "that was crazy": 16,
    "this is insane": 18,
    "i was not ready": 20,
    "yo": 8,
    "stop": 8,
    "chill": 8,
    "relax": 8,
    "look at this": 10,
    "look at that": 10,
    "this is crazy": 16,
    "this is wild": 16,
}


def clean_text(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower()).strip()


def phrase_score(text: str) -> int:
    cleaned = clean_text(text)
    score = 0

    for phrase, points in VIRAL_PHRASES.items():
        if phrase in cleaned:
            score += points

    repeated_words = ["wait", "no", "bro", "what", "yo", "run", "stop"]

    for word in repeated_words:
        pattern = rf"\b({word})\b.*\b({word})\b"
        if re.search(pattern, cleaned):
            score += 8

    return min(score, 50)


def generate_titles(text: str) -> List[str]:
    cleaned = clean_text(text)

    if "scared" in cleaned or "no no no" in cleaned:
        return [
            "This Scare Got Me Bad",
            "I Was Not Ready For This",
            "The Timing Was Actually Terrible",
            "This Horror Moment Caught Me Off Guard",
            "I Should Not Have Looked Away"
        ]

    if "oh my god" in cleaned or "no way" in cleaned:
        return [
            "I Could Not Believe This Happened",
            "No Way This Actually Happened",
            "This Moment Was Insane",
            "I Was Not Ready For That",
            "The Craziest Moment From The Stream"
        ]

    if "bro" in cleaned or "what" in cleaned:
        return [
            "Bro What Just Happened",
            "This Completely Caught Me Off Guard",
            "I Was So Confused Here",
            "This Game Had Me Lost",
            "The Most Random Moment Ever"
        ]

    return [
        "This Moment Caught Me Off Guard",
        "I Was Not Ready For This",
        "This Stream Moment Was Too Good",
        "This Clip Is Actually Wild",
        "The Timing Was Perfect"
    ]


def build_window_text(segments: List[Dict], start: float, end: float) -> str:
    lines = []

    for segment in segments:
        if segment["end"] >= start and segment["start"] <= end:
            lines.append(segment["text"])

    return " ".join(lines).strip()


def score_candidate(
    transcript_segments: List[Dict],
    start: float,
    end: float,
    audio_energy: Optional[List[Dict]] = None,
    reaction_data: Optional[List[Dict]] = None,
):
    window_text = build_window_text(transcript_segments, start, end)

    text_score = phrase_score(window_text)

    word_count = len(window_text.split())
    density_score = min(word_count / 4, 20)

    audio_data = {
        "audio_score": 0,
        "peak_time": None,
        "peak_energy": 0,
        "peak_z_score": 0,
    }

    if audio_energy:
        audio_data = get_audio_score_for_window(audio_energy, start, end)

    reaction_info = {
        "reaction_score": 0,
        "peak_reaction_time": None,
        "motion_score": 0,
        "face_movement_score": 0,
        "face_size_score": 0,
    }

    if reaction_data:
        reaction_info = get_reaction_score_for_window(
            reaction_data,
            start,
            end
        )

    audio_score = audio_data["audio_score"]
    reaction_score = reaction_info["reaction_score"]

    final_score = (
        28
        + (text_score * 0.70)
        + (audio_score * 0.30)
        + (reaction_score * 0.25)
        + (density_score * 0.70)
    )

    final_score = max(0, min(100, final_score))

    reasons = []

    if text_score >= 15:
        reasons.append("strong reaction phrase")

    if audio_score >= 68:
        reasons.append("audio spike")

    if reaction_score >= 55:
        reasons.append("visual reaction")

    if density_score >= 10:
        reasons.append("dense speech moment")

    if not reasons:
        reasons.append("possible highlight moment")

    return {
        "score": round(final_score, 2),
        "text_score": round(float(text_score), 2),
        "audio_score": round(float(audio_score), 2),
        "reaction_score": round(float(reaction_score), 2),
        "density_score": round(float(density_score), 2),
        "peak_audio_time": audio_data["peak_time"],
        "peak_audio_z_score": audio_data["peak_z_score"],
        "peak_reaction_time": reaction_info["peak_reaction_time"],
        "motion_score": reaction_info["motion_score"],
        "face_movement_score": reaction_info["face_movement_score"],
        "face_size_score": reaction_info["face_size_score"],
        "reason": "Detected " + ", ".join(reasons),
        "transcript_preview": window_text[:280],
        "title_suggestions": generate_titles(window_text),
    }

def create_clip_window(center: float, min_duration: int, max_duration: int):
    preferred_duration = min(max(35, min_duration), max_duration)

    start = max(0, center - 12)
    end = start + preferred_duration

    duration = end - start

    if duration < min_duration:
        end = start + min_duration

    if duration > max_duration:
        end = start + max_duration

    return start, end


def detect_clip_moments(
    transcript_segments: List[Dict],
    audio_energy: Optional[List[Dict]] = None,
    reaction_data: Optional[List[Dict]] = None,
    max_clips: int = 50,
    min_score: float = 65,
    min_duration: int = 20,
    max_duration: int = 60
):
    if not transcript_segments:
        return []

    candidates = []

    # 1. Transcript-based candidates
    for segment in transcript_segments:
        base_text = segment["text"]
        base_score = phrase_score(base_text)

        if base_score <= 0:
            continue

        center = (segment["start"] + segment["end"]) / 2
        start, end = create_clip_window(center, min_duration, max_duration)

        scored = score_candidate(
            transcript_segments=transcript_segments,
            start=start,
            end=end,
            audio_energy=audio_energy,
            reaction_data=reaction_data,
        )

        if scored["score"] < min_score:
            continue

        candidates.append({
            "start": round(start, 2),
            "end": round(end, 2),
            "duration": round(end - start, 2),
            **scored,
        })

    # 2. Audio-only candidates
    # This catches screams/laughs/jumpscares even if transcript has weak text.
    if audio_energy:
        audio_spikes = find_audio_spike_moments(
            audio_energy=audio_energy,
            min_audio_score=72,
        )

        for spike in audio_spikes:
            center = spike["time"]
            start, end = create_clip_window(center, min_duration, max_duration)

            scored = score_candidate(
                transcript_segments=transcript_segments,
                start=start,
                end=end,
                audio_energy=audio_energy,
            )

            # Audio-only candidates can pass at a slightly lower text score,
            # but still need a strong final score.
            if scored["score"] < min_score:
                continue

            candidates.append({
                "start": round(start, 2),
                "end": round(end, 2),
                "duration": round(end - start, 2),
                **scored,
            })

        # 3. Reaction-only candidates
    # This catches visual reactions even if audio/transcript is weak.
    if reaction_data:
        reaction_spikes = find_reaction_spike_moments(
            reaction_data=reaction_data,
            min_reaction_score=60,
        )

        for spike in reaction_spikes:
            center = spike["time"]
            start, end = create_clip_window(center, min_duration, max_duration)

            scored = score_candidate(
                transcript_segments=transcript_segments,
                start=start,
                end=end,
                audio_energy=audio_energy,
                reaction_data=reaction_data,
            )

            if scored["score"] < min_score:
                continue

            candidates.append({
                "start": round(start, 2),
                "end": round(end, 2),
                "duration": round(end - start, 2),
                **scored,
            })

    candidates.sort(key=lambda x: x["score"], reverse=True)

    selected = []

    for candidate in candidates:
        overlaps = False

        for chosen in selected:
            overlap_start = max(candidate["start"], chosen["start"])
            overlap_end = min(candidate["end"], chosen["end"])
            overlap = max(0, overlap_end - overlap_start)

            if overlap > 8:
                overlaps = True
                break

            distance = abs(candidate["start"] - chosen["start"])
            if distance < 45:
                overlaps = True
                break

        if not overlaps:
            selected.append(candidate)

        if len(selected) >= max_clips:
            break

    selected.sort(key=lambda x: x["start"])

    return selected