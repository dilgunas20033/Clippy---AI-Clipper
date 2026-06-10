from faster_whisper import WhisperModel


# Use "base" for faster testing.
# Later you can switch to "small" or "medium" for better accuracy.
_model = None


def get_model():
    global _model

    if _model is None:
        _model = WhisperModel(
            "base",
            device="cpu",
            compute_type="int8"
        )

    return _model


def transcribe_audio(audio_path: str):
    model = get_model()

    segments, info = model.transcribe(
        audio_path,
        beam_size=5,
        word_timestamps=False
    )

    transcript_segments = []

    for segment in segments:
        transcript_segments.append({
            "start": float(segment.start),
            "end": float(segment.end),
            "text": segment.text.strip()
        })

    return transcript_segments