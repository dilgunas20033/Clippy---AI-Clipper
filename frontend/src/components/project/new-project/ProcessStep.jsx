import Button from "../../common/Button";
import { formatDuration, niceValue } from "./WizardParts";

export default function ProcessStep({ pendingVideoData, projectOptions, setStep, handleFinishProject, styles }) {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div style={{ ...styles.cardFlat, border: "1px solid rgba(74,222,128,0.25)" }}>
        <h3 style={{ marginTop: 0 }}>{pendingVideoData?.video_title || pendingVideoData?.title || "Video ready"}</h3>
        <div>
          <span style={styles.goodBadge}>Ready</span>
          {pendingVideoData?.source_type && <span style={styles.badge}>Source: {pendingVideoData.source_type}</span>}
          {pendingVideoData?.duration && <span style={styles.badge}>Duration: {formatDuration(pendingVideoData.duration)}</span>}
        </div>
        <p style={{ ...styles.muted, wordBreak: "break-word" }}>{pendingVideoData?.video_path || "No path returned"}</p>
      </div>

      <div style={styles.cardFlat}>
        <h3 style={{ marginTop: 0 }}>Ready to create project</h3>
        <p style={styles.muted}>This adds the project to the dashboard. The next step will convert this into a real background processing flow.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "10px" }}>
          {Object.entries(projectOptions).map(([key, value]) => (
            <div key={key} style={styles.cardFlat}>
              <div style={{ ...styles.muted, fontSize: "12px" }}>{key}</div>
              <strong>{niceValue(value)}</strong>
            </div>
          ))}
        </div>
      </div>

      <div style={{ ...styles.buttonRow, justifyContent: "space-between" }}>
        <Button onClick={() => setStep(3)} styles={styles}>Back</Button>
        <Button onClick={handleFinishProject} disabled={!pendingVideoData} variant="primary" styles={styles}>Create Project</Button>
      </div>
    </div>
  );
}
