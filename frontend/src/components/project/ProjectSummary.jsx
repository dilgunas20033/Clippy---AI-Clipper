export default function ProjectSummary({
  videoData,
  currentProjectId,
  layoutData,
  analyzeMode,
  styles,
}) {
  return (
    <div style={{ ...styles.card, gridColumn: "span 12" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h2 style={styles.sectionTitle}>
            {videoData
              ? videoData.video_title || "Loaded Project"
              : "No Project Loaded"}
          </h2>

          <p style={styles.muted}>
            {videoData
              ? videoData.video_path
              : "Upload a video or paste a YouTube link to start clipping."}
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={videoData ? styles.goodBadge : styles.warnBadge}>
            {videoData ? "Project Ready" : "Waiting"}
          </span>
        </div>
      </div>

      {videoData && (
        <div style={{ marginTop: "14px" }}>
          <span style={styles.badge}>
            Project ID: {currentProjectId || "Not saved"}
          </span>

          <span style={styles.badge}>
            Duration: {videoData.duration ? `${videoData.duration}s` : "Unknown"}
          </span>

          {videoData.download_quality && (
            <span style={styles.badge}>Quality: {videoData.download_quality}</span>
          )}

          {videoData.cookie_mode_used && (
            <span style={styles.badge}>Cookies: {videoData.cookie_mode_used}</span>
          )}

          {videoData.source_type && (
            <span style={styles.badge}>Source: {videoData.source_type}</span>
          )}

          <span style={styles.badge}>
            Layout: {layoutData?.layout_type || "Not detected"}
          </span>

          <span style={styles.badge}>
            Analyze Mode: {analyzeMode === "deep" ? "Deep" : "Fast"}
          </span>

          {videoData.project_options?.streamType && (
            <span style={styles.badge}>
              Stream: {videoData.project_options.streamType}
            </span>
          )}

          {videoData.project_options?.subtitleStyle && (
            <span style={styles.badge}>
              Subtitles: {videoData.project_options.subtitleStyle}
            </span>
          )}

          {videoData.project_options?.clipGoal && (
            <span style={styles.badge}>
              Goal: {videoData.project_options.clipGoal}
            </span>
          )}

          {videoData.project_options?.exportFormat && (
            <span style={styles.badge}>
              Export: {videoData.project_options.exportFormat}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
