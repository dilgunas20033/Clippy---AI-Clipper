import wave
from pathlib import Path
from typing import List, Dict

import numpy as np


def read_wav_mono(audio_path: str):
    """
    Reads the 16kHz mono WAV we already create with FFmpeg.
    Returns sample_rate and float audio samples from -1.0 to 1.0.
    """

    path = Path(audio_path)

    if not path.exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    with wave.open(str(path), "rb") as wav:
        sample_rate = wav.getframerate()
        channels = wav.getnchannels()
        sample_width = wav.getsampwidth()
        frame_count = wav.getnframes()

        raw = wav.readframes(frame_count)

    if sample_width != 2:
        raise RuntimeError(
            f"Expected 16-bit WAV audio, got sample width: {sample_width}"
        )

    audio = np.frombuffer(raw, dtype=np.int16).astype(np.float32)

    if channels > 1:
        audio = audio.reshape(-1, channels).mean(axis=1)

    audio = audio / 32768.0

    return sample_rate, audio


def compute_audio_energy(
    audio_path: str,
    window_seconds: float = 1.0,
    hop_seconds: float = 0.5,
) -> List[Dict]:
    """
    Computes RMS loudness over time.
    Output example:
    [
      {"time": 12.5, "energy": 0.042, "z_score": 2.1, "score": 72}
    ]
    """

    sample_rate, audio = read_wav_mono(audio_path)

    window_size = max(1, int(window_seconds * sample_rate))
    hop_size = max(1, int(hop_seconds * sample_rate))

    rows = []

    for start_sample in range(0, len(audio) - window_size, hop_size):
        end_sample = start_sample + window_size
        chunk = audio[start_sample:end_sample]

        rms = float(np.sqrt(np.mean(chunk * chunk)))
        time_seconds = start_sample / sample_rate

        rows.append({
            "time": round(time_seconds, 2),
            "energy": rms,
        })

    if not rows:
        return []

    energies = np.array([row["energy"] for row in rows], dtype=np.float32)

    mean = float(np.mean(energies))
    std = float(np.std(energies)) or 1e-6

    for row in rows:
        z = (row["energy"] - mean) / std

        # Convert z-score to a 0-100 score.
        # z=0 -> around 25
        # z=1 -> around 45
        # z=2 -> around 65
        # z=3+ -> 85-100
        score = 25 + (z * 20)
        score = max(0, min(100, score))

        row["z_score"] = round(float(z), 2)
        row["score"] = round(float(score), 2)

    return rows


def get_audio_score_for_window(
    audio_energy: List[Dict],
    start: float,
    end: float,
):
    """
    Returns the best audio spike score inside a clip window.
    """

    points = [
        row for row in audio_energy
        if float(row["time"]) >= start and float(row["time"]) <= end
    ]

    if not points:
        return {
            "audio_score": 0,
            "peak_time": None,
            "peak_energy": 0,
            "peak_z_score": 0,
        }

    best = max(points, key=lambda row: row["score"])

    return {
        "audio_score": float(best["score"]),
        "peak_time": float(best["time"]),
        "peak_energy": float(best["energy"]),
        "peak_z_score": float(best["z_score"]),
    }


def find_audio_spike_moments(
    audio_energy: List[Dict],
    min_audio_score: float = 68,
):
    """
    Finds standalone audio spike moments, even if transcript is weak.
    """

    spikes = []

    for row in audio_energy:
        if float(row["score"]) >= min_audio_score:
            spikes.append({
                "time": float(row["time"]),
                "audio_score": float(row["score"]),
                "peak_energy": float(row["energy"]),
                "peak_z_score": float(row["z_score"]),
            })

    # Remove spikes that are too close together.
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