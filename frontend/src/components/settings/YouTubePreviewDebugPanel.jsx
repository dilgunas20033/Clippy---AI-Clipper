import { useState } from "react";
import API from "../../api";
import Button from "../common/Button";
import { formatDuration } from "../project/new-project/WizardParts";

export default function YouTubePreviewDebugPanel({ styles }) {
  const [url, setUrl] = useState("");
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const testPreview = async () => {
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setError("Paste a YouTube link first.");
      setResult(null);
      return;
    }

    if (!trimmedUrl.includes("youtube.com") && !trimmedUrl.includes("youtu.be")) {
      setError("Paste a valid youtube.com or youtu.be link.");
      setResult(null);
      return;
    }

    try {
      setTesting(true);
      setError("");
      setResult(null);

      const res = await API.post("/youtube-preview", {
        url: trimmedUrl,
      });

      setResult(res.data);
    } catch (err) {
      console.error(err);

      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to call /youtube-preview.";

      setError(detail);
    } finally {
      setTesting(false);
    }
  };

  return (
    <div style={styles.card}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "16px",
          alignItems: "flex-start",
          marginBottom: "14px",
        }}
      >
        <div>
          <h2 style={styles.sectionTitle}>YouTube Preview Test</h2>
          <p style={styles.muted}>
            Paste a link to test <strong>POST /youtube-preview</strong> without
            going through the New Project wizard.
          </p>
        </div>

        <span style={result ? styles.goodBadge : styles.badge}>
          {result ? "Working" : "Debug"}
        </span>
      </div>

      <input
        value={url}
        onChange={(e) => {
          setUrl(e.target.value);
          setError("");
        }}
        placeholder="https://www.youtube.com/watch?v=..."
        style={styles.input}
      />

      <div style={styles.buttonRow}>
        <Button
          onClick={testPreview}
          disabled={testing}
          variant="primary"
          styles={styles}
        >
          {testing ? "Testing..." : "Test Preview Endpoint"}
        </Button>

        <Button
          onClick={() => {
            setUrl("");
            setResult(null);
            setError("");
          }}
          styles={styles}
        >
          Clear
        </Button>
      </div>

      {error && (
        <div
          style={{
            ...styles.cardFlat,
            marginTop: "14px",
            border: "1px solid rgba(251,191,36,0.35)",
            background:
              "linear-gradient(135deg, rgba(251,191,36,0.08), rgba(15,23,42,0.78))",
          }}
        >
          <span style={styles.warnBadge}>Preview endpoint error</span>

          <p style={{ ...styles.muted, margin: "8px 0 0" }}>{error}</p>

          <p style={{ ...styles.muted, margin: "8px 0 0", fontSize: "13px" }}>
            Check that your backend is running and that{" "}
            <strong>@app.post(&quot;/youtube-preview&quot;)</strong> is wired
            in backend/app/main.py.
          </p>
        </div>
      )}

      {result && (
        <div
          style={{
            ...styles.cardFlat,
            marginTop: "14px",
            border: "1px solid rgba(74,222,128,0.25)",
          }}
        >
          {result.thumbnail && (
            <img
              src={result.thumbnail}
              alt={result.title || "YouTube thumbnail"}
              style={{
                width: "100%",
                maxHeight: "260px",
                objectFit: "cover",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.08)",
                marginBottom: "14px",
              }}
            />
          )}

          <h3 style={{ marginTop: 0 }}>{result.title || "Untitled video"}</h3>

          <div style={{ marginBottom: "10px" }}>
            <span style={styles.goodBadge}>Endpoint OK</span>
            <span style={styles.badge}>{result.channel || "Unknown channel"}</span>
            <span style={styles.badge}>{formatDuration(result.duration)}</span>
          </div>

          <pre
            style={{
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              padding: "12px",
              borderRadius: "14px",
              background: "rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#cbd5e1",
              fontSize: "12px",
              margin: 0,
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
