// ProjectPage.jsx

import { useState } from "react";
import ProjectDashboard from "../ProjectDashboard";
import ProjectSummary from "./ProjectSummary";
import NewProjectModal from "./NewProjectModal";
import Button from "../common/Button";

function ProcessingProjectBanner({ analyzing, processingProject, styles, setActiveTab }) {
  if (!processingProject) return null;

  const isComplete = processingProject.status === "complete";
  const isFailed = processingProject.status === "failed";
  const isQueued = processingProject.status === "queued";

  const badgeStyle = isComplete
    ? styles.goodBadge
    : isFailed
    ? styles.warnBadge
    : styles.badge;

  const title = isComplete
    ? "Analysis complete"
    : isFailed
    ? "Analysis failed"
    : isQueued
    ? "Analysis queued"
    : "Analyzing project";

  const description = isComplete
    ? `${processingProject.clipCount || 0} clips are ready to review.`
    : isFailed
    ? "Something went wrong. Check the backend terminal and try again."
    : "The project was created and analysis is running in the app.";

  return (
    <div
      style={{
        ...styles.card,
        marginBottom: "18px",
        background:
          "radial-gradient(circle at 0% 0%, rgba(99,102,241,0.20), transparent 32%), rgba(15,23,42,0.86)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "18px",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <div>
          <span style={badgeStyle}>
            {isComplete ? "Complete" : isFailed ? "Needs attention" : analyzing ? "Running" : "Queued"}
          </span>

          <h2 style={{ ...styles.sectionTitle, marginTop: "12px" }}>
            {title}
          </h2>

          <p style={{ ...styles.muted, marginBottom: 0 }}>
            {processingProject.title || "Untitled Project"} — {description}
          </p>
        </div>

        <div style={styles.buttonRow}>
          <Button
            onClick={() => setActiveTab(isComplete ? "clips" : "analyze")}
            variant="primary"
            styles={styles}
          >
            {isComplete ? "Review Clips" : "View Analysis"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectPage({
  videoData,
  currentProjectId,
  layoutData,
  analyzeMode,
  resetForNewVideo,
  analyzing,
  processingProject,
  handleOpenProject,
  onProjectDeleted,
  setActiveTab,
  styles,
}) {
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);

  const handleProjectCreated = (data) => {
    const shouldStartAnalysis = Boolean(data.should_start_analysis);

    resetForNewVideo(data, {
      startAnalysis: shouldStartAnalysis,
    });

    setDashboardRefreshKey((current) => current + 1);
    setShowNewProjectModal(false);

    setTimeout(() => {
      setActiveTab(shouldStartAnalysis ? "analyze" : "project");
    }, 0);
  };

  return (
    <>
      <div
        style={{
          minHeight: "100vh",
          padding: "34px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            maxWidth: "1380px",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
              alignItems: "flex-start",
              marginBottom: "28px",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "#c4b5fd",
                  fontSize: "13px",
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: "10px",
                }}
              >
                AI Clipper
              </div>

              <h1
                style={{
                  ...styles.title,
                  fontSize: "44px",
                }}
              >
                Projects
              </h1>

              <p
                style={{
                  ...styles.subtitle,
                  maxWidth: "660px",
                }}
              >
                Start a new stream project or continue editing clips from a saved
                one. Keep the homepage simple: projects, new project, and debug.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "flex-end",
              }}
            >
              <Button
                onClick={() => setActiveTab("settings")}
                styles={styles}
              >
                Debug / Settings
              </Button>

              <Button
                onClick={() => setShowNewProjectModal(true)}
                variant="primary"
                styles={styles}
              >
                + New Project
              </Button>
            </div>
          </div>

          <ProcessingProjectBanner
            analyzing={analyzing}
            processingProject={processingProject}
            styles={styles}
            setActiveTab={setActiveTab}
          />

          {videoData && (
            <div style={{ marginBottom: "18px" }}>
              <ProjectSummary
                videoData={videoData}
                currentProjectId={currentProjectId}
                layoutData={layoutData}
                analyzeMode={analyzeMode}
                styles={styles}
              />

              <div style={{ ...styles.buttonRow, marginBottom: "18px" }}>
                <Button onClick={() => setActiveTab("clips")} variant="primary" styles={styles}>
                  Open Current Project
                </Button>

                <Button onClick={() => setActiveTab("analyze")} styles={styles}>
                  Analyze / Layout
                </Button>
              </div>
            </div>
          )}

          <div style={styles.grid}>
            <div style={{ ...styles.card, gridColumn: "span 12" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "16px",
                  alignItems: "center",
                  marginBottom: "16px",
                }}
              >
                <div>
                  <h2 style={styles.sectionTitle}>Your Projects</h2>
                  <p style={styles.muted}>
                    Pick a saved project to continue reviewing clips, editing crop,
                    subtitles, and exports.
                  </p>
                </div>

                <Button
                  onClick={() => setShowNewProjectModal(true)}
                  variant="primary"
                  styles={styles}
                >
                  + New Project
                </Button>
              </div>

              <ProjectDashboard
                onOpenProject={handleOpenProject}
                onProjectDeleted={onProjectDeleted}
                currentProjectId={currentProjectId}
                processingProject={processingProject}
                analyzing={analyzing}
                refreshKey={dashboardRefreshKey}
                styles={styles}
              />
            </div>
          </div>
        </div>
      </div>

      {showNewProjectModal && (
        <NewProjectModal
          onClose={() => setShowNewProjectModal(false)}
          onProjectCreated={handleProjectCreated}
          styles={styles}
        />
      )}
    </>
  );
}
