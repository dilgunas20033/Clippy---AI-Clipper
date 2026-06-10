import Button from "../common/Button";
import ProjectSummary from "../project/ProjectSummary";
import DashboardStats from "../project/DashboardStats";

function niceValue(value) {
  if (!value) return "Default";

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function ProjectOptionsPanel({ videoData, analyzeMode, projectAnalyzeConfig, styles }) {
  const options = videoData?.project_options || {};

  if (
    !options.streamType &&
    !options.clipGoal &&
    !options.subtitleStyle &&
    !options.analysisMode &&
    !options.exportFormat
  ) {
    return (
      <div style={styles.cardFlat}>
        <h3 style={{ marginTop: 0 }}>Project setup</h3>
        <p style={styles.muted}>
          No setup options are saved for this project yet. New projects created
          through the wizard will show their stream type, clip goal, subtitles,
          analyze mode, and export format here.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.cardFlat}>
      <h3 style={{ marginTop: 0 }}>Project setup</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "10px",
        }}
      >
        <div style={styles.cardFlat}>
          <div style={styles.muted}>Stream type</div>
          <strong>{niceValue(options.streamType)}</strong>
        </div>

        <div style={styles.cardFlat}>
          <div style={styles.muted}>Clip goal</div>
          <strong>{niceValue(options.clipGoal)}</strong>
        </div>

        <div style={styles.cardFlat}>
          <div style={styles.muted}>Subtitles</div>
          <strong>{niceValue(options.subtitleStyle)}</strong>
        </div>

        <div style={styles.cardFlat}>
          <div style={styles.muted}>Analyze mode</div>
          <strong>{niceValue(options.analysisMode || analyzeMode)}</strong>
        </div>

        <div style={styles.cardFlat}>
          <div style={styles.muted}>Export format</div>
          <strong>{niceValue(options.exportFormat)}</strong>
        </div>
      </div>

      {projectAnalyzeConfig && (
        <p style={{ ...styles.muted, marginBottom: 0 }}>
          These choices currently resolve to {projectAnalyzeConfig.maxClips} max
          clips, {projectAnalyzeConfig.minScore}+ score,{" "}
          {projectAnalyzeConfig.minDuration}s–{projectAnalyzeConfig.maxDuration}s
          duration, and {projectAnalyzeConfig.useReactionDetection ? "Deep" : "Fast"} mode.
        </p>
      )}
    </div>
  );
}

