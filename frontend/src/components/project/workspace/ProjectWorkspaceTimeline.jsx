function TimelineStep({ step, index, isLast, styles }) {
  const isDone = step.state === "done";
  const isActive = step.state === "active";

  return (
    <div
      style={{
        position: "relative",
        flex: "1 1 150px",
        minWidth: "150px",
      }}
    >
      {!isLast && (
        <div
          style={{
            position: "absolute",
            top: "22px",
            left: "calc(50% + 24px)",
            right: "calc(-50% + 24px)",
            height: "2px",
            background: isDone
              ? "rgba(74,222,128,0.45)"
              : "rgba(255,255,255,0.08)",
            zIndex: 0,
          }}
        />
      )}

      <div
        style={{
          ...styles.cardFlat,
          position: "relative",
          zIndex: 1,
          height: "100%",
          padding: "14px",
          border: isActive
            ? "1px solid rgba(129,140,248,0.75)"
            : isDone
            ? "1px solid rgba(74,222,128,0.35)"
            : styles.cardFlat.border,
          background: isActive
            ? "linear-gradient(135deg, rgba(99,102,241,0.20), rgba(236,72,153,0.08))"
            : isDone
            ? "rgba(34,197,94,0.08)"
            : "rgba(255,255,255,0.035)",
        }}
      >
        <div
          style={{
            width: "34px",
            height: "34px",
            borderRadius: "999px",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 900,
            fontSize: "13px",
            marginBottom: "10px",
            background: isDone
              ? "rgba(34,197,94,0.22)"
              : isActive
              ? "rgba(99,102,241,0.30)"
              : "rgba(255,255,255,0.06)",
            color: isDone || isActive ? "#fff" : "#94a3b8",
            border: isActive
              ? "1px solid rgba(129,140,248,0.65)"
              : "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {isDone ? "✓" : index + 1}
        </div>

        <div
          style={{
            color: isActive ? "#c4b5fd" : isDone ? "#86efac" : "#64748b",
            fontSize: "11px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "5px",
          }}
        >
          {isDone ? "Complete" : isActive ? "Current" : "Pending"}
        </div>

        <strong style={{ display: "block", marginBottom: "6px" }}>
          {step.label}
        </strong>

        <p style={{ ...styles.muted, margin: 0, fontSize: "12px" }}>
          {step.description}
        </p>
      </div>
    </div>
  );
}

function getTimelineSteps(workspaceContext) {
  const hasVideo = workspaceContext?.project?.hasVideo;
  const hasClips = workspaceContext?.status?.hasClips;
  const hasSubtitles = workspaceContext?.status?.hasSubtitles;
  const hasExports = workspaceContext?.status?.hasExports;

  return [
    {
      label: "Video",
      description: hasVideo ? "Video is loaded and ready." : "Add or open a video.",
      complete: hasVideo,
      active: !hasVideo,
    },
    {
      label: "Analyze",
      description: hasClips ? "Highlight moments detected." : "Find clip-worthy moments.",
      complete: hasClips,
      active: hasVideo && !hasClips,
    },
    {
      label: "Review",
      description: hasClips ? "Review, keep, skip, or export clips." : "Waiting for analysis.",
      complete: false,
      active: hasClips && !hasExports,
    },
    {
      label: "Subtitles",
      description: hasSubtitles ? "Transcript is available." : "Generated after analysis.",
      complete: hasSubtitles,
      active: hasClips && !hasSubtitles,
    },
    {
      label: "Export",
      description: hasExports ? "Final clips are exported." : "Export selected clips.",
      complete: hasExports,
      active: hasClips && !hasExports,
    },
  ].map((step) => ({
    ...step,
    state: step.complete ? "done" : step.active ? "active" : "pending",
  }));
}

function getProgressPercent(steps) {
  const completeCount = steps.filter((step) => step.state === "done").length;
  return Math.round((completeCount / steps.length) * 100);
}

export default function ProjectWorkspaceTimeline({ workspaceContext, styles }) {
  const steps = getTimelineSteps(workspaceContext);
  const progressPercent = getProgressPercent(steps);
  const isReady = workspaceContext?.status?.hasExports;

  return (
    <div
      style={{
        ...styles.card,
        marginBottom: "22px",
        padding: "18px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "14px",
          alignItems: "flex-start",
          marginBottom: "16px",
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
            Project progress
          </div>

          <h2
            style={{
              margin: "0 0 6px",
              fontSize: "22px",
              letterSpacing: "-0.03em",
            }}
          >
            {isReady ? "Ready to post" : "Clip workflow"}
          </h2>

          <p style={{ ...styles.muted, margin: 0 }}>
            Track the project from source video to final exports.
          </p>
        </div>

        <div style={{ textAlign: "right" }}>
          <span style={isReady ? styles.goodBadge : styles.badge}>
            {progressPercent}% complete
          </span>

          <div
            style={{
              marginTop: "10px",
              width: "150px",
              height: "8px",
              borderRadius: "999px",
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                borderRadius: "999px",
                background: isReady
                  ? "linear-gradient(90deg, rgba(34,197,94,0.95), rgba(74,222,128,0.95))"
                  : "linear-gradient(90deg, rgba(99,102,241,0.95), rgba(236,72,153,0.85))",
              }}
            />
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        {steps.map((step, index) => (
          <TimelineStep
            key={step.label}
            step={step}
            index={index}
            isLast={index === steps.length - 1}
            styles={styles}
          />
        ))}
      </div>
    </div>
  );
}
