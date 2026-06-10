import { formatDuration, niceValue } from "./WizardParts";

function SummaryItem({ label, value, styles }) {
  return (
    <div style={styles.cardFlat}>
      <div style={{ ...styles.muted, fontSize: "12px", marginBottom: "5px" }}>
        {label}
      </div>
      <strong>{value}</strong>
    </div>
  );
}

export default function ProjectProcessSummary({
  pendingVideoData,
  projectOptions,
  styles,
}) {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div
        style={{
          ...styles.cardFlat,
          border: "1px solid rgba(74,222,128,0.25)",
          background:
            "linear-gradient(135deg, rgba(34,197,94,0.08), rgba(15,23,42,0.78))",
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          {pendingVideoData?.video_title ||
            pendingVideoData?.title ||
            "Video ready"}
        </h3>

        <div>
          <span style={styles.goodBadge}>Video Ready</span>
          {pendingVideoData?.source_type && (
            <span style={styles.badge}>
              Source: {pendingVideoData.source_type}
            </span>
          )}
          {pendingVideoData?.duration && (
            <span style={styles.badge}>
              Duration: {formatDuration(pendingVideoData.duration)}
            </span>
          )}
        </div>

        <p style={{ ...styles.muted, wordBreak: "break-word" }}>
          {pendingVideoData?.video_path || "No path returned"}
        </p>
      </div>

      <div style={styles.cardFlat}>
        <h3 style={{ marginTop: 0 }}>Project setup</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "10px",
          }}
        >
          <SummaryItem
            label="Stream type"
            value={niceValue(projectOptions.streamType)}
            styles={styles}
          />

          <SummaryItem
            label="Clip goal"
            value={niceValue(projectOptions.clipGoal)}
            styles={styles}
          />

          <SummaryItem
            label="Subtitles"
            value={niceValue(projectOptions.subtitleStyle)}
            styles={styles}
          />

          <SummaryItem
            label="Analysis"
            value={niceValue(projectOptions.analysisMode)}
            styles={styles}
          />

          <SummaryItem
            label="Export"
            value={niceValue(projectOptions.exportFormat)}
            styles={styles}
          />
        </div>
      </div>
    </div>
  );
}
