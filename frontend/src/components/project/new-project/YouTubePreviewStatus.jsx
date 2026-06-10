export default function YouTubePreviewStatus({
  previewError,
  fetchingPreview,
  styles,
}) {
  if (fetchingPreview) {
    return (
      <div
        style={{
          ...styles.cardFlat,
          marginTop: "14px",
          border: "1px solid rgba(129,140,248,0.30)",
        }}
      >
        <span style={styles.badge}>Fetching</span>
        <p style={{ ...styles.muted, margin: "8px 0 0" }}>
          Getting the video title, thumbnail, channel, and duration.
        </p>
      </div>
    );
  }

  if (!previewError) return null;

  return (
    <div
      style={{
        ...styles.cardFlat,
        marginTop: "14px",
        border: "1px solid rgba(251,191,36,0.35)",
        background:
          "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(15,23,42,0.78))",
      }}
    >
      <span style={styles.warnBadge}>Preview issue</span>

      <p style={{ ...styles.muted, margin: "8px 0 0" }}>
        {previewError}
      </p>

      <p style={{ ...styles.muted, margin: "8px 0 0", fontSize: "13px" }}>
        Check that the backend is running and that{" "}
        <strong>POST /youtube-preview</strong> exists in backend/app/main.py.
      </p>
    </div>
  );
}
