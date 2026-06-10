import SidebarButton from "../../layout/SidebarButton";
import { WORKSPACE_TABS } from "./workspaceTabs";

function getSidebarCount(tabId, workspaceContext) {
  if (tabId === "clips") {
    return workspaceContext.counts.selectedClips > 0
      ? `${workspaceContext.counts.selectedClips}/${workspaceContext.counts.clips}`
      : workspaceContext.counts.clips;
  }

  if (tabId === "clip-workflow" && workspaceContext.focusedClip.displayIndex) {
    return workspaceContext.focusedClip.displayIndex;
  }

  if (tabId === "subtitles") return workspaceContext.counts.subtitles;
  if (tabId === "exports") return workspaceContext.counts.exports;

  return undefined;
}

function MiniStatus({ label, value, active, styles }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        gap: "10px",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span style={{ ...styles.muted, fontSize: "12px" }}>{label}</span>
      <span style={active ? styles.goodBadge : styles.badge}>{value}</span>
    </div>
  );
}

export default function ProjectWorkspaceSidebar({
  activeTab,
  setActiveTab,
  workspaceContext,
  styles,
}) {
  const projectTitle = workspaceContext?.project?.title || "Untitled Project";

  return (
    <aside style={styles.sidebar}>
      <div style={styles.logo}>AI Clipper</div>

      <div style={styles.logoSub}>
        Project workspace
      </div>

      <div
        style={{
          ...styles.cardFlat,
          marginTop: "18px",
          marginBottom: "18px",
          padding: "12px",
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.12), rgba(15,23,42,0.7))",
        }}
      >
        <div
          style={{
            color: "#c4b5fd",
            fontSize: "11px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: "8px",
          }}
        >
          Current Project
        </div>

        <div
          title={projectTitle}
          style={{
            fontWeight: 900,
            lineHeight: 1.2,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {projectTitle}
        </div>

        <div style={{ marginTop: "10px" }}>
          <span
            style={
              workspaceContext?.project?.hasVideo
                ? styles.goodBadge
                : styles.warnBadge
            }
          >
            {workspaceContext?.project?.hasVideo ? "Video Loaded" : "No Video"}
          </span>
        </div>
      </div>

      <nav style={styles.nav}>
        <SidebarButton
          tab="project"
          label="← Projects"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          styles={styles}
        />

        <div
          style={{
            margin: "10px 0 4px",
            color: "#64748b",
            fontSize: "11px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          Workspace
        </div>

        {WORKSPACE_TABS.map((tab) => (
          <div key={tab.id} title={tab.description}>
            <SidebarButton
              tab={tab.id}
              label={tab.shortLabel || tab.label}
              count={getSidebarCount(tab.id, workspaceContext)}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              styles={styles}
            />
          </div>
        ))}

        <div
          style={{
            margin: "14px 0 4px",
            color: "#64748b",
            fontSize: "11px",
            fontWeight: 900,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          System
        </div>

        <SidebarButton
          tab="settings"
          label="Debug / Settings"
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          styles={styles}
        />
      </nav>

      <div style={{ marginTop: "24px" }}>
        <div style={styles.cardFlat}>
          <div
            style={{
              color: "#c4b5fd",
              fontSize: "11px",
              fontWeight: 900,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              marginBottom: "8px",
            }}
          >
            Status
          </div>

          <MiniStatus
            label="Clips"
            value={workspaceContext.counts.clips}
            active={workspaceContext.status.hasClips}
            styles={styles}
          />

          <MiniStatus
            label="Selected"
            value={workspaceContext.counts.selectedClips}
            active={workspaceContext.status.hasSelectedClips}
            styles={styles}
          />

          <MiniStatus
            label="Subtitles"
            value={workspaceContext.counts.subtitles}
            active={workspaceContext.status.hasSubtitles}
            styles={styles}
          />

          <div style={{ borderBottom: "none" }}>
            <MiniStatus
              label="Exports"
              value={workspaceContext.counts.exports}
              active={workspaceContext.status.hasExports}
              styles={styles}
            />
          </div>
        </div>
      </div>
    </aside>
  );
}
