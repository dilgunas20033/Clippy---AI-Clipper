import ProjectWorkspaceNavbar from "./ProjectWorkspaceNavbar";

function niceValue(value) {
  if (!value) return "Default";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function HeaderStat({ label, value, active, styles }) {
  return (
    <div
      style={{
        ...styles.cardFlat,
        padding: "10px 12px",
        minWidth: "96px",
        background: active ? "rgba(34,197,94,0.08)" : "rgba(255,255,255,0.035)",
        border: active
          ? "1px solid rgba(74,222,128,0.25)"
          : "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <div style={{ ...styles.muted, fontSize: "11px", marginBottom: "4px" }}>
        {label}
      </div>
      <strong style={{ fontSize: "15px" }}>{value}</strong>
    </div>
  );
}

function OptionBadge({ label, value, styles }) {
  if (!value) return null;

  return (
    <span
      style={{
        ...styles.badge,
        textTransform: "none",
      }}
    >
      {label}: {niceValue(value)}
    </span>
  );
}

export default function ProjectWorkspaceHeader({
  activeTab,
  setActiveTab,
  videoData,
  clips,
  transcriptSegments,
  exportedCount,
  styles,
  workspaceContext,
}) {
  const project = workspaceContext?.project || {};
  const counts = workspaceContext?.counts || {};
  const options = project.options || videoData?.project_options || {};

  const title =
    project.title || videoData?.video_title || videoData?.title || "Untitled Project";
  const sourceType = project.sourceType || videoData?.source_type || "local";
  const projectId = project.id || videoData?.project_id || "No project id";
  const videoPath = project.videoPath || videoData?.video_path || "No video path loaded";

  const currentView = workspaceContext?.view || activeTab;
  const currentTitle = workspaceContext?.title || "Workspace";
  const currentDescription = workspaceContext?.description || "";

  const clipCount = counts.clips ?? clips.length;
  const selectedClipCount = counts.selectedClips ?? 0;
  const subtitleCount = counts.subtitles ?? transcriptSegments.length;
  const exportCount = counts.exports ?? exportedCount;

  return (
    <div
      style={{
        ...styles.card,
        marginBottom: "22px",
        padding: "0",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "22px",
          background:
            "radial-gradient(circle at 12% 20%, rgba(129,140,248,0.24), transparent 30%), radial-gradient(circle at 88% 0%, rgba(236,72,153,0.16), transparent 34%), rgba(15,23,42,0.88)",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab("project")}
          style={{
            border: "none",
            background: "transparent",
            color: "#a5b4fc",
            fontWeight: 900,
            cursor: "pointer",
            padding: 0,
            marginBottom: "12px",
          }}
        >
          ← Back to Projects
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0, 1fr) auto",
            gap: "22px",
            alignItems: "start",
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                color: "#c4b5fd",
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}
            >
              Workspace / {currentView} / {currentTitle}
            </div>

            <h1
              style={{
                margin: "0 0 10px",
                fontSize: "34px",
                letterSpacing: "-0.05em",
                lineHeight: 1.05,
              }}
            >
              {title}
            </h1>

            {currentDescription && (
              <p
                style={{
                  ...styles.muted,
                  margin: "0 0 10px",
                  maxWidth: "760px",
                }}
              >
                {currentDescription}
              </p>
            )}

            <p
              style={{
                ...styles.muted,
                margin: 0,
                wordBreak: "break-word",
                fontSize: "13px",
              }}
            >
              {videoPath}
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(96px, 1fr))",
              gap: "10px",
              minWidth: "220px",
            }}
          >
            <HeaderStat
              label="Clips"
              value={clipCount}
              active={clipCount > 0}
              styles={styles}
            />
            <HeaderStat
              label="Selected"
              value={selectedClipCount}
              active={selectedClipCount > 0}
              styles={styles}
            />
            <HeaderStat
              label="Subtitles"
              value={subtitleCount}
              active={subtitleCount > 0}
              styles={styles}
            />
            <HeaderStat
              label="Exports"
              value={exportCount}
              active={exportCount > 0}
              styles={styles}
            />
          </div>
        </div>
      </div>

      <div style={{ padding: "16px 22px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginBottom: "14px",
          }}
        >
          <span style={styles.goodBadge}>Project Workspace</span>
          <span style={styles.badge}>Source: {niceValue(sourceType)}</span>
          <span style={styles.badge}>ID: {projectId}</span>

          <OptionBadge label="Stream" value={options.streamType} styles={styles} />
          <OptionBadge label="Goal" value={options.clipGoal} styles={styles} />
          <OptionBadge label="Subtitles" value={options.subtitleStyle} styles={styles} />
          <OptionBadge label="Analyze" value={options.analysisMode} styles={styles} />
          <OptionBadge label="Export" value={options.exportFormat} styles={styles} />
        </div>

        <ProjectWorkspaceNavbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          workspaceContext={workspaceContext}
          styles={styles}
        />
      </div>
    </div>
  );
}
