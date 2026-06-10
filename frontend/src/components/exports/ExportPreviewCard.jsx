export default function ExportPreviewCard({
  clip,
  title,
  styles,
  getVideoPreviewUrl,
}) {
  const previewUrl = getVideoPreviewUrl(clip);

  return (
    <div style={styles.cardFlat}>
      <h3 style={{ marginTop: 0 }}>
        {title} {clip.index}
      </h3>

      {previewUrl ? (
        <video
          src={previewUrl}
          controls
          preload="metadata"
          style={styles.video}
        />
      ) : (
        <p style={styles.muted}>
          No preview URL available. Re-export this clip after Step 10 changes.
        </p>
      )}

      <p style={styles.muted}>
        <strong>Path:</strong> {clip.output_path}
      </p>

      <div>
        <span style={styles.badge}>Start: {clip.start}s</span>
        <span style={styles.badge}>End: {clip.end}s</span>
      </div>

      {clip.crop_debug && (
        <>
          <h4>Crop Debug</h4>
          <pre style={styles.pre}>
            {JSON.stringify(clip.crop_debug, null, 2)}
          </pre>
        </>
      )}
    </div>
  );
}