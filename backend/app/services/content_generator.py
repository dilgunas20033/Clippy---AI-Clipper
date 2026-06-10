import json
import os
import re
from typing import Dict, List, Optional

from dotenv import load_dotenv

load_dotenv()


try:
    from openai import OpenAI
except ImportError:
    OpenAI = None


OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_CONTENT_MODEL = os.getenv("OPENAI_CONTENT_MODEL", "gpt-4o-mini")


def clean_text(text: str) -> str:
    if not text:
        return ""

    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def safe_json_loads(text: str) -> Optional[dict]:
    """
    Tries to parse model output as JSON.
    Also handles cases where the model accidentally wraps JSON in ```json fences.
    """

    if not text:
        return None

    cleaned = text.strip()

    if cleaned.startswith("```"):
        cleaned = cleaned.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return None


def detect_theme_fallback(text: str, reason: str = "") -> str:
    combined = f"{text} {reason}".lower()

    horror_words = [
        "scared", "scream", "monster", "ghost", "dark", "shadow",
        "behind", "door", "run", "hide", "jumpscare", "jump scare",
        "creepy", "panic", "terrified", "zombie",
    ]

    funny_words = [
        "bro", "nah", "no way", "what", "why", "chat", "laugh",
        "laughing", "cooked", "wild", "stupid",
    ]

    gaming_words = [
        "boss", "fight", "kill", "killed", "dead", "game", "quest",
        "level", "health", "weapon",
    ]

    if any(word in combined for word in horror_words):
        return "horror"

    if any(word in combined for word in funny_words):
        return "funny"

    if any(word in combined for word in gaming_words):
        return "gaming"

    return "general"


def fallback_social_copy_for_clip(clip: Dict) -> Dict:
    """
    Used if OpenAI is unavailable, API key is missing, or JSON parsing fails.
    This keeps the app working no matter what.
    """

    text = clean_text(clip.get("transcript_preview", ""))
    reason = clip.get("reason", "")
    score = float(clip.get("score", 0))
    start = float(clip.get("start", 0))
    end = float(clip.get("end", 0))

    theme = detect_theme_fallback(text, reason)

    if theme == "horror":
        hook = "I WAS NOT READY FOR THIS"
        titles = [
            "This Scare Came Out of Nowhere",
            "I Was Not Ready for This",
            "This Horror Game Got Me Bad",
        ]
        caption = "The timing on this scare was actually insane 😭"
        hashtags = [
            "#shorts", "#gaming", "#horrorgaming", "#scary",
            "#jumpscare", "#streamer", "#gamingclips", "#fyp",
        ]
        pinned_comment = "Would this have scared you too?"

    elif theme == "funny":
        hook = "THIS MOMENT WAS ACTUALLY WILD"
        titles = [
            "This Moment Was Actually Wild",
            "I Have No Idea How This Happened",
            "This Clip Went Off the Rails",
        ]
        caption = "This had no reason to be this funny 😭"
        hashtags = [
            "#shorts", "#funny", "#funnyclips", "#streamer",
            "#gamingclips", "#fyp",
        ]
        pinned_comment = "Was this actually funny or was I cooked?"

    elif theme == "gaming":
        hook = "I DID NOT EXPECT THAT"
        titles = [
            "This Game Caught Me Off Guard",
            "I Did Not Expect That",
            "This Was a Crazy Gaming Moment",
        ]
        caption = "This moment caught me completely off guard."
        hashtags = [
            "#shorts", "#gaming", "#gamingshorts", "#streamer",
            "#gamingclips", "#fyp",
        ]
        pinned_comment = "What would you have done here?"

    else:
        hook = "WAIT FOR IT"
        titles = [
            "This Moment Caught Me Off Guard",
            "This Clip Got Interesting Fast",
            "Wait for What Happens Next",
        ]
        caption = "This moment was too good not to clip."
        hashtags = [
            "#shorts", "#clips", "#streamer", "#highlights",
            "#gamingclips", "#fyp",
        ]
        pinned_comment = "Would you have clipped this moment?"

    if score >= 90:
        titles.insert(0, "This Was the Best Moment of the Stream")

    description = (
        f"This was one of the standout moments from the stream.\n\n"
        f"Clip moment: \"{text[:160]}\"\n\n"
        f"Timestamp: {round(start, 2)}s - {round(end, 2)}s"
    )

    return {
        "ai_generated": False,
        "theme": theme,
        "hook_text": hook,
        "title_suggestions": titles[:5],
        "caption": caption,
        "description": description,
        "hashtags": hashtags[:12],
        "pinned_comment": pinned_comment,
    }


