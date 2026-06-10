import { useState } from "react";
import API from "../api";

function UrlInput({ onDownloaded }) {
  const [url, setUrl] = useState("");
  const [quality, setQuality] = useState("best");
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    if (!url.trim()) {
      alert("Paste a YouTube URL first.");
      return;
    }

    try {
      setLoading(true);

      const res = await API.post("/download", {
        url: url.trim(),
        quality,
      });

      onDownloaded(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to download video. Check backend terminal.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <label>
        <strong>YouTube URL</strong>

        <input
          type="text"
          placeholder="Paste YouTube link..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{
            display: "block",
            width: "100%",
            marginTop: "8px",
            padding: "12px",
            borderRadius: "12px",
            border: "1px solid rgba(255,255,255,0.15)",
            background: "rgba(0,0,0,0.25)",
            color: "#fff",
            boxSizing: "border-box",
          }}
        />
      </label>

      <div style={{ marginTop: "12px" }}>
        <label>
          <strong>Download Quality</strong>

          <select
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            style={{
              display: "block",
              width: "100%",
              marginTop: "8px",
              padding: "12px",
              borderRadius: "12px",
              border: "1px solid rgba(255,255,255,0.15)",
              background: "rgba(0,0,0,0.25)",
              color: "#fff",
              boxSizing: "border-box",
            }}
          >
            <option value="best">Best Available</option>
            <option value="1080p">1080p</option>
            <option value="720p">720p</option>
            <option value="fast_720p">Fast 720p</option>
          </select>
        </label>
      </div>

      <button
        onClick={handleDownload}
        disabled={loading}
        style={{
          marginTop: "14px",
          padding: "10px 14px",
          borderRadius: "12px",
          border: "1px solid rgba(129,140,248,0.6)",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          color: "#fff",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: 800,
          opacity: loading ? 0.6 : 1,
        }}
      >
        {loading ? "Downloading..." : "Download Video"}
      </button>
    </div>
  );
}

export default UrlInput;