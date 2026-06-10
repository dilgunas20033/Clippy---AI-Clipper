import VideoUpload from "../../VideoUpload";
import Button from "../../common/Button";
import YouTubePreviewStatus from "./YouTubePreviewStatus";

export default function VideoSourceStep({
  youtubeUrl,
  setYoutubeUrl,
  previewError,
  fetchingPreview,
  fetchYoutubePreview,
  handleUploadedVideo,
  styles,
}) {
  const trimmedUrl = youtubeUrl.trim();
  const looksLikeYoutube =
    trimmedUrl.includes("youtube.com") || trimmedUrl.includes("youtu.be");

  return (
    <div style={{ display: "grid", gap: "16px" }}>
      <div style={styles.cardFlat}>
        <h3 style={{ marginTop: 0 }}>Paste YouTube Link</h3>
        <p style={styles.muted}>
          Preview the video first so you can confirm it before downloading.
        </p>

        <input
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          style={{
            ...styles.input,
            border:
              trimmedUrl && !looksLikeYoutube
                ? "1px solid rgba(251,191,36,0.45)"
                : styles.input.border,
          }}
        />

        {trimmedUrl && !looksLikeYoutube && (
          <p style={{ ...styles.muted, margin: "8px 0 0", fontSize: "13px" }}>
            This does not look like a YouTube link. Paste a youtube.com or
            youtu.be URL.
          </p>
        )}

        <YouTubePreviewStatus
          previewError={previewError}
          fetchingPreview={fetchingPreview}
          styles={styles}
        />

        <div style={styles.buttonRow}>
          <Button
            onClick={fetchYoutubePreview}
            disabled={fetchingPreview || !trimmedUrl || !looksLikeYoutube}
            variant="primary"
            styles={styles}
          >
            {fetchingPreview ? "Fetching Preview..." : "Fetch Preview"}
          </Button>
        </div>
      </div>

      <div style={styles.cardFlat}>
        <h3 style={{ marginTop: 0 }}>Upload MP4</h3>
        <p style={styles.muted}>
          Use a local stream recording from your computer.
        </p>

        <div style={{ marginTop: "14px" }}>
          <VideoUpload onUploaded={handleUploadedVideo} />
        </div>
      </div>
    </div>
  );
}
