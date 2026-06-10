// ProjectDashboard.jsx

import { useEffect, useState } from "react";
import API from "../api";
import Button from "./common/Button";

function formatDate(value) {
  if (!value) return "Unknown";

  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "Unknown";
  }
}

function formatDuration(seconds) {
  if (!seconds) return "Unknown duration";

  const totalSeconds = Math.round(Number(seconds));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function getProjectStatus(project, processingProject, analyzing) {
  const isProcessingProject = processingProject?.projectId === project.id;

  if (isProcessingProject && processingProject.status === "failed") {
    return {
      label: "Analysis failed",
      progress: 40,
      description: "Check the backend terminal and try analysis again.",
    };
  }

  if (isProcessingProject && processingProject.status === "complete") {
    return {
      label: "Ready",
      progress: 100,
      description: `${processingProject.clipCount || project.clip_count || 0} clips are ready to review.`,
    };
  }

  if (isProcessingProject && analyzing) {
    return {
      label: "Analyzing",
      progress: 62,
      description: "Analysis is running. Clips will appear when it finishes.",
    };
  }

  if (isProcessingProject && processingProject.status === "queued") {
    return {
      label: "Queued",
      progress: 45,
      description: "Project created. Analysis is about to start.",
    };
  }

  if (project.clip_count > 0) {
    return {
      label: "Ready",
      progress: 100,
      description: "Clips are ready to review.",
    };
  }

  if (project.video_path) {
    return {
      label: "Needs analysis",
      progress: 35,
      description: "Video is saved. Run analysis next.",
    };
  }

  return {
    label: "Draft",
    progress: 10,
    description: "Project has been created.",
  };
}

function getStatusStyle(statusLabel, styles) {
  if (statusLabel === "Ready") return styles.goodBadge;
  if (statusLabel === "Needs analysis" || statusLabel === "Analysis failed") {
    return styles.warnBadge;
  }
  return styles.badge;
}

function ProgressBar({ value, styles }) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div
      style={{
        width: "100%",
        height: "9px",
        borderRadius: "999px",
        background: "rgba(255,255,255,0.08)",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <div
        style={{
          width: `${safeValue}%`,
          height: "100%",
          borderRadius: "999px",
          background:
            safeValue >= 100
              ? "linear-gradient(90deg, rgba(34,197,94,0.95), rgba(74,222,128,0.95))"
              : "linear-gradient(90deg, rgba(99,102,241,0.95), rgba(236,72,153,0.85))",
          transition: "width 250ms ease",
        }}
      />
    </div>
  );
}

function ProjectCard({
  project,
  onOpenProject,
  onDeleteProject,
  openingProjectId,
  deletingProjectId,
  currentProjectId,
  processingProject,
  analyzing,
  styles,
}) {
  const status = getProjectStatus(project, processingProject, analyzing);
  const isOpening = openingProjectId === project.id;
  const isCurrentProject = currentProjectId === project.id;
  const isDeleting = deletingProjectId === project.id;

  return (
    <div
      style={{
        ...styles.cardFlat,
        padding: "0",
        overflow: "hidden",
        minHeight: "340px",
        display: "flex",
        flexDirection: "column",
        border: isCurrentProject
          ? "1px solid rgba(129,140,248,0.65)"
          : styles.cardFlat.border,
        boxShadow: isCurrentProject
          ? "0 20px 60px rgba(99,102,241,0.16)"
          : "none",
      }}
    >
      <div
        style={{
          height: "148px",
          background:
            "radial-gradient(circle at 20% 20%, rgba(129,140,248,0.45), transparent 32%), radial-gradient(circle at 80% 40%, rgba(236,72,153,0.28), transparent 28%), linear-gradient(135deg, rgba(15,23,42,0.95), rgba(2,6,23,0.96))",
          borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex",
          alignItems: "flex-end",
          padding: "16px",
          boxSizing: "border-box",
        }}
      >
        <div>
          {isCurrentProject && <span style={styles.goodBadge}>Current</span>}
          <span style={getStatusStyle(status.label, styles)}>{status.label}</span>
          {processingProject?.projectId === project.id && analyzing && (
            <span style={styles.badge}>Processing</span>
          )}
          {project.source_type && (
            <span style={styles.badge}>{project.source_type}</span>
          )}
        </div>
      </div>

      <div
        style={{
          padding: "18px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          flex: 1,
        }}
      >
        <div>
          <h3
            style={{
              margin: "0 0 8px",
              fontSize: "18px",
              letterSpacing: "-0.03em",
              lineHeight: 1.2,
            }}
          >
            {project.title || "Untitled Project"}
          </h3>

          <p
            style={{
              ...styles.muted,
              margin: 0,
              fontSize: "13px",
              wordBreak: "break-word",
            }}
          >
            {project.video_path || "No video path saved"}
          </p>
        </div>

        <div
          style={{
            ...styles.cardFlat,
            padding: "12px",
            background: "rgba(0,0,0,0.18)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "10px",
              alignItems: "center",
              marginBottom: "8px",
            }}
          >
            <strong style={{ fontSize: "13px" }}>{status.label}</strong>
            <span style={{ ...styles.muted, fontSize: "12px" }}>
              {status.progress}%
            </span>
          </div>

          <ProgressBar value={status.progress} styles={styles} />

          <p style={{ ...styles.muted, fontSize: "12px", margin: "8px 0 0" }}>
            {status.description}
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px",
            marginTop: "auto",
          }}
        >
          <span style={styles.badge}>{project.clip_count || 0} clips</span>

          <span style={styles.badge}>{formatDuration(project.duration)}</span>

          <span style={styles.badge}>
            Updated {formatDate(project.updated_at || project.created_at)}
          </span>
        </div>

        <div style={{ ...styles.buttonRow, marginTop: "4px" }}>
          <Button
            onClick={() => onOpenProject(project)}
            disabled={isOpening || isDeleting}
            variant="primary"
            styles={styles}
          >
            {isOpening ? "Opening..." : isCurrentProject ? "Open Current" : "Open Project"}
          </Button>

          <Button
            onClick={() => onDeleteProject(project)}
            disabled={isOpening || isDeleting}
            variant="danger"
            styles={styles}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectDashboard({
  onOpenProject,
  onProjectDeleted,
  currentProjectId,
  processingProject,
  analyzing,
  refreshKey,
  styles,
}) {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [openingProjectId, setOpeningProjectId] = useState(null);
  const [deletingProjectId, setDeletingProjectId] = useState(null);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      setError("");

      const res = await API.get("/projects");
      setProjects(res.data.projects || []);
    } catch (err) {
      console.error(err);
      setError("Failed to load projects. Check the backend terminal.");
    } finally {
      setLoadingProjects(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [refreshKey]);

  const openProject = async (project) => {
    try {
      setOpeningProjectId(project.id);

      const res = await API.get(`/projects/${project.id}`);
      const fullProject = res.data.project || res.data;

      onOpenProject(fullProject);
    } catch (err) {
      console.error(err);
      alert("Failed to open project. Check backend terminal.");
    } finally {
      setOpeningProjectId(null);
    }
  };

  if (loadingProjects) {
    return (
      <div style={styles.cardFlat}>
        <p style={styles.muted}>Loading projects...</p>
      </div>
    );
  }

  const deleteProject = async (project) => {
    const confirmed = window.confirm(
      `Delete "${project.title || "Untitled Project"}" from the dashboard?\n\nThis will NOT delete the video file, clips, exports, or local folders.`
    );

    if (!confirmed) return;

    try {
      setDeletingProjectId(project.id);

      await API.delete(`/projects/${project.id}`);

      setProjects((currentProjects) =>
        currentProjects.filter((currentProject) => currentProject.id !== project.id)
      );

      if (currentProjectId === project.id && onProjectDeleted) {
        onProjectDeleted(project.id);
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete project. Check backend terminal.");
    } finally {
      setDeletingProjectId(null);
    }
  };

  if (error) {
    return (
      <div style={styles.cardFlat}>
        <p style={styles.muted}>{error}</p>

        <div style={styles.buttonRow}>
          <Button onClick={loadProjects} styles={styles}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div
        style={{
          ...styles.cardFlat,
          minHeight: "260px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
        }}
      >
        <div>
          <h3 style={{ marginTop: 0 }}>No projects yet</h3>
          <p style={styles.muted}>
            Create a new project to start clipping your first stream.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {processingProject && (
        <div
          style={{
            ...styles.cardFlat,
            marginBottom: "16px",
            border:
              processingProject.status === "failed"
                ? "1px solid rgba(251,191,36,0.35)"
                : "1px solid rgba(129,140,248,0.35)",
            background:
              "linear-gradient(135deg, rgba(99,102,241,0.13), rgba(15,23,42,0.72))",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "14px",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <div>
              <span
                style={
                  processingProject.status === "complete"
                    ? styles.goodBadge
                    : processingProject.status === "failed"
                    ? styles.warnBadge
                    : styles.badge
                }
              >
                {processingProject.status === "complete"
                  ? "Analysis complete"
                  : processingProject.status === "failed"
                  ? "Analysis failed"
                  : analyzing
                  ? "Analyzing"
                  : "Queued"}
              </span>

              <strong style={{ display: "block", marginTop: "8px" }}>
                {processingProject.title || "Untitled Project"}
              </strong>

              <p style={{ ...styles.muted, margin: "4px 0 0" }}>
                {processingProject.status === "complete"
                  ? `${processingProject.clipCount || 0} clips found.`
                  : processingProject.status === "failed"
                  ? "Open the backend terminal for the error."
                  : "Create + Analyze has started for this project."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "14px",
          alignItems: "center",
          marginBottom: "16px",
        }}
      >
        <p style={{ ...styles.muted, margin: 0 }}>
          {projects.length} saved project{projects.length === 1 ? "" : "s"}
        </p>

        <Button onClick={loadProjects} styles={styles}>
          Refresh
        </Button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px",
        }}
      >
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            onOpenProject={openProject}
            onDeleteProject={deleteProject}
            openingProjectId={openingProjectId}
            deletingProjectId={deletingProjectId}
            currentProjectId={currentProjectId}
            processingProject={processingProject}
            analyzing={analyzing}
            styles={styles}
          />
        ))}
      </div>
    </>
  );
}
