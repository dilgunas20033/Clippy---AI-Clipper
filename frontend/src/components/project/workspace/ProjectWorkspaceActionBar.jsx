import Button from "../../common/Button";

function getPrimaryAction(workspaceContext) {
  const hasVideo = workspaceContext?.project?.hasVideo;
  const hasClips = workspaceContext?.status?.hasClips;
  const hasExports = workspaceContext?.status?.hasExports;

  if (!hasVideo) {
    return {
      title: "Open a project",
      description: "Start from the Projects dashboard before using workspace actions.",
      label: "Projects",
      tab: "project",
      type: "tab",
    };
  }

  if (!hasClips) {
    return {
      title: "Ready to analyze",
      description: "Find the best moments using this project’s saved strategy.",
      label: "Run Analysis",
      type: "analyze",
    };
  }

  if (!hasExports) {
    return {
      title: "Review detected clips",
      description: "Pick the clips worth exporting and clean up weak moments.",
      label: "Review Clips",
      tab: "clips",
      type: "tab",
    };
  }

  return {
    title: "Exports ready",
    description: "Preview the finished clips and grab what you need.",
    label: "View Exports",
    tab: "exports",
    type: "tab",
  };
}

function SecondaryAction({
  label,
  disabled,
  onClick,
  active,
  styles,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        border: active
          ? "1px solid rgba(129,140,248,0.55)"
          : "1px solid rgba(255,255,255,0.08)",
        background: active
          ? "rgba(99,102,241,0.16)"
          : "rgba(255,255,255,0.035)",
        color: disabled ? "#64748b" : "#e5e7eb",
        borderRadius: "12px",
        padding: "10px 12px",
        fontSize: "13px",
        fontWeight: 800,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {label}
    </button>
  );
}

export default function ProjectWorkspaceActionBar({
  workspaceContext,
  setActiveTab,
  handleAnalyze,
  analyzing,
  handleDetectLayout,
  detectingLayout,
  styles,
}) {
  const hasVideo = workspaceContext?.project?.hasVideo;
  const hasClips = workspaceContext?.status?.hasClips;
  const hasSubtitles = workspaceContext?.status?.hasSubtitles;
  const hasExports = workspaceContext?.status?.hasExports;
  const primaryAction = getPrimaryAction(workspaceContext);

  const runPrimaryAction = () => {
    if (primaryAction.type === "analyze") {
      handleAnalyze();
      return;
    }

    if (primaryAction.type === "tab") {
      setActiveTab(primaryAction.tab);
    }
  };

  return (
    <div
      style={{
        ...styles.card,
        marginBottom: "22px",
        padding: "18px",
        background:
          "radial-gradient(circle at 0% 0%, rgba(129,140,248,0.16), transparent 32%), rgba(15,23,42,0.82)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: "18px",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              color: "#c4b5fd",
              fontSize: "11px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "6px",
            }}
          >
            Next best action
          </div>

          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "22px",
              letterSpacing: "-0.03em",
            }}
          >
            {primaryAction.title}
          </h2>

          <p style={{ ...styles.muted, margin: 0 }}>
            {primaryAction.description}
          </p>
        </div>

        <Button
          onClick={runPrimaryAction}
          disabled={analyzing || (primaryAction.type === "analyze" && !hasVideo)}
          variant="primary"
          styles={styles}
        >
          {analyzing && primaryAction.type === "analyze"
            ? "Analyzing..."
            : primaryAction.label}
        </Button>
      </div>

      <div
        style={{
          marginTop: "16px",
          paddingTop: "16px",
          borderTop: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          flexWrap: "wrap",
          gap: "10px",
        }}
      >
        <SecondaryAction
          label={analyzing ? "Analyzing..." : hasClips ? "Re-analyze" : "Run Analysis"}
          disabled={!hasVideo || analyzing}
          active={!hasClips && hasVideo}
          onClick={handleAnalyze}
          styles={styles}
        />

        <SecondaryAction
          label={detectingLayout ? "Detecting..." : "Detect Layout"}
          disabled={!hasVideo || detectingLayout}
          onClick={handleDetectLayout}
          styles={styles}
        />

        <SecondaryAction
          label="Review Clips"
          disabled={!hasClips}
          active={hasClips && !hasExports}
          onClick={() => setActiveTab("clips")}
          styles={styles}
        />

        <SecondaryAction
          label="Subtitles"
          disabled={!hasSubtitles}
          onClick={() => setActiveTab("subtitles")}
          styles={styles}
        />

        <SecondaryAction
          label="Exports"
          disabled={!hasExports}
          active={hasExports}
          onClick={() => setActiveTab("exports")}
          styles={styles}
        />

        <SecondaryAction
          label="Project Settings"
          onClick={() => setActiveTab("project-settings")}
          styles={styles}
        />
      </div>
    </div>
  );
}
