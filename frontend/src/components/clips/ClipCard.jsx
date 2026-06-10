import Button from "../common/Button";

export default function ClipCard({
  clip,
  index,
  selectedClipIndexes,
  toggleClipSelection,
  setFocusedClipIndex,
  setSingleExportedClip,
  setActiveTab,
  loadCropPresetForClip,
  generateSocialCopyForClip,
  copyToClipboard,
  styles,
}) {
  return (
    <div style={styles.clipCard}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        <div>
          <label
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "12px",
              cursor: "pointer",
              color: "#cbd5e1",
            }}
          >
            <input
              type="checkbox"
              checked={selectedClipIndexes.includes(index)}
              onChange={() => toggleClipSelection(index)}
            />
            Select for batch export
          </label>

          <h3 style={{ margin: "0 0 8px" }}>Clip {index + 1}</h3>

          <span style={styles.goodBadge}>Score {clip.score}/100</span>
          <span style={styles.badge}>{clip.duration}s</span>

          <span
            style={
              clip.status === "keep"
                ? styles.goodBadge
                : clip.status === "trash"
                ? styles.warnBadge
                : styles.badge
            }
          >
            {clip.status || "maybe"}
          </span>

          <span style={styles.badge}>
            {clip.start}s → {clip.end}s
          </span>
        </div>

        <div style={styles.buttonRow}>
          <Button
            onClick={() => {
              setFocusedClipIndex(index);
              setSingleExportedClip(null);
              setActiveTab("clip-workflow");
            }}
            variant="primary"
            styles={styles}
          >
            Open Workflow
          </Button>

          <Button onClick={() => loadCropPresetForClip(index)} styles={styles}>
            Edit Crop
          </Button>

          <Button onClick={() => generateSocialCopyForClip(index)} styles={styles}>
            AI Copy
          </Button>
        </div>
      </div>

      <div style={{ marginTop: "12px" }}>
        {clip.text_score !== undefined && clip.text_score !== null && (
          <span style={styles.badge}>Text {clip.text_score}</span>
        )}

        {clip.audio_score !== undefined && clip.audio_score !== null && (
          <span style={styles.badge}>Audio {clip.audio_score}</span>
        )}

        {clip.reaction_score !== undefined && clip.reaction_score !== null && (
          <span style={styles.badge}>Reaction {clip.reaction_score}</span>
        )}

        {clip.density_score !== undefined && clip.density_score !== null && (
          <span style={styles.badge}>Density {clip.density_score}</span>
        )}
      </div>

      <p style={styles.muted}>
        <strong>Reason:</strong> {clip.reason}
      </p>

      <p>
        <strong>Transcript:</strong> {clip.transcript_preview}
      </p>

      <h4>Titles</h4>

      <ul>
        {clip.title_suggestions?.map((title, titleIndex) => (
          <li key={titleIndex}>{title}</li>
        ))}
      </ul>

      {clip.ai_generated !== undefined && (
        <span style={clip.ai_generated ? styles.goodBadge : styles.warnBadge}>
          {clip.ai_generated ? "OpenAI generated" : "Template fallback"}
        </span>
      )}

      {clip.hook_text && (
        <p>
          <strong>Hook:</strong> {clip.hook_text}
        </p>
      )}

      {clip.caption && (
        <p>
          <strong>Caption:</strong> {clip.caption}
        </p>
      )}

      {clip.description && (
        <>
          <h4>Description</h4>
          <p style={{ whiteSpace: "pre-wrap" }}>{clip.description}</p>
        </>
      )}

      {clip.hashtags && clip.hashtags.length > 0 && (
        <p>
          <strong>Hashtags:</strong> {clip.hashtags.join(" ")}
        </p>
      )}

      {clip.pinned_comment && (
        <p>
          <strong>Pinned Comment:</strong> {clip.pinned_comment}
        </p>
      )}

      {(clip.caption || clip.hashtags?.length > 0) && (
        <Button
          onClick={() =>
            copyToClipboard(`${clip.caption || ""}\n\n${clip.hashtags?.join(" ") || ""}`)
          }
          styles={styles}
        >
          Copy Caption + Hashtags
        </Button>
      )}
    </div>
  );
}