def build_ai_prompt_for_clip(clip: Dict) -> str:
    transcript = clean_text(clip.get("transcript_preview", ""))
    reason = clean_text(clip.get("reason", ""))
    score = clip.get("score", 0)
    start = clip.get("start", 0)
    end = clip.get("end", 0)

    text_score = clip.get("text_score")
    audio_score = clip.get("audio_score")
    reaction_score = clip.get("reaction_score")
    density_score = clip.get("density_score")

    return f"""
You are helping a gaming/streaming creator generate short-form content copy for a detected clip.

Goal:
Create catchy but NOT cringe posting copy for YouTube Shorts, TikTok, and Instagram Reels.

Style rules:
- Make it feel natural, not corporate.
- Do not overuse emojis.
- Avoid cheesy phrases like "you won't believe what happened next" unless the clip truly fits.
- Hooks should be short and punchy.
- Titles should be clickable but not fake.
- Captions should sound like a real streamer posted them.
- Hashtags should be relevant, not spammy.
- If the transcript is weak, infer from the reason and scores.
- Keep everything clean enough for normal platforms.

Clip metadata:
Start: {start}
End: {end}
Overall score: {score}
Reason selected: {reason}
Text score: {text_score}
Audio score: {audio_score}
Reaction score: {reaction_score}
Speech density score: {density_score}

Clip transcript:
\"\"\"{transcript}\"\"\"

Return ONLY valid JSON with this exact shape:
{{
  "theme": "horror | funny | gaming | reaction | clutch | fail | general",
  "hook_text": "short all-caps hook text for overlay",
  "title_suggestions": [
    "title 1",
    "title 2",
    "title 3",
    "title 4",
    "title 5"
  ],
  "caption": "short social caption",
  "description": "YouTube description, 2-4 sentences max",
  "hashtags": ["#tag1", "#tag2", "#tag3"],
  "pinned_comment": "short pinned comment question"
}}
""".strip()


def validate_social_copy(data: dict, fallback: Dict) -> Dict:
    """
    Makes sure the AI response has the fields we need.
    If something is missing, use fallback.
    """

    if not isinstance(data, dict):
        return fallback

    theme = data.get("theme") or fallback["theme"]
    hook_text = data.get("hook_text") or fallback["hook_text"]
    title_suggestions = data.get("title_suggestions") or fallback["title_suggestions"]
    caption = data.get("caption") or fallback["caption"]
    description = data.get("description") or fallback["description"]
    hashtags = data.get("hashtags") or fallback["hashtags"]
    pinned_comment = data.get("pinned_comment") or fallback["pinned_comment"]

    if not isinstance(title_suggestions, list):
        title_suggestions = fallback["title_suggestions"]

    if not isinstance(hashtags, list):
        hashtags = fallback["hashtags"]

    title_suggestions = [
        str(title).strip()
        for title in title_suggestions
        if str(title).strip()
    ][:5]

    hashtags = [
        tag if str(tag).startswith("#") else f"#{str(tag).strip()}"
        for tag in hashtags
        if str(tag).strip()
    ][:12]

    if not title_suggestions:
        title_suggestions = fallback["title_suggestions"]

    if not hashtags:
        hashtags = fallback["hashtags"]

    return {
        "ai_generated": True,
        "theme": str(theme),
        "hook_text": str(hook_text).strip(),
        "title_suggestions": title_suggestions,
        "caption": str(caption).strip(),
        "description": str(description).strip(),
        "hashtags": hashtags,
        "pinned_comment": str(pinned_comment).strip(),
    }


def generate_ai_social_copy_for_clip(clip: Dict) -> Optional[Dict]:
    """
    Uses OpenAI if available.
    Returns None if unavailable or failed.
    """

    if OpenAI is None:
        return None

    if not OPENAI_API_KEY:
        return None

    client = OpenAI(api_key=OPENAI_API_KEY)

    prompt = build_ai_prompt_for_clip(clip)

    try:
        response = client.chat.completions.create(
            model=OPENAI_CONTENT_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You generate concise, non-cringe social media copy "
                        "for gaming and streaming clips. Always return valid JSON only."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            response_format={"type": "json_object"},
            temperature=0.8,
            max_tokens=700,
        )

        content = response.choices[0].message.content
        parsed = safe_json_loads(content)

        if not parsed:
            return None

        fallback = fallback_social_copy_for_clip(clip)
        return validate_social_copy(parsed, fallback)

    except Exception as e:
        print(f"[content_generator] OpenAI generation failed: {e}")
        return None


def generate_social_copy_for_clip(clip: Dict) -> Dict:
    """
    Main function:
    1. Try OpenAI
    2. Fall back to templates
    """

    fallback = fallback_social_copy_for_clip(clip)

    ai_copy = generate_ai_social_copy_for_clip(clip)

    if ai_copy:
        return ai_copy

    return fallback


def add_social_copy_to_clips(clips: List[Dict]) -> List[Dict]:
    """
    Adds AI/fallback social copy to every detected clip.
    """

    enriched = []

    for clip in clips:
        social_copy = generate_social_copy_for_clip(clip)

        enriched.append({
            **clip,
            **social_copy,
        })

    return enriched