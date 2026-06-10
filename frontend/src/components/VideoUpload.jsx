import { useState } from "react";
import API from "../api";

export default function VideoUpload({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async () => {
    if (!file) {
      alert("Choose a video file first.");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", file);

      const res = await API.post("/upload-video", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      onUploaded(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to upload video. Check backend terminal.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: "700px",
        margin: "30px auto",
        padding: "20px",
        border: "1px solid #ddd",
        borderRadius: "12px",
      }}
    >
      <h2>Upload Local Video</h2>
      <p>Use this for downloaded YouTube Studio/Twitch/OBS recordings.</p>

      <input
        type="file"
        accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      {file && (
        <p>
          <strong>Selected:</strong> {file.name}
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={uploading}
        style={{ marginTop: "12px" }}
      >
        {uploading ? "Uploading..." : "Upload Video"}
      </button>
    </div>
  );
}