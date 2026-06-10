import YouTubePreviewDebugPanel from "./YouTubePreviewDebugPanel";
import Button from "../common/Button";

function SettingRow({ label, description, children, styles }) {
  return (
    <div
      style={{
        ...styles.cardFlat,
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        gap: "16px",
        alignItems: "center",
      }}
    >
      <div>
        <strong>{label}</strong>
        {description && (
          <p style={{ ...styles.muted, margin: "6px 0 0" }}>{description}</p>
        )}
      </div>

      <div>{children}</div>
    </div>
  );
}

function SystemCheckPanel({
  systemCheck,
  checkingSystem,
  runSystemCheck,
  styles,
}) {
  const hasResult = Boolean(systemCheck);

  return (
    <div style={styles.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          alignItems: "flex-start",
          marginBottom: "14px",
        }}
      >
        <div>
          <h2 style={styles.sectionTitle}>System Check</h2>
          <p style={styles.muted}>
            Check backend, FFmpeg, FFprobe, and OpenAI key status.
          </p>
        </div>

        <Button
          onClick={runSystemCheck}
          disabled={checkingSystem}
          variant="primary"
          styles={styles}
        >
          {checkingSystem ? "Checking..." : "Run Check"}
        </Button>
      </div>

      {!hasResult && (
        <p style={styles.muted}>Run a check to see your current system status.</p>
      )}

      {hasResult && (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            padding: "12px",
            borderRadius: "14px",
            background: "rgba(0,0,0,0.25)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "#cbd5e1",
            fontSize: "12px",
            margin: 0,
          }}
        >
          {JSON.stringify(systemCheck, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default function SettingsPage({
  settings,
  updateSetting,
  setSettings,
  setAnalyzeMode,
  resetSettings,
  systemCheck,
  checkingSystem,
  runSystemCheck,
  styles,
  renderHeader,
}) {
  const updateAnalyzeMode = (mode) => {
    updateSetting("analyzeMode", mode);
    setAnalyzeMode(mode);
  };

  return (
    <div>
      {renderHeader(
        "Debug / Settings",
        "System checks, defaults, and project debugging tools."
      )}

      <YouTubePreviewDebugPanel styles={styles} />

      <SystemCheckPanel
        systemCheck={systemCheck}
        checkingSystem={checkingSystem}
        runSystemCheck={runSystemCheck}
        styles={styles}
      />

      <div style={styles.card}>
        <h2 style={styles.sectionTitle}>Defaults</h2>

        <div style={{ display: "grid", gap: "12px" }}>
          <SettingRow
            label="Default analyze mode"
            description="Fast is best for most long streams. Deep is better for reaction-heavy clips."
            styles={styles}
          >
            <div style={styles.buttonRow}>
              <Button
                onClick={() => updateAnalyzeMode("fast")}
                variant={settings.analyzeMode === "fast" ? "primary" : "normal"}
                styles={styles}
              >
                Fast
              </Button>

              <Button
                onClick={() => updateAnalyzeMode("deep")}
                variant={settings.analyzeMode === "deep" ? "primary" : "normal"}
                styles={styles}
              >
                Deep
              </Button>
            </div>
          </SettingRow>

          <SettingRow
            label="Reset settings"
            description="Go back to the default app settings."
            styles={styles}
          >
            <Button onClick={resetSettings} variant="danger" styles={styles}>
              Reset
            </Button>
          </SettingRow>
        </div>
      </div>
    </div>
  );
}
