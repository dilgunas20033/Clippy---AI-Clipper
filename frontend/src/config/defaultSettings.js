export const DEFAULT_SETTINGS = {
  maxClips: 50,
  minScore: 65,
  minDuration: 20,
  maxDuration: 60,
  analyzeMode: "fast",
  downloadQuality: "1080p",
  defaultExportType: "subtitled_vertical",
};

export const readSavedSettings = () => {
  try {
    const saved = localStorage.getItem("ai_clipper_settings");

    if (!saved) return DEFAULT_SETTINGS;

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(saved),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
};