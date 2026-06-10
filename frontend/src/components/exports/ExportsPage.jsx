export default function ExportsPage({
  exportedCount,
  customExportedClip,
  exportedClips,
  smartVerticalClips,
  subtitledVerticalClips,
  styles,
  renderHeader,
  ExportPreviewCard,
}) {
  return (
    <>
      {renderHeader(
        "Exports",
        "Preview rendered clips and check final outputs before posting."
      )}

      {exportedCount === 0 ? (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>No exports yet</h2>
          <p style={styles.muted}>
            Export clips from the Clips or Crop Editor tab.
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {customExportedClip && (
            <div style={{ ...styles.card, gridColumn: "span 6" }}>
              <h2 style={styles.sectionTitle}>Custom Vertical</h2>
              <ExportPreviewCard
                clip={customExportedClip}
                title="Custom Vertical Clip"
              />
            </div>
          )}

          {exportedClips.length > 0 && (
            <div style={{ ...styles.card, gridColumn: "span 6" }}>
              <h2 style={styles.sectionTitle}>Horizontal</h2>
              {exportedClips.map((clip, index) => (
                <ExportPreviewCard
                  key={`${clip.output_path}-${index}`}
                  clip={clip}
                  title="Horizontal Clip"
                />
              ))}
            </div>
          )}

          {smartVerticalClips.length > 0 && (
            <div style={{ ...styles.card, gridColumn: "span 6" }}>
              <h2 style={styles.sectionTitle}>Smart Vertical</h2>
              {smartVerticalClips.map((clip, index) => (
                <ExportPreviewCard
                  key={`${clip.output_path}-${index}`}
                  clip={clip}
                  title="Vertical Clip"
                />
              ))}
            </div>
          )}

          {subtitledVerticalClips.length > 0 && (
            <div style={{ ...styles.card, gridColumn: "span 6" }}>
              <h2 style={styles.sectionTitle}>Subtitled Vertical</h2>
              {subtitledVerticalClips.map((clip, index) => (
                <ExportPreviewCard
                  key={`${clip.output_path}-${index}`}
                  clip={clip}
                  title="Subtitled Clip"
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
