import Button from "../common/Button";

export default function ClipWorkflowPage({
  focusedClipIndex,
  clips,
  updateClipStatus,
  generateSocialCopyForClip,
  loadCropPresetForClip,
  exportSingleSmartVerticalClip,
  exportingSingleClip,
  exportSingleSubtitledVerticalClip,
  exportingSingleSubtitledClip,
  setFocusedClipIndex,
  setSingleExportedClip,
  setActiveTab,
  singleExportedClip,
  styles,
  renderHeader,
  ExportPreviewCard,
  copyToClipboard,
}) {
  const clip =
    focusedClipIndex !== null && clips[focusedClipIndex]
      ? clips[focusedClipIndex]
      : null;

  if (!clip) {
    return (
      <>
        {renderHeader(
          "Clip workflow",
          "Choose a clip from the Clips tab to work on it individually."
        )}

        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>No clip selected</h2>
          <p style={styles.muted}>
            Go to Clips and click Open Workflow on a clip.
          </p>
        </div>
      </>
    );
  }

  const currentStatus = clip.status || "maybe";

  return (
    <>
      {renderHeader(
        `Clip ${focusedClipIndex + 1} workflow`,
        "Review, mark, generate copy, edit crop, and export this clip individually."
      )}

      <div style={styles.grid}>
        <div style={{ ...styles.card, gridColumn: "span 8" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            <div>
              <h2 style={styles.sectionTitle}>Clip Details</h2>

              <span style={styles.goodBadge}>Score {clip.score}/100</span>
              <span style={styles.badge}>{clip.duration}s</span>
              <span style={styles.badge}>
                {clip.start}s → {clip.end}s
              </span>
              <span style={styles.badge}>Status: {currentStatus}</span>
            </div>

            <div style={styles.buttonRow}>
              <Button
                onClick={() => updateClipStatus(focusedClipIndex, "keep")}
                styles={styles}
              >
                Keep
              </Button>

              <Button
                onClick={() => updateClipStatus(focusedClipIndex, "maybe")}
                styles={styles}
              >
                Maybe
              </Button>

              <Button
                onClick={() => updateClipStatus(focusedClipIndex, "trash")}
                variant="danger"
                styles={styles}
              >
                Trash
              </Button>
            </div>
          </div>

          <div style={{ marginTop: "14px" }}>
            {clip.text_score !== undefined && clip.text_score !== null && (
              <span style={styles.badge}>Text {clip.text_score}</span>
            )}

            {clip.audio_score !== undefined && clip.audio_score !== null && (
              <span style={styles.badge}>Audio {clip.audio_score}</span>
            )}

            {clip.reaction_score !== undefined &&
              clip.reaction_score !== null && (
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

          <div style={styles.buttonRow}>
            <Button
              onClick={() => generateSocialCopyForClip(focusedClipIndex)}
              variant="primary"
              styles={styles}
            >
              Generate AI Copy
            </Button>

            <Button
              onClick={() => loadCropPresetForClip(focusedClipIndex)}
              styles={styles}
            >
              Edit Crop
            </Button>

            <Button
              onClick={() => exportSingleSmartVerticalClip(focusedClipIndex)}
              disabled={exportingSingleClip}
              styles={styles}
            >
              {exportingSingleClip ? "Exporting..." : "Export Vertical"}
            </Button>

            <Button
              onClick={() => exportSingleSubtitledVerticalClip(focusedClipIndex)}
              disabled={exportingSingleSubtitledClip}
              styles={styles}
            >
              {exportingSingleSubtitledClip ? "Exporting..." : "Export Subtitled"}
            </Button>
          </div>

          <h3>Titles</h3>

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
              <h3>Description</h3>
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
                copyToClipboard(
                  `${clip.caption || ""}\n\n${clip.hashtags?.join(" ") || ""}`
                )
              }
              styles={styles}
            >
              Copy Caption + Hashtags
            </Button>
          )}
        </div>

        <div style={{ ...styles.card, gridColumn: "span 4" }}>
          <h2 style={styles.sectionTitle}>Clip Actions</h2>

          <p style={styles.muted}>
            Work on one clip at a time instead of exporting everything.
          </p>

          <div style={{ display: "grid", gap: "10px", marginTop: "16px" }}>
            <Button
              onClick={() => {
                if (focusedClipIndex > 0) {
                  setFocusedClipIndex(focusedClipIndex - 1);
                  setSingleExportedClip(null);
                }
              }}
              disabled={focusedClipIndex <= 0}
              styles={styles}
            >
              Previous Clip
            </Button>

            <Button
              onClick={() => {
                if (focusedClipIndex < clips.length - 1) {
                  setFocusedClipIndex(focusedClipIndex + 1);
                  setSingleExportedClip(null);
                }
              }}
              disabled={focusedClipIndex >= clips.length - 1}
              styles={styles}
            >
              Next Clip
            </Button>

            <Button onClick={() => setActiveTab("clips")} styles={styles}>
              Back to Clip List
            </Button>
          </div>

          {singleExportedClip && (
            <div style={{ marginTop: "20px" }}>
              <h3>Latest Export</h3>

              <ExportPreviewCard clip={singleExportedClip} title="Single Export" />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
