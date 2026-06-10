import StatCard from "../common/StatCard";

export default function DashboardStats({
  clips,
  transcriptSegments,
  exportedCount,
  layoutData,
  styles,
}) {
  return (
    <div style={styles.grid}>
      <StatCard
        label="Suggested Clips"
        value={clips.length}
        sub="Detected moments"
        styles={styles}
      />

      <StatCard
        label="Transcript"
        value={transcriptSegments.length}
        sub="Subtitle segments"
        styles={styles}
      />

      <StatCard
        label="Exports"
        value={exportedCount}
        sub="Rendered clips"
        styles={styles}
      />

      <StatCard
        label="Layout"
        value={layoutData?.layout_type || "None"}
        sub={
          layoutData?.confidence
            ? `Confidence ${layoutData.confidence}`
            : "Not detected"
        }
        styles={styles}
      />
    </div>
  );
}
