import Button from "../../common/Button";
import { formatDuration } from "./WizardParts";

function VideoConfirmCard({ youtubePreview, pendingVideoData, styles }) {
  if (youtubePreview) {
    const title = youtubePreview.title || "Untitled YouTube video";
    const channel = youtubePreview.channel || "Unknown channel";
    const duration = youtubePreview.duration || 0;
    const previewUrl = youtubePreview.webpage_url || youtubePreview.url;

    return (
      <div
        style={{
          ...styles.cardFlat,
          border: "1px solid rgba(74,222,128,0.25)",
        }}
      >
        {youtubePreview.thumbnail ? (
          <img
            src={youtubePreview.thumbnail}
            alt={title}
            style={{
              width: "100%",
              maxHeight: "280px",
              objectFit: "cover",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
              marginBottom: "16px",
            }}
          />
        ) : (
          <div
            style={{
              height: "220px",
              borderRadius: "16px",
              border: "1px solid rgba(255,255,255,0.08)",
              background:
                "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.18), transparent 40%), rgba(255,255,255,0.035)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "16px",
            }}
          >
            <span style={styles.badge}>No thumbnail returned</span>
          </div>
        )}

        <h3 style={{ marginTop: 0 }}>{title}</h3>

        <div>
          <span style={styles.goodBadge}>YouTube Preview</span>
          <span style={styles.badge}>{channel}</span>
          <span style={styles.badge}>{formatDuration(duration)}</span>
        </div>

        <p style={{ ...styles.muted, wordBreak: "break-word" }}>
          {previewUrl}
        </p>
      </div>
    );
  }

  if (pendingVideoData) {
    return (
      <div
        style={{
          ...styles.cardFlat,
          border: "1px solid rgba(74,222,128,0.25)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Video added</h3>

        <div>
          <span style={styles.goodBadge}>Ready</span>
          {pendingVideoData.source_type && (
            <span style={styles.badge}>Source: {pendingVideoData.source_type}</span>
          )}
          {pendingVideoData.duration && (
            <span style={styles.badge}>
              Duration: {formatDuration(pendingVideoData.duration)}
            </span>
          )}
        </div>

        <p style={{ ...styles.muted, wordBreak: "break-word" }}>
          <strong>Title:</strong>{" "}
          {pendingVideoData.video_title || pendingVideoData.title || "Untitled video"}
        </p>

        <p style={{ ...styles.muted, wordBreak: "break-word" }}>
          <strong>Path:</strong> {pendingVideoData.video_path || "No path returned"}
        </p>
      </div>
    );
  }

  return null;
}

export default function ConfirmVideoStep({
  youtubePreview,
  pendingVideoData,
  downloadingYoutube,
  downloadConfirmedYoutube,
  resetVideoChoice,
  confirmUploadedVideo,
  styles,
}) {
  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <VideoConfirmCard
        youtubePreview={youtubePreview}
        pendingVideoData={pendingVideoData}
        styles={styles}
      />

      <div style={styles.cardFlat}>
        <h3 style={{ marginTop: 0 }}>Is this the right video?</h3>
        <p style={styles.muted}>Confirm before choosing clip settings.</p>
      </div>

      <div style={{ ...styles.buttonRow, justifyContent: "space-between" }}>
        <Button onClick={resetVideoChoice} styles={styles}>
          Change Video
        </Button>

        {youtubePreview ? (
          <Button
            onClick={downloadConfirmedYoutube}
            disabled={downloadingYoutube}
            variant="primary"
            styles={styles}
          >
            {downloadingYoutube ? "Downloading..." : "Yes, download this"}
          </Button>
        ) : (
          <Button
            onClick={confirmUploadedVideo}
            variant="primary"
            styles={styles}
          >
            Yes, continue
          </Button>
        )}
      </div>
    </div>
  );
}
