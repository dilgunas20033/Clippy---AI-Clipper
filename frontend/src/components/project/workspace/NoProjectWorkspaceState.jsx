import Button from "../../common/Button";

export default function NoProjectWorkspaceState({ setActiveTab, styles }) {
  return (
    <div style={styles.page}>
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            ...styles.card,
            width: "100%",
            maxWidth: "720px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "18px",
              margin: "0 auto 18px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background:
                "linear-gradient(135deg, rgba(99,102,241,0.35), rgba(236,72,153,0.18))",
              border: "1px solid rgba(255,255,255,0.10)",
              fontSize: "26px",
            }}
          >
            🎬
          </div>

          <h1
            style={{
              ...styles.title,
              fontSize: "34px",
              marginBottom: "10px",
            }}
          >
            No project loaded
          </h1>

          <p
            style={{
              ...styles.muted,
              maxWidth: "520px",
              margin: "0 auto 22px",
            }}
          >
            Open a saved project or create a new one before using the workspace
            pages.
          </p>

          <div
            style={{
              ...styles.buttonRow,
              justifyContent: "center",
            }}
          >
            <Button
              onClick={() => setActiveTab("project")}
              variant="primary"
              styles={styles}
            >
              Go to Projects
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
