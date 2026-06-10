import { WORKSPACE_TABS } from "./workspaceTabs";

function getTabCount(tabId, workspaceContext) {
  if (tabId === "clips") {
    return workspaceContext?.counts?.clips || 0;
  }

  if (tabId === "subtitles") {
    return workspaceContext?.counts?.subtitles || 0;
  }

  if (tabId === "exports") {
    return workspaceContext?.counts?.exports || 0;
  }

  return null;
}

export default function ProjectWorkspaceNavbar({
  activeTab,
  setActiveTab,
  workspaceContext,
  styles,
}) {
  return (
    <div
      style={{
        display: "flex",
        gap: "10px",
        flexWrap: "wrap",
        paddingTop: "16px",
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {WORKSPACE_TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const count = getTabCount(tab.id, workspaceContext);

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            title={tab.description}
            style={{
              border: isActive
                ? "1px solid rgba(129,140,248,0.75)"
                : "1px solid rgba(255,255,255,0.08)",
              background: isActive
                ? "linear-gradient(135deg, rgba(99,102,241,0.28), rgba(236,72,153,0.12))"
                : "rgba(255,255,255,0.04)",
              color: isActive ? "#fff" : "#cbd5e1",
              borderRadius: "999px",
              padding: "10px 14px",
              fontSize: "13px",
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>{tab.label}</span>

            {count !== null && (
              <span
                style={{
                  minWidth: "20px",
                  height: "20px",
                  padding: "0 7px",
                  borderRadius: "999px",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  background: isActive
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(255,255,255,0.08)",
                  color: isActive ? "#fff" : "#94a3b8",
                }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
