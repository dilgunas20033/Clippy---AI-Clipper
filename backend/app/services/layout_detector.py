from pathlib import Path
from typing import Optional
import cv2
import numpy as np


def get_video_info(video_path: str):
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise RuntimeError(f"Could not open video: {video_path}")

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    duration = frame_count / fps if fps > 0 else 0

    cap.release()

    return {
        "width": width,
        "height": height,
        "frame_count": frame_count,
        "fps": fps,
        "duration": duration,
    }


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


def sample_frames(video_path: str, max_samples: int = 24):
    info = get_video_info(video_path)

    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise RuntimeError(f"Could not open video: {video_path}")

    duration = info["duration"]
    fps = info["fps"]

    # Avoid intro/outro by sampling from 8% to 92%
    start_time = max(0, duration * 0.08)
    end_time = max(start_time + 1, duration * 0.92)

    timestamps = np.linspace(start_time, end_time, max_samples)

    frames = []

    for t in timestamps:
        frame_index = int(t * fps)
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_index)

        ok, frame = cap.read()

        if ok and frame is not None:
            frames.append((t, frame))

    cap.release()

    return frames, info


def expand_box(box, frame_width, frame_height, scale_x=2.6, scale_y=2.4):
    x, y, w, h = box

    cx = x + w / 2
    cy = y + h / 2

    new_w = int(w * scale_x)
    new_h = int(h * scale_y)

    new_x = int(max(0, cx - new_w / 2))
    new_y = int(max(0, cy - new_h / 2))

    if new_x + new_w > frame_width:
        new_w = frame_width - new_x

    if new_y + new_h > frame_height:
        new_h = frame_height - new_y

    return {
        "x": int(new_x),
        "y": int(new_y),
        "width": int(new_w),
        "height": int(new_h),
    }


def boxes_are_close(box_a, box_b, tolerance_ratio=0.12):
    ax, ay, aw, ah = box_a
    bx, by, bw, bh = box_b

    acx = ax + aw / 2
    acy = ay + ah / 2
    bcx = bx + bw / 2
    bcy = by + bh / 2

    avg_w = (aw + bw) / 2
    avg_h = (ah + bh) / 2

    return (
        abs(acx - bcx) <= avg_w * tolerance_ratio * 4
        and abs(acy - bcy) <= avg_h * tolerance_ratio * 4
    )


def cluster_face_boxes(face_boxes):
    clusters = []

    for box in face_boxes:
        placed = False

        for cluster in clusters:
            if boxes_are_close(box, cluster["representative"]):
                cluster["boxes"].append(box)

                xs = [b[0] for b in cluster["boxes"]]
                ys = [b[1] for b in cluster["boxes"]]
                ws = [b[2] for b in cluster["boxes"]]
                hs = [b[3] for b in cluster["boxes"]]

                cluster["representative"] = (
                    int(np.median(xs)),
                    int(np.median(ys)),
                    int(np.median(ws)),
                    int(np.median(hs)),
                )

                placed = True
                break

        if not placed:
            clusters.append({
                "representative": box,
                "boxes": [box],
            })

    clusters.sort(key=lambda c: len(c["boxes"]), reverse=True)

    return clusters


def detect_layout(video_path: str):
    video = Path(video_path)

    if not video.exists():
        raise FileNotFoundError(f"Video file not found: {video_path}")

    frames, info = sample_frames(video_path)
    width = info["width"]
    height = info["height"]

    if not frames:
        return {
            "layout_type": "unknown",
            "confidence": 0.0,
            "video_width": width,
            "video_height": height,
            "facecam_box": None,
            "gameplay_box": None,
            "reason": "Could not sample frames from the video.",
        }

    all_faces = []

    for _, frame in frames:
        faces = detect_faces_in_frame(frame)

        for face in faces:
            x, y, w, h = [int(v) for v in face]
            all_faces.append((x, y, w, h))

    if not all_faces:
        return {
            "layout_type": "unknown",
            "confidence": 0.2,
            "video_width": width,
            "video_height": height,
            "facecam_box": None,
            "gameplay_box": None,
            "reason": "No faces were detected. Using default vertical crop is safest.",
        }

    clusters = cluster_face_boxes(all_faces)
    best_cluster = clusters[0]
    stable_count = len(best_cluster["boxes"])
    sample_count = len(frames)

    x, y, w, h = best_cluster["representative"]

    frame_area = width * height
    face_area = w * h
    face_area_ratio = face_area / frame_area

    face_center_x = x + w / 2
    face_center_y = y + h / 2

    center_distance_x = abs(face_center_x - width / 2) / width
    center_distance_y = abs(face_center_y - height / 2) / height

    stability_ratio = stable_count / sample_count

    expanded_box = expand_box(
        best_cluster["representative"],
        frame_width=width,
        frame_height=height,
    )

    # Facecam usually:
    # - appears consistently
    # - is small relative to full frame
    # - is often off-center/corner
    is_stable = stability_ratio >= 0.25
    is_small_face = face_area_ratio <= 0.035
    is_off_center = center_distance_x >= 0.18 or center_distance_y >= 0.15

    # IRL usually:
    # - face is bigger
    # - face is near center
    # - no separate gameplay region
    is_large_or_center = face_area_ratio > 0.035 or (
        center_distance_x < 0.22 and center_distance_y < 0.22
    )

    if is_stable and is_small_face and is_off_center:
        confidence = min(0.95, 0.45 + stability_ratio)

        return {
            "layout_type": "gaming_stream",
            "confidence": round(confidence, 2),
            "video_width": width,
            "video_height": height,
            "facecam_box": expanded_box,
            "gameplay_box": None,
            "reason": "Detected a stable small face region across sampled frames, likely a facecam overlay.",
        }

    if is_large_or_center:
        confidence = min(0.9, 0.45 + stability_ratio)

        return {
            "layout_type": "irl_stream",
            "confidence": round(confidence, 2),
            "video_width": width,
            "video_height": height,
            "facecam_box": None,
            "gameplay_box": None,
            "reason": "Detected a larger or centered face region, likely single-camera IRL/vlog content.",
        }

    return {
        "layout_type": "unknown",
        "confidence": 0.45,
        "video_width": width,
        "video_height": height,
        "facecam_box": expanded_box,
        "gameplay_box": None,
        "reason": "Face detected, but layout was not confident enough to classify.",
    }