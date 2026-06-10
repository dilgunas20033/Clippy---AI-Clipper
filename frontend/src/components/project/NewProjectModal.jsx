import { useState } from "react";
import Button from "../common/Button";
import API from "../../api";
import ConfirmVideoStep from "./new-project/ConfirmVideoStep";
import ProcessProjectStep from "./new-project/ProcessProjectStep";
import SetupOptionsStep from "./new-project/SetupOptionsStep";
import VideoSourceStep from "./new-project/VideoSourceStep";
import { DEFAULT_PROJECT_OPTIONS } from "./new-project/newProjectOptions";
import { StepPill } from "./new-project/WizardParts";

export default function NewProjectModal({ onClose, onProjectCreated, styles }) {
  const [step, setStep] = useState(1);
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [youtubePreview, setYoutubePreview] = useState(null);
  const [previewError, setPreviewError] = useState("");
  const [fetchingPreview, setFetchingPreview] = useState(false);
  const [downloadingYoutube, setDownloadingYoutube] = useState(false);
  const [pendingVideoData, setPendingVideoData] = useState(null);
  const [projectOptions, setProjectOptions] = useState(DEFAULT_PROJECT_OPTIONS);
  const [processMode, setProcessMode] = useState("create_only");

  const updateOption = (key, value) => {
    setProjectOptions((current) => ({ ...current, [key]: value }));
  };

  const fetchYoutubePreview = async () => {
    const trimmedUrl = youtubeUrl.trim();

    if (!trimmedUrl) {
      setPreviewError("Paste a YouTube link first.");
      return;
    }

    if (!trimmedUrl.includes("youtube.com") && !trimmedUrl.includes("youtu.be")) {
      setPreviewError("Paste a valid youtube.com or youtu.be link.");
      return;
    }

    try {
      setFetchingPreview(true);
      setYoutubePreview(null);
      setPreviewError("");

      const res = await API.post("/youtube-preview", { url: trimmedUrl });
      const preview = res.data || {};

      if (!preview.title && !preview.thumbnail && !preview.webpage_url) {
        throw new Error("The backend responded, but no preview data was returned.");
      }

      setYoutubePreview({
        ...preview,
        url: preview.url || trimmedUrl,
        webpage_url: preview.webpage_url || trimmedUrl,
      });
      setStep(2);
    } catch (err) {
      console.error(err);

      const detail =
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to fetch YouTube preview.";

      setPreviewError(
        `${detail} Make sure the backend is running and /youtube-preview is wired in main.py.`
      );
    } finally {
      setFetchingPreview(false);
    }
  };

  const downloadConfirmedYoutube = async () => {
    if (!youtubePreview?.url) return;

    try {
      setDownloadingYoutube(true);
      const res = await API.post("/download", { url: youtubePreview.url, quality: "1080p" });
      setPendingVideoData(res.data);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert("Failed to download YouTube video. Check backend terminal.");
    } finally {
      setDownloadingYoutube(false);
    }
  };

  const handleUploadedVideo = (data) => {
    setPendingVideoData(data);
    setYoutubePreview(null);
    setPreviewError("");
    setStep(2);
  };

  const resetVideoChoice = () => {
    setPendingVideoData(null);
    setYoutubePreview(null);
    setPreviewError("");
    setStep(1);
  };

  const handleFinishProject = () => {
    if (!pendingVideoData) {
      setStep(1);
      return;
    }

    onProjectCreated({
      ...pendingVideoData,
      project_options: projectOptions,
      process_mode: processMode,
      should_start_analysis: processMode === "create_and_analyze",
    });
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.72)", backdropFilter: "blur(10px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", boxSizing: "border-box" }}>
      <div style={{ ...styles.card, width: "100%", maxWidth: "920px", maxHeight: "90vh", overflowY: "auto", position: "relative" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: "16px", alignItems: "flex-start", marginBottom: "20px" }}>
          <div>
            <h2 style={{ ...styles.sectionTitle, fontSize: "28px" }}>New Project</h2>
            <p style={styles.muted}>Add the video first, confirm it, then choose the project settings.</p>
          </div>
          <Button onClick={onClose} variant="danger" styles={styles}>Close</Button>
        </div>

        <div style={{ ...styles.cardFlat, display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "18px" }}>
          <StepPill number={1} label="Add Video" active={step === 1} complete={step > 1} styles={styles} />
          <StepPill number={2} label="Confirm" active={step === 2} complete={step > 2} styles={styles} />
          <StepPill number={3} label="Setup" active={step === 3} complete={step > 3} styles={styles} />
          <StepPill number={4} label="Process" active={step === 4} complete={false} styles={styles} />
        </div>

        {step === 1 && (
          <VideoSourceStep
            youtubeUrl={youtubeUrl}
            setYoutubeUrl={(value) => {
              setYoutubeUrl(value);
              setPreviewError("");
            }}
            previewError={previewError}
            fetchingPreview={fetchingPreview}
            fetchYoutubePreview={fetchYoutubePreview}
            handleUploadedVideo={handleUploadedVideo}
            styles={styles}
          />
        )}

        {step === 2 && (
          <ConfirmVideoStep
            youtubePreview={youtubePreview}
            pendingVideoData={pendingVideoData}
            downloadingYoutube={downloadingYoutube}
            downloadConfirmedYoutube={downloadConfirmedYoutube}
            resetVideoChoice={resetVideoChoice}
            confirmUploadedVideo={() => setStep(3)}
            styles={styles}
          />
        )}

        {step === 3 && (
          <SetupOptionsStep projectOptions={projectOptions} updateOption={updateOption} setStep={setStep} styles={styles} />
        )}

        {step === 4 && (
          <ProcessProjectStep
            pendingVideoData={pendingVideoData}
            projectOptions={projectOptions}
            setStep={setStep}
            handleFinishProject={handleFinishProject}
            styles={styles}
          />
        )}
      </div>
    </div>
  );
}
