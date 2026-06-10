import Button from "../common/Button";

export default function CropEditorPage({
  selectedClipIndex,
  cropPreset,
  loadingCropPreset,
  customFacecamBox,
  customGameplayBox,
  exportCustomVerticalClip,
  exportingCustomClip,
  closeCropEditor,
  customExportedClip,
  styles,
  renderHeader,
  CropBoxEditor,
  ExportPreviewCard,
}) {
  return (
    <>
      {renderHeader(
        "Crop editor",
        "Manually adjust facecam and gameplay crops before exporting custom vertical clips."
      )}

      {selectedClipIndex === null || !cropPreset ? (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>No clip selected</h2>
          <p style={styles.muted}>Go to Clips and click Edit Crop on a clip.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          <div style={{ ...styles.card, gridColumn: "span 7" }}>
            <h2 style={styles.sectionTitle}>Clip {selectedClipIndex + 1}</h2>

            <span style={styles.badge}>
              Video {cropPreset.video_width} x {cropPreset.video_height}
            </span>
            <span style={styles.badge}>{cropPreset.layout_type}</span>

            {loadingCropPreset && <p style={styles.muted}>Loading preset...</p>}

            <CropBoxEditor
              title="Facecam Crop"
              boxType="facecam"
              box={customFacecamBox}
            />

            <CropBoxEditor
              title="Gameplay Crop"
              boxType="gameplay"
              box={customGameplayBox}
            />

            <div style={styles.buttonRow}>
              <Button
                onClick={exportCustomVerticalClip}
                disabled={exportingCustomClip}
                variant="primary"
                styles={styles}
              >
                {exportingCustomClip ? "Exporting..." : "Export Custom Clip"}
              </Button>

              <Button onClick={closeCropEditor} variant="danger" styles={styles}>
                Close Editor
              </Button>
            </div>
          </div>

          <div style={{ ...styles.card, gridColumn: "span 5" }}>
            <h2 style={styles.sectionTitle}>Preview</h2>

            {customExportedClip ? (
              <ExportPreviewCard
                clip={customExportedClip}
                title="Custom Vertical Clip"
              />
            ) : (
              <p style={styles.muted}>Export a custom clip to preview the crop.</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
