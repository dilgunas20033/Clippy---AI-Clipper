from pathlib import Path
from typing import List, Dict, Optional
import cv2
import numpy as np

from app.services.layout_detector import detect_layout


def detect_faces_in_frame(frame):
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
    face_cascade = cv2.CascadeClassifier(cascade_path)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(40, 40),
    )

    return faces


def crop_frame(frame, box: Optional[dict]):
    if not box:
        return frame

    h, w = frame.shape[:2]

    x = max(0, int(box["x"]))
    y = max(0, int(box["y"]))
    bw = max(1, int(box["width"]))
    bh = max(1, int(box["height"]))

    x2 = min(w, x + bw)
    y2 = min(h, y + bh)

    return frame[y:y2, x:x2]


def get_largest_face(faces):
    if len(faces) == 0:
        return None

    return max(faces, key=lambda f: f[2] * f[3])


def analyze_visual_reactions(
    video_path: str,
    sample_every_seconds: float = 1.0,
    max_samples: int = 600,
):
    """
    Returns visual reaction scores over time.

    MVP scoring uses:
    - face center movement
    - face size changes
    - frame motion inside facecam/person area

    Output:
    [
      {
        "time": 120.0,
        "reaction_score": 74.2,
        "motion_score": 65.1,
        "face_movement_score": 80.0,
        "face_size_score": 30.0
      }
    ]
    """

    video = Path(video_path)

    if not video.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    layout = detect_layout(video_path)
    layout_type = layout.get("layout_type", "unknown")
    facecam_box = layout.get("facecam_box")

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise RuntimeError(f"Could not open video: {video_path}")

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = frame_count / fps if fps > 0 else 0

    if duration <= 0:
        cap.release()
        return []

    # For gaming streams, analyze the facecam crop.
    # For IRL/unknown, analyze the full frame.
    active_box = facecam_box if layout_type == "gaming_stream" else None

    timestamps = np.arange(0, duration, sample_every_seconds)

    if len(timestamps) > max_samples:
        timestamps = np.linspace(0, duration, max_samples)

    rows = []

    prev_gray = None
    prev_face_center = None
    prev_face_area = None

    for timestamp in timestamps:
        frame_index = int(timestamp * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)

        ok, frame = cap.read()

        if not ok or frame is None:
            continue

        region = crop_frame(frame, active_box)

        if region.size == 0:
            continue

        small = cv2.resize(region, (320, 180))
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)

        faces = detect_faces_in_frame(small)
        largest_face = get_largest_face(faces)

        motion_score = 0.0
        face_movement_score = 0.0
        face_size_score = 0.0

        if prev_gray is not None:
            diff = cv2.absdiff(gray, prev_gray)
            motion = float(np.mean(diff))

            # Normalize rough motion score.
            # Values around 3-8 = normal, 15+ = strong movement.
            motion_score = min(100.0, motion * 5.5)

        if largest_face is not None:
            x, y, w, h = [float(v) for v in largest_face]

            face_center = (x + w / 2, y + h / 2)
            face_area = w * h

            if prev_face_center is not None:
                dx = face_center[0] - prev_face_center[0]
                dy = face_center[1] - prev_face_center[1]
                distance = (dx * dx + dy * dy) ** 0.5

                # Movement of 20px+ in 320x180 crop is noticeable.
                face_movement_score = min(100.0, distance * 4.0)

            if prev_face_area is not None and prev_face_area > 0:
                area_change_ratio = abs(face_area - prev_face_area) / prev_face_area

                # 20% size change = noticeable leaning/moving.
                face_size_score = min(100.0, area_change_ratio * 250.0)

            prev_face_center = face_center
            prev_face_area = face_area

        # Weighted visual reaction score.
        reaction_score = (
            motion_score * 0.45
            + face_movement_score * 0.40
            + face_size_score * 0.15
        )

        rows.append({
            "time": round(float(timestamp), 2),
            "reaction_score": round(float(reaction_score), 2),
            "motion_score": round(float(motion_score), 2),
            "face_movement_score": round(float(face_movement_score), 2),
            "face_size_score": round(float(face_size_score), 2),
        })

        prev_gray = gray

    cap.release()

    return rows


def get_reaction_score_for_window(
    reaction_data: List[Dict],
    start: float,
    end: float,
):
    points = [
        row for row in reaction_data
        if float(row["time"]) >= start and float(row["time"]) <= end
    ]

    if not points:
        return {
            "reaction_score": 0,
            "peak_reaction_time": None,
            "motion_score": 0,
            "face_movement_score": 0,
            "face_size_score": 0,
        }

    best = max(points, key=lambda row: row["reaction_score"])

    return {
        "reaction_score": float(best["reaction_score"]),
        "peak_reaction_time": float(best["time"]),
        "motion_score": float(best["motion_score"]),
        "face_movement_score": float(best["face_movement_score"]),
        "face_size_score": float(best["face_size_score"]),
    }


def find_reaction_spike_moments(
    reaction_data: List[Dict],
    min_reaction_score: float = 55,
):
    spikes = []

    for row in reaction_data:
        if float(row["reaction_score"]) >= min_reaction_score:
            spikes.append({
                "time": float(row["time"]),
                "reaction_score": float(row["reaction_score"]),
                "motion_score": float(row["motion_score"]),
                "face_movement_score": float(row["face_movement_score"]),
                "face_size_score": float(row["face_size_score"]),
            })

    selected = []

    for spike in spikes:
        too_close = False

        for chosen in selected:
            if abs(spike["time"] - chosen["time"]) < 20:
                too_close = True
                break

        if not too_close:
            selected.append(spike)

    return selected