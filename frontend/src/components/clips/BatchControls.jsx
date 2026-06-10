import Button from "../common/Button";

export default function BatchControls({
  selectedClipIndexes,
  selectAllClips,
  selectKeepClips,
  selectMaybeClips,
  selectScore80PlusClips,
  selectTop10Clips,
  clearClipSelection,
  exportSelectedSmartVerticalClips,
  exportSelectedSubtitledVerticalClips,
  batchExportingVertical,
  batchExportingSubtitled,
  handleExportClips,
  exporting,
  handleExportSmartVerticalClips,
  exportingSmartVertical,
  handleExportSmartVerticalSubtitledClips,
  exportingSubtitledVertical,
  styles,
}) {
  return (
    <div style={{ ...styles.cardFlat, marginBottom: "18px" }}>
      <h3 style={{ marginTop: 0 }}>Batch Controls</h3>

      <p style={styles.muted}>Selected clips: {selectedClipIndexes.length}</p>

      <div style={styles.buttonRow}>
        <Button onClick={selectAllClips} styles={styles}>
          Select All
        </Button>

        <Button onClick={selectKeepClips} styles={styles}>
          Select Keep
        </Button>

        <Button onClick={selectMaybeClips} styles={styles}>
          Select Maybe
        </Button>

        <Button onClick={selectScore80PlusClips} styles={styles}>
          Select Score 80+
        </Button>

        <Button onClick={selectTop10Clips} styles={styles}>
          Select Top 10
        </Button>

        <Button onClick={clearClipSelection} variant="danger" styles={styles}>
          Clear Selection
        </Button>
      </div>

      <div style={styles.buttonRow}>
        <Button
          onClick={exportSelectedSmartVerticalClips}
          disabled={batchExportingVertical || selectedClipIndexes.length === 0}
          styles={styles}
        >
          {batchExportingVertical
            ? "Exporting Selected..."
            : "Export Selected Vertical"}
        </Button>

        <Button
          onClick={exportSelectedSubtitledVerticalClips}
          disabled={batchExportingSubtitled || selectedClipIndexes.length === 0}
          variant="primary"
          styles={styles}
        >
          {batchExportingSubtitled
            ? "Exporting Selected..."
            : "Export Selected Subtitled"}
        </Button>
      </div>

      <details style={{ marginTop: "12px" }}>
        <summary style={{ cursor: "pointer", color: "#cbd5e1" }}>
          Legacy export all options
        </summary>

        <div style={styles.buttonRow}>
          <Button onClick={handleExportClips} disabled={exporting} styles={styles}>
            {exporting ? "Exporting..." : "Export All Horizontal"}
          </Button>

          <Button
            onClick={handleExportSmartVerticalClips}
            disabled={exportingSmartVertical}
            styles={styles}
          >
            {exportingSmartVertical ? "Exporting..." : "Export All Vertical"}
          </Button>

          <Button
            onClick={handleExportSmartVerticalSubtitledClips}
            disabled={exportingSubtitledVertical}
            styles={styles}
          >
            {exportingSubtitledVertical ? "Exporting..." : "Export All Subtitled"}
          </Button>
        </div>
      </details>
    </div>
  );
}
