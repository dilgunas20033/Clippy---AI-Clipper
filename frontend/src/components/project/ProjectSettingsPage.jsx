import { useState } from "react";
import Button from "../common/Button";

const STREAM_TYPES = [
  { id: "gaming", label: "Gaming" },
  { id: "horror_reaction", label: "Horror / Reaction" },
  { id: "irl_talking", label: "IRL / Talking" },
  { id: "podcast", label: "Podcast / Commentary" },
];

const SUBTITLE_STYLES = [
  { id: "clean_white", label: "Clean White" },
  { id: "bold_yellow", label: "Bold Yellow" },
  { id: "gaming_neon", label: "Gaming Neon" },
  { id: "horror_red", label: "Horror Red" },
];

const CLIP_GOALS = [
  { id: "best_10", label: "Best 10" },
  { id: "best_25", label: "Best 25" },
  { id: "find_everything", label: "Find Everything" },
];

const EXPORT_FORMATS = [
  { id: "subtitled_vertical", label: "Subtitled Vertical" },
  { id: "vertical", label: "Vertical" },
  { id: "horizontal", label: "Horizontal" },
  { id: "both", label: "Both" },
];

function SelectField({ label, value, options, onChange, styles }) {
  return (
    <label style={{ display: "grid", gap: "8px" }}>
      <span style={{ color: "#cbd5e1", fontWeight: 800 }}>{label}</span>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          ...styles.input,
          cursor: "pointer",
        }}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export default function ProjectSettingsPage({
  videoData,
  analyzeMode,
  updateProjectOptions,
  styles,
  renderHeader,
}) {
  const savedOptions = videoData?.project_options || {};

  const [draftOptions, setDraftOptions] = useState({
    streamType: savedOptions.streamType || "gaming",
    subtitleStyle: savedOptions.subtitleStyle || "clean_white",
    clipGoal: savedOptions.clipGoal || "best_25",
    analysisMode: savedOptions.analysisMode || analyzeMode || "fast",
    exportFormat: savedOptions.exportFormat || "subtitled_vertical",
  });

  const [saving, setSaving] = useState(false);

  const updateDraft = (key, value) => {
    setDraftOptions((current) => {
      const next = {
        ...current,
        [key]: value,
      };

      if (key === "streamType" && value === "horror_reaction") {
        next.analysisMode = "deep";
        next.subtitleStyle = "horror_red";
      }

      if (key === "streamType" && value === "gaming") {
        next.analysisMode = "fast";
      }

      return next;
    });
  };

  const saveOptions = async () => {
    try {
      setSaving(true);
      await updateProjectOptions(draftOptions);
      alert("Project settings saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save project settings.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {renderHeader(
        "Project Settings",
        "Update this project’s clip strategy without changing global app settings."
      )}

      <div style={styles.grid}>
        <div style={{ ...styles.card, gridColumn: "span 8" }}>
          <h2 style={styles.sectionTitle}>Clip strategy</h2>

          <p style={styles.muted}>
            These settings are saved to this project only. They control analysis
            defaults and future export behavior.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "16px",
              marginTop: "18px",
            }}
          >
            <SelectField
              label="Stream type"
              value={draftOptions.streamType}
              options={STREAM_TYPES}
              onChange={(value) => updateDraft("streamType", value)}
              styles={styles}
            />

            <SelectField
              label="Clip goal"
              value={draftOptions.clipGoal}
              options={CLIP_GOALS}
              onChange={(value) => updateDraft("clipGoal", value)}
              styles={styles}
            />

            <SelectField
              label="Subtitle style"
              value={draftOptions.subtitleStyle}
              options={SUBTITLE_STYLES}
              onChange={(value) => updateDraft("subtitleStyle", value)}
              styles={styles}
            />

            <SelectField
              label="Analysis mode"
              value={draftOptions.analysisMode}
              options={[
                { id: "fast", label: "Fast" },
                { id: "deep", label: "Deep" },
              ]}
              onChange={(value) => updateDraft("analysisMode", value)}
              styles={styles}
            />

            <SelectField
              label="Export format"
              value={draftOptions.exportFormat}
              options={EXPORT_FORMATS}
              onChange={(value) => updateDraft("exportFormat", value)}
              styles={styles}
            />
          </div>

          <div style={{ ...styles.buttonRow, marginTop: "20px" }}>
            <Button
              onClick={saveOptions}
              disabled={!videoData || saving}
              variant="primary"
              styles={styles}
            >
              {saving ? "Saving..." : "Save Project Settings"}
            </Button>
          </div>
        </div>

        <div style={{ ...styles.card, gridColumn: "span 4" }}>
          <h2 style={styles.sectionTitle}>Current saved setup</h2>

          <pre style={styles.pre}>
            {JSON.stringify(savedOptions || {}, null, 2)}
          </pre>

          <p style={styles.muted}>
            Global Debug / Settings still controls fallback defaults. This page
            only changes the current project.
          </p>
        </div>

        <div style={{ ...styles.card, gridColumn: "span 12" }}>
          <h2 style={styles.sectionTitle}>Project info</h2>

          <div style={{ display: "grid", gap: "10px" }}>
            <p style={styles.muted}>
              <strong>Title:</strong>{" "}
              {videoData?.video_title || videoData?.title || "Untitled Project"}
            </p>

            <p style={{ ...styles.muted, wordBreak: "break-word" }}>
              <strong>Video path:</strong> {videoData?.video_path || "No video loaded"}
            </p>

            <p style={styles.muted}>
              <strong>Project ID:</strong> {videoData?.project_id || "No project id"}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
