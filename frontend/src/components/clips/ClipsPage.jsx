import BatchControls from "./BatchControls";
import ClipCard from "./ClipCard";

export default function ClipsPage({
  clips,
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
  toggleClipSelection,
  setFocusedClipIndex,
  setSingleExportedClip,
  setActiveTab,
  loadCropPresetForClip,
  generateSocialCopyForClip,
  copyToClipboard,
  styles,
  renderHeader,
}) {
  return (
    <>
      {renderHeader(
        "Review clips",
        "Pick the moments worth editing, exporting, or generating captions for."
      )}

      {clips.length === 0 ? (
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>No clips yet</h2>
          <p style={styles.muted}>Go to Analyze and run Analyze Video first.</p>
        </div>
      ) : (
        <div style={styles.grid}>
          <div style={{ ...styles.card, gridColumn: "span 12" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "14px",
                alignItems: "flex-start",
                marginBottom: "14px",
              }}
            >
              <div>
                <h2 style={styles.sectionTitle}>Suggested Clips</h2>
                <p style={styles.muted}>Detected {clips.length} possible clips.</p>
              </div>
            </div>

            <BatchControls
              selectedClipIndexes={selectedClipIndexes}
              selectAllClips={selectAllClips}
              selectKeepClips={selectKeepClips}
              selectMaybeClips={selectMaybeClips}
              selectScore80PlusClips={selectScore80PlusClips}
              selectTop10Clips={selectTop10Clips}
              clearClipSelection={clearClipSelection}
              exportSelectedSmartVerticalClips={exportSelectedSmartVerticalClips}
              exportSelectedSubtitledVerticalClips={exportSelectedSubtitledVerticalClips}
              batchExportingVertical={batchExportingVertical}
              batchExportingSubtitled={batchExportingSubtitled}
              handleExportClips={handleExportClips}
              exporting={exporting}
              handleExportSmartVerticalClips={handleExportSmartVerticalClips}
              exportingSmartVertical={exportingSmartVertical}
              handleExportSmartVerticalSubtitledClips={
                handleExportSmartVerticalSubtitledClips
              }
              exportingSubtitledVertical={exportingSubtitledVertical}
              styles={styles}
            />

            {clips.map((clip, index) => (
              <ClipCard
                key={`${clip.start}-${clip.end}-${index}`}
                clip={clip}
                index={index}
                selectedClipIndexes={selectedClipIndexes}
                toggleClipSelection={toggleClipSelection}
                setFocusedClipIndex={setFocusedClipIndex}
                setSingleExportedClip={setSingleExportedClip}
                setActiveTab={setActiveTab}
                loadCropPresetForClip={loadCropPresetForClip}
                generateSocialCopyForClip={generateSocialCopyForClip}
                copyToClipboard={copyToClipboard}
                styles={styles}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
