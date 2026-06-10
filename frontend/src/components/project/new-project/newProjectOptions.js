export const STREAM_TYPES = [
  { id: "gaming", label: "Gaming", description: "Best for gameplay, funny moments, and normal stream highlights." },
  { id: "horror_reaction", label: "Horror / Reaction", description: "Better for jump scares, facecam reactions, and loud moments." },
  { id: "irl_talking", label: "IRL / Talking", description: "Best for commentary, storytime, and face-focused clips." },
  { id: "podcast", label: "Podcast / Commentary", description: "Subtitle-heavy clips with stronger transcript focus." },
];

export const SUBTITLE_STYLES = [
  { id: "clean_white", label: "Clean White", description: "Simple and readable." },
  { id: "bold_yellow", label: "Bold Yellow", description: "More attention-grabbing." },
  { id: "gaming_neon", label: "Gaming Neon", description: "Higher-energy gaming style." },
  { id: "horror_red", label: "Horror Red", description: "Better for scary clips." },
];

export const CLIP_GOALS = [
  { id: "best_10", label: "Best 10", description: "Stricter. Only strong moments." },
  { id: "best_25", label: "Best 25", description: "Balanced for longer streams." },
  { id: "find_everything", label: "Find Everything", description: "Looser. More clips to review." },
];

export const EXPORT_FORMATS = [
  { id: "subtitled_vertical", label: "Subtitled Vertical", description: "Best for TikTok, Shorts, and Reels." },
  { id: "vertical", label: "Vertical", description: "Vertical crop without burned subtitles." },
  { id: "horizontal", label: "Horizontal", description: "Standard stream highlight format." },
  { id: "both", label: "Both", description: "Prepare vertical and horizontal export options." },
];

export const DEFAULT_PROJECT_OPTIONS = {
  streamType: "gaming",
  subtitleStyle: "clean_white",
  clipGoal: "best_25",
  analysisMode: "fast",
  exportFormat: "subtitled_vertical",
};


export const PROCESS_MODES = [
  {
    id: "create_only",
    label: "Create Only",
    description: "Add the project now. Analyze it manually from the workspace.",
  },
  {
    id: "create_and_analyze",
    label: "Create + Analyze",
    description: "Create the project and immediately start analysis after creation.",
  },
];