function AnalyzeConfigPanel({ projectAnalyzeConfig, styles }) {
  if (!projectAnalyzeConfig) return null;

  const rows = [
    ["Mode", projectAnalyzeConfig.mode],
    ["Max clips", projectAnalyzeConfig.maxClips],
    ["Minimum score", `${projectAnalyzeConfig.minScore}+`],
    [
      "Clip duration",
      `${projectAnalyzeConfig.minDuration}s–${projectAnalyzeConfig.maxDuration}s`,
    ],
    [
      "Reaction detection",
      projectAnalyzeConfig.useReactionDetection ? "On" : "Off",
    ],
  ];

  return (
    <div
      style={{
        ...styles.card,
        gridColumn: "span 12",
        background:
          "linear-gradient(135deg, rgba(99,102,241,0.16), rgba(15,23,42,0.84))",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "18px",
          alignItems: "flex-start",
          marginBottom: "14px",
        }}
      >
        <div>
          <h2 style={styles.sectionTitle}>Analysis plan</h2>
          <p style={styles.muted}>
            This is what will actually be sent to the backend when you run
            analysis. It combines global defaults with this project’s saved
            setup options.
          </p>
        </div>

        <span
          style={
            projectAnalyzeConfig.useReactionDetection
              ? styles.goodBadge
              : styles.badge
          }
        >
          {projectAnalyzeConfig.useReactionDetection ? "Deep Mode" : "Fast Mode"}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "10px",
        }}
      >
        {rows.map(([label, value]) => (
          <div key={label} style={styles.cardFlat}>
            <div style={styles.muted}>{label}</div>
            <strong>{niceValue(value)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function StrategyExplanationPanel({ videoData, styles }) {
  const options = videoData?.project_options || {};
  const notes = [];

  if (options.clipGoal === "best_10") {
    notes.push("Best 10 raises the score threshold and limits results to stronger moments.");
  }

  if (options.clipGoal === "best_25") {
    notes.push("Best 25 uses a balanced threshold for longer streams.");
  }

  if (options.clipGoal === "find_everything") {
    notes.push("Find Everything lowers the score threshold and returns more possible clips.");
  }

  if (options.streamType === "horror_reaction") {
    notes.push("Horror / Reaction forces Deep mode so reaction detection can help find jump scares and loud moments.");
  }

  if (options.streamType === "podcast") {
    notes.push("Podcast / Commentary favors longer clips and keeps analysis fast because transcript flow matters more.");
  }

  if (options.streamType === "irl_talking") {
    notes.push("IRL / Talking allows slightly longer clips for context and commentary.");
  }

  if (notes.length === 0) {
    notes.push("This project is using the default analysis strategy.");
  }

  return (
    <div style={styles.cardFlat}>
      <h3 style={{ marginTop: 0 }}>Why these settings?</h3>

      <div style={{ display: "grid", gap: "8px" }}>
        {notes.map((note) => (
          <p key={note} style={{ ...styles.muted, margin: 0 }}>
            • {note}
          </p>
        ))}
      </div>
    </div>
  );
}

function NextStepPanel({
  videoData,
  clips,
  transcriptSegments,
  layoutData,
  exportedCount,
  setActiveTab,
  handleAnalyze,
  analyzing,
  styles,
}) {
  let title = "Add a video";
  let description = "Create or open a project before running the clip workflow.";
  let actionLabel = "Back to Projects";
  let action = () => setActiveTab("project");
  let variant = "normal";

  if (videoData && clips.length === 0) {
    title = "Run analysis";
    description =
      "Analyze the video to find potential clips. Project setup choices will control the analyze defaults.";
    actionLabel = analyzing ? "Analyzing..." : "Analyze Video";
    action = handleAnalyze;
    variant = "primary";
  } else if (clips.length > 0 && transcriptSegments.length > 0 && !layoutData) {
    title = "Review clips";
    description =
      "Clips are detected. Review the best moments, keep the strong ones, and then detect layout/export.";
    actionLabel = "Review Clips";
    action = () => setActiveTab("clips");
    variant = "primary";
  } else if (clips.length > 0 && layoutData && exportedCount === 0) {
    title = "Export clips";
    description =
      "Layout is ready. Export vertical, subtitled, or horizontal versions from the Clips page.";
    actionLabel = "Go to Clips";
    action = () => setActiveTab("clips");
    variant = "primary";
  } else if (exportedCount > 0) {
    title = "Exports ready";
    description =
      "You have exported clips ready to preview, copy, and use.";
    actionLabel = "View Exports";
    action = () => setActiveTab("exports");
    variant = "primary";
  }

  return (
    <div
      style={{
        ...styles.card,
        background:
          "radial-gradient(circle at top right, rgba(99,102,241,0.22), transparent 34%), rgba(15,23,42,0.82)",
      }}
    >
      <h2 style={styles.sectionTitle}>{title}</h2>
      <p style={styles.muted}>{description}</p>

      <div style={styles.buttonRow}>
        <Button
          onClick={action}
          disabled={analyzing}
          variant={variant}
          styles={styles}
        >
          {actionLabel}
        </Button>
      </div>
    </div>
  );
}

export default function AnalyzePage({
  videoData,
  currentProjectId,
  layoutData,
  analyzeMode,
  setAnalyzeMode,
  updateSetting,
  settings,
  handleAnalyze,
  analyzing,
  handleDetectLayout,
  detectingLayout,
  clips,
  transcriptSegments,
  exportedCount,
  styles,
  renderHeader,
  setActiveTab,
  projectAnalyzeConfig,
}) {
  return (
    <>
      {renderHeader(
        "Overview",
        "Project status, setup choices, analysis, and layout detection."
      )}

      <div style={styles.grid}>
        <div style={{ ...styles.card, gridColumn: "span 12" }}>
          <ProjectSummary
            videoData={videoData}
            currentProjectId={currentProjectId}
            layoutData={layoutData}
            analyzeMode={analyzeMode}
            styles={styles}
          />
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <DashboardStats
            clips={clips}
            transcriptSegments={transcriptSegments}
            exportedCount={exportedCount}
            layoutData={layoutData}
            styles={styles}
          />
        </div>

        <AnalyzeConfigPanel
          projectAnalyzeConfig={projectAnalyzeConfig}
          styles={styles}
        />

        <div style={{ gridColumn: "span 7" }}>
          <NextStepPanel
            videoData={videoData}
            clips={clips}
            transcriptSegments={transcriptSegments}
            layoutData={layoutData}
            exportedCount={exportedCount}
            setActiveTab={setActiveTab}
            handleAnalyze={handleAnalyze}
            analyzing={analyzing}
            styles={styles}
          />
        </div>

        <div style={{ gridColumn: "span 5" }}>
          <ProjectOptionsPanel
            videoData={videoData}
            analyzeMode={analyzeMode}
            projectAnalyzeConfig={projectAnalyzeConfig}
            styles={styles}
          />
        </div>

        <div style={{ gridColumn: "span 12" }}>
          <StrategyExplanationPanel videoData={videoData} styles={styles} />
        </div>

        <div style={{ ...styles.card, gridColumn: "span 6" }}>
          <h2 style={styles.sectionTitle}>Analyze video</h2>

          <p style={styles.muted}>
            Finds the best moments from the video using the analysis plan above.
            Change the strategy in Project Settings if you want different clip
            results.
          </p>

          <div style={styles.buttonRow}>
            <Button
              onClick={() => {
                setAnalyzeMode("fast");
                updateSetting("analyzeMode", "fast");
              }}
              variant={analyzeMode === "fast" ? "primary" : "normal"}
              styles={styles}
            >
              Fast
            </Button>

            <Button
              onClick={() => {
                setAnalyzeMode("deep");
                updateSetting("analyzeMode", "deep");
              }}
              variant={analyzeMode === "deep" ? "primary" : "normal"}
              styles={styles}
            >
              Deep
            </Button>
          </div>

          <p style={styles.muted}>
            Manual mode buttons still work, but saved project settings can
            override them during analysis. For example, Horror / Reaction forces
            Deep mode.
          </p>

          <div style={styles.buttonRow}>
            <Button
              onClick={handleAnalyze}
              disabled={!videoData?.video_path || analyzing}
              variant="primary"
              styles={styles}
            >
              {analyzing ? "Analyzing..." : "Run Analysis"}
            </Button>
          </div>
        </div>

        <div style={{ ...styles.card, gridColumn: "span 6" }}>
          <h2 style={styles.sectionTitle}>Detect layout</h2>

          <p style={styles.muted}>
            Detects gameplay and facecam regions so vertical exports can be cropped
            better. You can run this before or after reviewing clips.
          </p>

          {layoutData ? (
            <div style={{ marginBottom: "14px" }}>
              <span style={styles.goodBadge}>Layout Detected</span>
              {layoutData.layout_type && (
                <span style={styles.badge}>{layoutData.layout_type}</span>
              )}
              {layoutData.confidence && (
                <span style={styles.badge}>
                  Confidence: {layoutData.confidence}
                </span>
              )}
            </div>
          ) : (
            <div style={{ marginBottom: "14px" }}>
              <span style={styles.warnBadge}>No Layout Yet</span>
            </div>
          )}

          <div style={styles.buttonRow}>
            <Button
              onClick={handleDetectLayout}
              disabled={!videoData?.video_path || detectingLayout}
              styles={styles}
            >
              {detectingLayout ? "Detecting..." : "Detect Layout"}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
