from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

DOWNLOADS_DIR = DATA_DIR / "downloads"
AUDIO_DIR = DATA_DIR / "audio"
CLIPS_DIR = DATA_DIR / "clips"
TEMP_DIR = DATA_DIR / "temp"
PROJECTS_DIR = DATA_DIR / "projects"

DB_PATH = DATA_DIR / "ai_clipper.db"

for folder in [
    DATA_DIR,
    DOWNLOADS_DIR,
    AUDIO_DIR,
    CLIPS_DIR,
    TEMP_DIR,
    PROJECTS_DIR,
]:
    folder.mkdir(parents=True, exist_ok=True)