import Button from "../common/Button";

export default function SubtitleEditorPage({
  transcriptSegments,
  editingTranscript,
  setEditingTranscript,
  updateTranscriptSegmentText,
  saveEditedTranscript,
  resetTranscriptFromProject,
  styles,
  renderHeader,
}) {
  return (
    <>
      {renderHeader(
        "Subtitle editor",
        "Clean up transcript text before burning subtitles into vertical clips."
      )}

      {transcriptSegments.length === 0 ? (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>No transcript yet</h2>
          <p style={styles.muted}>Analyze a video first.</p>
        </div>
      ) : (
        <div style={styles.card}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "14px",
              alignItems: "center",
            }}
          >
            <div>
              <h2 style={styles.sectionTitle}>Transcript</h2>
              <p style={styles.muted}>
                {transcriptSegments.length} subtitle segments loaded.
              </p>
            </div>

            <div style={styles.buttonRow}>
              <Button
                onClick={() => setEditingTranscript(!editingTranscript)}
                styles={styles}
              >
                {editingTranscript ? "Hide Editor" : "Edit Subtitles"}
              </Button>

              <Button
                onClick={saveEditedTranscript}
                variant="primary"
                styles={styles}
              >
                Save Transcript
              </Button>

              <Button onClick={resetTranscriptFromProject} styles={styles}>
                Reset
              </Button>
            </div>
          </div>

          {editingTranscript && (
            <div style={{ marginTop: "18px" }}>
              {transcriptSegments.map((segment, index) => (
                <div
                  key={`${segment.start}-${segment.end}-${index}`}
                  style={styles.cardFlat}
                >
                  <p style={styles.muted}>
                    Segment {index + 1} · {Number(segment.start).toFixed(2)}s -{" "}
                    {Number(segment.end).toFixed(2)}s
                  </p>

                  <textarea
                    value={segment.text || ""}
                    onChange={(e) =>
                      updateTranscriptSegmentText(index, e.target.value)
                    }
                    rows={3}
                    style={styles.textarea}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
