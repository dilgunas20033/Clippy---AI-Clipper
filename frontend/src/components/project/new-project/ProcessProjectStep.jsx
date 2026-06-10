import Button from "../../common/Button";
import ProjectProcessSummary from "./ProjectProcessSummary";
import { OptionCard } from "./WizardParts";
import { PROCESS_MODES } from "./newProjectOptions";

function ProcessChecklist({ processMode, styles }) {
  const shouldAnalyze = processMode === "create_and_analyze";

  const items = [
    {
      label: "Create project",
      description: "Save the video and setup choices to the dashboard.",
      status: "ready",
    },
    {
      label: "Run analysis",
      description: shouldAnalyze
        ? "Start analysis right after the project is created."
        : "Skip automatic analysis. You can run it later from the workspace.",
      status: shouldAnalyze ? "ready" : "manual",
    },
    {
      label: "Review clips",
      description: "After analysis, review the clips before exporting.",
      status: "next",
    },
  ];

  return (
    <div style={styles.cardFlat}>
      <h3 style={{ marginTop: 0 }}>What happens next</h3>

      <div style={{ display: "grid", gap: "10px" }}>
        {items.map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              gap: "12px",
              alignItems: "flex-start",
              padding: "10px",
              borderRadius: "14px",
              background: "rgba(255,255,255,0.035)",
              border: "1px solid rgba(255,255,255,0.07)",
            }}
          >
            <span
              style={
                item.status === "ready"
                  ? styles.goodBadge
                  : item.status === "manual"
                  ? styles.warnBadge
                  : styles.badge
              }
            >
              {item.status === "ready"
                ? "Ready"
                : item.status === "manual"
                ? "Manual"
                : "Next"}
            </span>

            <div>
              <strong>{item.label}</strong>
              <p style={{ ...styles.muted, margin: "4px 0 0" }}>
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ProcessProjectStep({
  pendingVideoData,
  projectOptions,
  processMode,
  setProcessMode,
  setStep,
  handleFinishProject,
  styles,
}) {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <ProjectProcessSummary
        pendingVideoData={pendingVideoData}
        projectOptions={projectOptions}
        styles={styles}
      />

      <div style={styles.cardFlat}>
        <h3 style={{ marginTop: 0 }}>Processing mode</h3>

        <p style={styles.muted}>
          Choose whether the app should only create the project or immediately
          start analysis after creation.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "12px",
          }}
        >
          {PROCESS_MODES.map((mode) => (
            <OptionCard
              key={mode.id}
              selected={processMode === mode.id}
              label={mode.label}
              description={mode.description}
              onClick={() => setProcessMode(mode.id)}
              styles={styles}
            />
          ))}
        </div>
      </div>

      <ProcessChecklist processMode={processMode} styles={styles} />

      <div
        style={{
          ...styles.cardFlat,
          background:
            "radial-gradient(circle at top right, rgba(99,102,241,0.18), transparent 34%), rgba(15,23,42,0.78)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>
          {processMode === "create_and_analyze"
            ? "Ready to create and analyze"
            : "Ready to create project"}
        </h3>

        <p style={styles.muted}>
          {processMode === "create_and_analyze"
            ? "This creates the project and tells the app to start analysis next."
            : "This creates the project and returns you to the dashboard."}
        </p>

        <div style={{ ...styles.buttonRow, justifyContent: "space-between" }}>
          <Button onClick={() => setStep(3)} styles={styles}>
            Back
          </Button>

          <Button
            onClick={handleFinishProject}
            disabled={!pendingVideoData}
            variant="primary"
            styles={styles}
          >
            {processMode === "create_and_analyze"
              ? "Create + Analyze"
              : "Create Project"}
          </Button>
        </div>
      </div>
    </div>
  );
}
