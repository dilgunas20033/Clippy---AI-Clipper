// App.jsx

import { useEffect, useState } from "react";
import { DEFAULT_SETTINGS, readSavedSettings } from "./config/defaultSettings";
import { appStyles } from "./styles/appStyles";
import PageHeader from "./components/layout/PageHeader";

import BaseButton from "./components/common/Button";
import AppShell from "./components/layout/AppShell";
import BaseExportPreviewCard from "./components/exports/ExportPreviewCard";
import BaseCropBoxEditor from "./components/editor/CropBoxEditor";
import ProjectPage from "./components/project/ProjectPage";
import AnalyzePage from "./components/analyze/AnalyzePage";
import ClipsPage from "./components/clips/ClipsPage";
import ClipWorkflowPage from "./components/clips/ClipWorkflowPage";
import SubtitleEditorPage from "./components/subtitles/SubtitleEditorPage";
import CropEditorPage from "./components/editor/CropEditorPage";
import ExportsPage from "./components/exports/ExportsPage";
import SettingsPage from "./components/settings/SettingsPage";
import ProjectSettingsPage from "./components/project/ProjectSettingsPage";
import WorkspaceContentRouter from "./components/project/workspace/WorkspaceContentRouter";

import API from "./api";

function App() {
  const [activeTab, setActiveTab] = useState("project");
  const [settings, setSettings] = useState(readSavedSettings);

  const [videoData, setVideoData] = useState(null);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  const [clips, setClips] = useState([]);
  const [transcriptSegments, setTranscriptSegments] = useState([]);
  const [editingTranscript, setEditingTranscript] = useState(false);

  const [exportedClips, setExportedClips] = useState([]);
  const [smartVerticalClips, setSmartVerticalClips] = useState([]);
  const [subtitledVerticalClips, setSubtitledVerticalClips] = useState([]);

  const [layoutData, setLayoutData] = useState(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [processingProject, setProcessingProject] = useState(null);
  const [analyzeMode, setAnalyzeMode] = useState(settings.analyzeMode);

  const [exporting, setExporting] = useState(false);
  const [exportingSmartVertical, setExportingSmartVertical] = useState(false);
  const [exportingSubtitledVertical, setExportingSubtitledVertical] =
    useState(false);

  const [detectingLayout, setDetectingLayout] = useState(false);

  const [focusedClipIndex, setFocusedClipIndex] = useState(null);
  const [singleExportedClip, setSingleExportedClip] = useState(null);
  const [exportingSingleClip, setExportingSingleClip] = useState(false);
  const [exportingSingleSubtitledClip, setExportingSingleSubtitledClip] =
    useState(false);

  const [selectedClipIndexes, setSelectedClipIndexes] = useState([]);
  const [batchExportingVertical, setBatchExportingVertical] = useState(false);
  const [batchExportingSubtitled, setBatchExportingSubtitled] = useState(false);

  const [selectedClipIndex, setSelectedClipIndex] = useState(null);
  const [cropPreset, setCropPreset] = useState(null);
  const [customFacecamBox, setCustomFacecamBox] = useState(null);
  const [customGameplayBox, setCustomGameplayBox] = useState(null);
  const [customExportedClip, setCustomExportedClip] = useState(null);
  const [loadingCropPreset, setLoadingCropPreset] = useState(false);
  const [exportingCustomClip, setExportingCustomClip] = useState(false);

  const [systemCheck, setSystemCheck] = useState(null);
  const [checkingSystem, setCheckingSystem] = useState(false);

  const exportedCount =
    exportedClips.length +
    smartVerticalClips.length +
    subtitledVerticalClips.length +
    (customExportedClip ? 1 : 0);

  useEffect(() => {
    localStorage.setItem("ai_clipper_settings", JSON.stringify(settings));
  }, [settings]);

  const styles = appStyles;

  const Button = (props) => <BaseButton {...props} styles={styles} />;

  const StatCard = (props) => <BaseStatCard {...props} styles={styles} />;

  const ExportPreviewCard = (props) => (
    <BaseExportPreviewCard
      {...props}
      styles={styles}
      getVideoPreviewUrl={getVideoPreviewUrl}
    />
  );

  const CropBoxEditor = (props) => (
    <BaseCropBoxEditor
      {...props}
      styles={styles}
      updateCropBoxField={updateCropBoxField}
    />
  );

  const resetClipWorkState = () => {
    setFocusedClipIndex(null);
    setSingleExportedClip(null);
    setSelectedClipIndexes([]);
    setSelectedClipIndex(null);
    setCropPreset(null);
    setCustomFacecamBox(null);
    setCustomGameplayBox(null);
    setCustomExportedClip(null);
  };

  const resetForNewVideo = (data, options = {}) => {
    const shouldStartAnalysis = Boolean(
      options.startAnalysis || data.should_start_analysis
    );

    setVideoData(data);
    setCurrentProjectId(data.project_id || null);

    if (data.project_options?.analysisMode) {
      setAnalyzeMode(data.project_options.analysisMode);
    }

    setClips([]);
    setTranscriptSegments([]);
    setEditingTranscript(false);
    setExportedClips([]);
    setSmartVerticalClips([]);
    setSubtitledVerticalClips([]);
    setLayoutData(null);
    resetClipWorkState();
    setActiveTab("analyze");

    if (shouldStartAnalysis) {
      setProcessingProject({
        projectId: data.project_id || null,
        title: data.video_title || data.title || "Untitled Project",
        mode: data.project_options?.analysisMode || analyzeMode || settings.analyzeMode,
        status: "queued",
      });

      setTimeout(() => {
        runAnalyzeForVideo(data);
      }, 250);
    }
  };

  const saveProjectData = async (dataType, data, projectIdOverride = null) => {
    const projectId = projectIdOverride || currentProjectId;
    if (!projectId) return;

    try {
      await API.post("/projects/save-data", {
        project_id: projectId,
        data_type: dataType,
        data,
      });
    } catch (err) {
      console.error(`Failed to save project ${dataType}`, err);
    }
  };

  const buildLayoutDataFromExportResponse = (data) => ({
    layout_type: data.layout_type,
    confidence: data.confidence,
    reason: data.reason,
    facecam_box: data.facecam_box,
    gameplay_box: data.gameplay_box,
  });

  const getVideoPreviewUrl = (clip) => {
    if (!clip?.file_url) return null;
    if (clip.file_url.startsWith("http")) return clip.file_url;
    return `http://127.0.0.1:8000${clip.file_url}`;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch (err) {
      console.error(err);
      alert("Failed to copy.");
    }
  };

  const updateClipStatus = async (clipIndex, status) => {
    const nextClips = clips.map((clip, index) => {
      if (index !== clipIndex) return clip;
      return { ...clip, status };
    });

    setClips(nextClips);
    await saveProjectData("clips", nextClips);
  };

  const toggleClipSelection = (clipIndex) => {
    setSelectedClipIndexes((prev) => {
      if (prev.includes(clipIndex)) {
        return prev.filter((index) => index !== clipIndex);
      }

      return [...prev, clipIndex];
    });
  };

  const clearClipSelection = () => {
    setSelectedClipIndexes([]);
  };

  const selectAllClips = () => {
    setSelectedClipIndexes(clips.map((_, index) => index));
  };

  const selectKeepClips = () => {
    const keepIndexes = clips
      .map((clip, index) => ({ clip, index }))
      .filter(({ clip }) => clip.status === "keep")
      .map(({ index }) => index);

    setSelectedClipIndexes(keepIndexes);
  };

  const selectMaybeClips = () => {
    const maybeIndexes = clips
      .map((clip, index) => ({ clip, index }))
      .filter(({ clip }) => !clip.status || clip.status === "maybe")
      .map(({ index }) => index);

    setSelectedClipIndexes(maybeIndexes);
  };

  const selectScore80PlusClips = () => {
    const scoreIndexes = clips
      .map((clip, index) => ({ clip, index }))
      .filter(({ clip }) => Number(clip.score || 0) >= 80)
      .map(({ index }) => index);

    setSelectedClipIndexes(scoreIndexes);
  };

  const selectTop10Clips = () => {
    const topIndexes = clips
      .map((clip, index) => ({ clip, index }))
      .sort((a, b) => Number(b.clip.score || 0) - Number(a.clip.score || 0))
      .slice(0, 10)
      .map(({ index }) => index);

    setSelectedClipIndexes(topIndexes);
  };

  const getSelectedClips = () => {
    return selectedClipIndexes.map((index) => clips[index]).filter(Boolean);
  };

  const getProjectAnalyzeConfig = (targetVideoData = videoData) => {
    const projectOptions = targetVideoData?.project_options || {};

    let maxClips = Math.max(1, Number(settings.maxClips) || 50);
    let minScore = Math.max(0, Math.min(100, Number(settings.minScore) || 65));
    let minDuration = Math.max(1, Number(settings.minDuration) || 20);
    let maxDuration = Math.max(minDuration, Number(settings.maxDuration) || 60);
    let mode = projectOptions.analysisMode || analyzeMode || settings.analyzeMode;

    if (projectOptions.clipGoal === "best_10") {
      maxClips = 10;
      minScore = 75;
      minDuration = 15;
      maxDuration = 55;
    }

    if (projectOptions.clipGoal === "best_25") {
      maxClips = 25;
      minScore = 65;
      minDuration = 18;
      maxDuration = 60;
    }

    if (projectOptions.clipGoal === "find_everything") {
      maxClips = 75;
      minScore = 55;
      minDuration = 12;
      maxDuration = 70;
    }

    if (projectOptions.streamType === "horror_reaction") {
      mode = "deep";
      minScore = Math.min(minScore, 65);
    }

    if (projectOptions.streamType === "podcast") {
      mode = "fast";
      minDuration = 25;
      maxDuration = 90;
    }

    if (projectOptions.streamType === "irl_talking") {
      minDuration = 20;
      maxDuration = 75;
    }

    return {
      maxClips,
      minScore,
      minDuration,
      maxDuration,
      mode,
      useReactionDetection: mode === "deep",
    };
  };

  const runAnalyzeForVideo = async (targetVideoData = videoData) => {
    const analyzeConfig = getProjectAnalyzeConfig(targetVideoData);

    if (!targetVideoData?.video_path) return;

    const projectId = targetVideoData.project_id || currentProjectId || null;

    try {
      setAnalyzing(true);
      setProcessingProject({
        projectId,
        title: targetVideoData.video_title || targetVideoData.title || "Untitled Project",
        mode: analyzeConfig.mode,
        status: "analyzing",
      });

      setAnalyzeMode(analyzeConfig.mode);
      setExportedClips([]);
      setSmartVerticalClips([]);
      setSubtitledVerticalClips([]);
      setLayoutData(null);
      resetClipWorkState();

      const res = await API.post("/analyze", {
        video_path: targetVideoData.video_path,
        max_clips: analyzeConfig.maxClips,
        min_score: analyzeConfig.minScore,
        min_duration: analyzeConfig.minDuration,
        max_duration: analyzeConfig.maxDuration,
        use_reaction_detection: analyzeConfig.useReactionDetection,
      });

      const nextClips = res.data.clips || [];
      const nextTranscriptSegments = res.data.transcript_segments || [];

      setClips(nextClips);
      setTranscriptSegments(nextTranscriptSegments);
      setEditingTranscript(false);

      await saveProjectData("clips", nextClips, targetVideoData.project_id);
      await saveProjectData(
        "transcript",
        nextTranscriptSegments,
        targetVideoData.project_id
      );

      setProcessingProject({
        projectId,
        title: targetVideoData.video_title || targetVideoData.title || "Untitled Project",
        mode: analyzeConfig.mode,
        status: "complete",
        clipCount: nextClips.length,
      });

      setActiveTab("clips");

      setTimeout(() => {
        setProcessingProject((current) => {
          if (current?.projectId !== projectId) return current;
          return null;
        });
      }, 4000);
    } catch (err) {
      console.error(err);

      setProcessingProject({
        projectId,
        title: targetVideoData.video_title || targetVideoData.title || "Untitled Project",
        mode: analyzeConfig.mode,
        status: "failed",
      });

      alert("Failed to analyze video. Check backend terminal.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAnalyze = async () => {
    await runAnalyzeForVideo(videoData);
  };

  const handleDetectLayout = async () => {
    if (!videoData?.video_path) return;

    try {
      setDetectingLayout(true);

      const res = await API.post("/detect-layout", {
        video_path: videoData.video_path,
      });

      setLayoutData(res.data);
      await saveProjectData("layout", res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to detect layout. Check backend terminal.");
    } finally {
      setDetectingLayout(false);
    }
  };

  const handleExportClips = async () => {
    if (!videoData?.video_path || clips.length === 0) return;

    try {
      setExporting(true);

      const res = await API.post("/export-clips", {
        video_path: videoData.video_path,
        clips,
      });

      const nextExportedClips = res.data.exported_clips || [];
      setExportedClips(nextExportedClips);

      await saveProjectData("exports", {
        horizontal: nextExportedClips,
        smart_vertical: smartVerticalClips,
        subtitled_vertical: subtitledVerticalClips,
      });

      setActiveTab("exports");
    } catch (err) {
      console.error(err);
      alert("Failed to export horizontal clips. Check backend terminal.");
    } finally {
      setExporting(false);
    }
  };

  const handleExportSmartVerticalClips = async () => {
    if (!videoData?.video_path || clips.length === 0) return;

    try {
      setExportingSmartVertical(true);

      const res = await API.post("/export-smart-vertical-clips", {
        video_path: videoData.video_path,
        clips,
      });

      const nextSmartVerticalClips = res.data.exported_clips || [];
      const nextLayoutData = buildLayoutDataFromExportResponse(res.data);

      setLayoutData(nextLayoutData);
      setSmartVerticalClips(nextSmartVerticalClips);

      await saveProjectData("layout", nextLayoutData);
      await saveProjectData("exports", {
        horizontal: exportedClips,
        smart_vertical: nextSmartVerticalClips,
        subtitled_vertical: subtitledVerticalClips,
      });

      setActiveTab("exports");
    } catch (err) {
      console.error(err);
      alert("Failed to export smart vertical clips. Check backend terminal.");
    } finally {
      setExportingSmartVertical(false);
    }
  };

  const handleExportSmartVerticalSubtitledClips = async () => {
    if (
      !videoData?.video_path ||
      clips.length === 0 ||
      transcriptSegments.length === 0
    ) {
      alert("Analyze the video first so subtitles can be generated.");
      return;
    }

    try {
      setExportingSubtitledVertical(true);

      const res = await API.post("/export-smart-vertical-subtitled-clips", {
        video_path: videoData.video_path,
        clips,
        transcript_segments: transcriptSegments,
      });

      const nextSubtitledVerticalClips = res.data.exported_clips || [];
      const nextLayoutData = buildLayoutDataFromExportResponse(res.data);

      setLayoutData(nextLayoutData);
      setSubtitledVerticalClips(nextSubtitledVerticalClips);

      await saveProjectData("layout", nextLayoutData);
      await saveProjectData("exports", {
        horizontal: exportedClips,
        smart_vertical: smartVerticalClips,
        subtitled_vertical: nextSubtitledVerticalClips,
      });

      setActiveTab("exports");
    } catch (err) {
      console.error(err);
      alert("Failed to export subtitled vertical clips. Check backend terminal.");
    } finally {
      setExportingSubtitledVertical(false);
    }
  };

  const exportSelectedSmartVerticalClips = async () => {
    const selectedClips = getSelectedClips();

    if (!videoData?.video_path || selectedClips.length === 0) {
      alert("Select at least one clip first.");
      return;
    }

    try {
      setBatchExportingVertical(true);

      const res = await API.post("/export-smart-vertical-clips", {
        video_path: videoData.video_path,
        clips: selectedClips,
      });

      const exported = res.data.exported_clips || [];

      if (exported.length === 0) {
        alert("No clips were exported.");
        return;
      }

      const nextSmartVerticalClips = [...smartVerticalClips, ...exported];
      const nextLayoutData = buildLayoutDataFromExportResponse(res.data);

      setSmartVerticalClips(nextSmartVerticalClips);
      setLayoutData(nextLayoutData);

      await saveProjectData("layout", nextLayoutData);
      await saveProjectData("exports", {
        horizontal: exportedClips,
        smart_vertical: nextSmartVerticalClips,
        subtitled_vertical: subtitledVerticalClips,
      });

      setActiveTab("exports");
    } catch (err) {
      console.error(err);
      alert("Failed to batch export vertical clips. Check backend terminal.");
    } finally {
      setBatchExportingVertical(false);
    }
  };

  const exportSelectedSubtitledVerticalClips = async () => {
    const selectedClips = getSelectedClips();

    if (!videoData?.video_path || selectedClips.length === 0) {
      alert("Select at least one clip first.");
      return;
    }

    if (transcriptSegments.length === 0) {
      alert("Analyze the video first so subtitles are available.");
      return;
    }

    try {
      setBatchExportingSubtitled(true);

      const res = await API.post("/export-smart-vertical-subtitled-clips", {
        video_path: videoData.video_path,
        clips: selectedClips,
        transcript_segments: transcriptSegments,
      });

      const exported = res.data.exported_clips || [];

      if (exported.length === 0) {
        alert("No clips were exported.");
        return;
      }

      const nextSubtitledVerticalClips = [
        ...subtitledVerticalClips,
        ...exported,
      ];
      const nextLayoutData = buildLayoutDataFromExportResponse(res.data);

      setSubtitledVerticalClips(nextSubtitledVerticalClips);
      setLayoutData(nextLayoutData);

      await saveProjectData("layout", nextLayoutData);
      await saveProjectData("exports", {
        horizontal: exportedClips,
        smart_vertical: smartVerticalClips,
        subtitled_vertical: nextSubtitledVerticalClips,
      });

      setActiveTab("exports");
    } catch (err) {
      console.error(err);
      alert("Failed to batch export subtitled clips. Check backend terminal.");
    } finally {
      setBatchExportingSubtitled(false);
    }
  };

  const exportSingleSmartVerticalClip = async (clipIndex) => {
    if (!videoData?.video_path || !clips[clipIndex]) return;

    try {
      setExportingSingleClip(true);

      const clip = clips[clipIndex];

      const res = await API.post("/export-smart-vertical-clips", {
        video_path: videoData.video_path,
        clips: [clip],
      });

      const exported = res.data.exported_clips?.[0];

      if (!exported) {
        alert("No clip was exported.");
        return;
      }

      const nextSmartVerticalClips = [...smartVerticalClips, exported];
      const nextLayoutData = buildLayoutDataFromExportResponse(res.data);

      setSingleExportedClip(exported);
      setSmartVerticalClips(nextSmartVerticalClips);
      setLayoutData(nextLayoutData);

      await saveProjectData("layout", nextLayoutData);
      await saveProjectData("exports", {
        horizontal: exportedClips,
        smart_vertical: nextSmartVerticalClips,
        subtitled_vertical: subtitledVerticalClips,
      });

      setActiveTab("clip-workflow");
    } catch (err) {
      console.error(err);
      alert("Failed to export this vertical clip. Check backend terminal.");
    } finally {
      setExportingSingleClip(false);
    }
  };

  const exportSingleSubtitledVerticalClip = async (clipIndex) => {
    if (!videoData?.video_path || !clips[clipIndex]) return;

    if (transcriptSegments.length === 0) {
      alert("Analyze the video first so subtitles are available.");
      return;
    }

    try {
      setExportingSingleSubtitledClip(true);

      const clip = clips[clipIndex];

      const res = await API.post("/export-smart-vertical-subtitled-clips", {
        video_path: videoData.video_path,
        clips: [clip],
        transcript_segments: transcriptSegments,
      });

      const exported = res.data.exported_clips?.[0];

      if (!exported) {
        alert("No clip was exported.");
        return;
      }

      const nextSubtitledVerticalClips = [...subtitledVerticalClips, exported];
      const nextLayoutData = buildLayoutDataFromExportResponse(res.data);

      setSingleExportedClip(exported);
      setSubtitledVerticalClips(nextSubtitledVerticalClips);
      setLayoutData(nextLayoutData);

      await saveProjectData("layout", nextLayoutData);
      await saveProjectData("exports", {
        horizontal: exportedClips,
        smart_vertical: smartVerticalClips,
        subtitled_vertical: nextSubtitledVerticalClips,
      });

      setActiveTab("clip-workflow");
    } catch (err) {
      console.error(err);
      alert("Failed to export this subtitled clip. Check backend terminal.");
    } finally {
      setExportingSingleSubtitledClip(false);
    }
  };

  const handleOpenProject = (project) => {
    setCurrentProjectId(project.id);

    setVideoData({
      project_id: project.id,
      video_title: project.title,
      video_path: project.video_path,
      duration: project.duration,
      source_type: project.source_type,
      download_quality: project.download_quality,
      cookie_mode_used: project.cookie_mode_used,
      project_options: project.project_options || null,
    });

    if (project.project_options?.analysisMode) {
      setAnalyzeMode(project.project_options.analysisMode);
    } else {
      setAnalyzeMode(settings.analyzeMode);
    }

    setClips(project.clips || []);
    setTranscriptSegments(project.transcript_segments || []);
    setLayoutData(project.layout || null);
    setExportedClips(project.exports?.horizontal || []);
    setSmartVerticalClips(project.exports?.smart_vertical || []);
    setSubtitledVerticalClips(project.exports?.subtitled_vertical || []);

    setEditingTranscript(false);
    resetClipWorkState();
    setActiveTab("clips");
  };

  const handleProjectDeleted = (deletedProjectId) => {
    if (currentProjectId !== deletedProjectId) return;

    setVideoData(null);
    setCurrentProjectId(null);
    setClips([]);
    setTranscriptSegments([]);
    setEditingTranscript(false);
    setExportedClips([]);
    setSmartVerticalClips([]);
    setSubtitledVerticalClips([]);
    setLayoutData(null);
    setProcessingProject(null);
    resetClipWorkState();
    setActiveTab("project");
  };

  const generateSocialCopyForClip = async (clipIndex) => {
    try {
      const clip = clips[clipIndex];

      const res = await API.post("/generate-social-copy", {
        clip,
      });

      const socialCopy = res.data.social_copy || {};

      const nextClips = clips.map((currentClip, index) => {
        if (index !== clipIndex) return currentClip;

        return {
          ...currentClip,
          ...socialCopy,
        };
      });

      setClips(nextClips);
      await saveProjectData("clips", nextClips);
    } catch (err) {
      console.error(err);
      alert("Failed to generate AI copy. Check backend terminal.");
    }
  };

  const updateTranscriptSegmentText = (segmentIndex, newText) => {
    const nextSegments = transcriptSegments.map((segment, index) => {
      if (index !== segmentIndex) return segment;

      return {
        ...segment,
        text: newText,
      };
    });

    setTranscriptSegments(nextSegments);
  };

  const saveEditedTranscript = async () => {
    try {
      await saveProjectData("transcript", transcriptSegments);
      alert("Transcript saved.");
    } catch (err) {
      console.error(err);
      alert("Failed to save transcript.");
    }
  };

  const resetTranscriptFromProject = async () => {
    if (!currentProjectId) return;

    try {
      const res = await API.get(`/projects/${currentProjectId}`);
      const projectTranscript =
        res.data.transcript_segments || res.data.project?.transcript_segments || [];

      setTranscriptSegments(projectTranscript);
      alert("Transcript reset from saved project.");
    } catch (err) {
      console.error(err);
      alert("Failed to reload transcript.");
    }
  };

  const updateCropBoxField = (boxType, field, value) => {
    const numberValue = Number(value);
    if (Number.isNaN(numberValue)) return;

    if (boxType === "facecam") {
      setCustomFacecamBox((prev) => ({
        ...prev,
        [field]: numberValue,
      }));
    }

    if (boxType === "gameplay") {
      setCustomGameplayBox((prev) => ({
        ...prev,
        [field]: numberValue,
      }));
    }
  };

  const loadCropPresetForClip = async (clipIndex) => {
    if (!videoData?.video_path) return;

    if (!layoutData) {
      alert("Detect layout first before editing crop.");
      setActiveTab("analyze");
      return;
    }

    try {
      setLoadingCropPreset(true);
      setSelectedClipIndex(clipIndex);
      setCustomExportedClip(null);

      const res = await API.post("/crop-preset", {
        video_path: videoData.video_path,
        layout: layoutData,
      });

      setCropPreset(res.data);
      setCustomFacecamBox(res.data.facecam_box);
      setCustomGameplayBox(res.data.gameplay_box);
      setActiveTab("editor");
    } catch (err) {
      console.error(err);
      alert("Failed to load crop preset. Check backend terminal.");
    } finally {
      setLoadingCropPreset(false);
    }
  };

  const exportCustomVerticalClip = async () => {
    if (
      selectedClipIndex === null ||
      !videoData?.video_path ||
      !customFacecamBox ||
      !customGameplayBox
    ) {
      alert("Select a clip and load crop settings first.");
      return;
    }

    try {
      setExportingCustomClip(true);

      const selectedClip = {
        ...clips[selectedClipIndex],
        index: selectedClipIndex + 1,
      };

      const res = await API.post("/export-custom-vertical-clip", {
        video_path: videoData.video_path,
        clip: selectedClip,
        facecam_box: customFacecamBox,
        gameplay_box: customGameplayBox,
      });

      const nextCustomClip = res.data.exported_clip;
      setCustomExportedClip(nextCustomClip);

      await saveProjectData("custom_export", nextCustomClip);
    } catch (err) {
      console.error(err);
      alert("Failed to export custom vertical clip. Check backend terminal.");
    } finally {
      setExportingCustomClip(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "analyzeMode") {
      setAnalyzeMode(value);
    }
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    setAnalyzeMode(DEFAULT_SETTINGS.analyzeMode);
  };

  const updateProjectOptions = async (nextOptions) => {
    if (!videoData) return;

    const nextVideoData = {
      ...videoData,
      project_options: nextOptions,
    };

    setVideoData(nextVideoData);

    if (nextOptions.analysisMode) {
      setAnalyzeMode(nextOptions.analysisMode);
    }

    if (currentProjectId) {
      await saveProjectData("project_options", nextOptions);
    }
  };


  const closeCropEditor = () => {
    setSelectedClipIndex(null);
    setCropPreset(null);
    setCustomFacecamBox(null);
    setCustomGameplayBox(null);
    setCustomExportedClip(null);
  };

  const runSystemCheck = async () => {
    try {
      setCheckingSystem(true);

      const res = await API.get("/system-check");

      setSystemCheck(res.data);
    } catch (err) {
      console.error(err);

      setSystemCheck({
        success: false,
        error: "Backend system check failed.",
      });
    } finally {
      setCheckingSystem(false);
    }
  };

  const renderHeader = (title, subtitle) => (
    <PageHeader title={title} subtitle={subtitle} styles={styles} />
  );

  const renderDashboardStats = () => (
    <DashboardStats
      clips={clips}
      transcriptSegments={transcriptSegments}
      exportedCount={exportedCount}
      layoutData={layoutData}
      styles={styles}
    />
  );

  const renderProjectTab = () => (
    <ProjectPage
      videoData={videoData}
      currentProjectId={currentProjectId}
      layoutData={layoutData}
      analyzeMode={analyzeMode}
      resetForNewVideo={resetForNewVideo}
      analyzing={analyzing}
      processingProject={processingProject}
      handleOpenProject={handleOpenProject}
      onProjectDeleted={handleProjectDeleted}
      setActiveTab={setActiveTab}
      styles={styles}
      renderHeader={renderHeader}
    />
  );

  const renderAnalyzeTab = () => (
    <AnalyzePage
      videoData={videoData}
      currentProjectId={currentProjectId}
      layoutData={layoutData}
      analyzeMode={analyzeMode}
      setAnalyzeMode={setAnalyzeMode}
      updateSetting={updateSetting}
      settings={settings}
      handleAnalyze={handleAnalyze}
      analyzing={analyzing}
      handleDetectLayout={handleDetectLayout}
      detectingLayout={detectingLayout}
      clips={clips}
      transcriptSegments={transcriptSegments}
      exportedCount={exportedCount}
      styles={styles}
      renderHeader={renderHeader}
      setActiveTab={setActiveTab}
      projectAnalyzeConfig={getProjectAnalyzeConfig()}
    />
  );

  const renderClipsTab = () => (
    <ClipsPage
      clips={clips}
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
      toggleClipSelection={toggleClipSelection}
      setFocusedClipIndex={setFocusedClipIndex}
      setSingleExportedClip={setSingleExportedClip}
      setActiveTab={setActiveTab}
      loadCropPresetForClip={loadCropPresetForClip}
      generateSocialCopyForClip={generateSocialCopyForClip}
      copyToClipboard={copyToClipboard}
      styles={styles}
      renderHeader={renderHeader}
    />
  );

  const renderClipWorkflowTab = () => (
    <ClipWorkflowPage
      focusedClipIndex={focusedClipIndex}
      clips={clips}
      updateClipStatus={updateClipStatus}
      generateSocialCopyForClip={generateSocialCopyForClip}
      loadCropPresetForClip={loadCropPresetForClip}
      exportSingleSmartVerticalClip={exportSingleSmartVerticalClip}
      exportingSingleClip={exportingSingleClip}
      exportSingleSubtitledVerticalClip={exportSingleSubtitledVerticalClip}
      exportingSingleSubtitledClip={exportingSingleSubtitledClip}
      setFocusedClipIndex={setFocusedClipIndex}
      setSingleExportedClip={setSingleExportedClip}
      setActiveTab={setActiveTab}
      singleExportedClip={singleExportedClip}
      styles={styles}
      renderHeader={renderHeader}
      ExportPreviewCard={ExportPreviewCard}
      copyToClipboard={copyToClipboard}
    />
  );

  const renderSubtitlesTab = () => (
    <SubtitleEditorPage
      transcriptSegments={transcriptSegments}
      editingTranscript={editingTranscript}
      setEditingTranscript={setEditingTranscript}
      updateTranscriptSegmentText={updateTranscriptSegmentText}
      saveEditedTranscript={saveEditedTranscript}
      resetTranscriptFromProject={resetTranscriptFromProject}
      styles={styles}
      renderHeader={renderHeader}
    />
  );

  const renderEditorTab = () => (
    <CropEditorPage
      selectedClipIndex={selectedClipIndex}
      cropPreset={cropPreset}
      loadingCropPreset={loadingCropPreset}
      customFacecamBox={customFacecamBox}
      customGameplayBox={customGameplayBox}
      exportCustomVerticalClip={exportCustomVerticalClip}
      exportingCustomClip={exportingCustomClip}
      closeCropEditor={closeCropEditor}
      customExportedClip={customExportedClip}
      styles={styles}
      renderHeader={renderHeader}
      CropBoxEditor={CropBoxEditor}
      ExportPreviewCard={ExportPreviewCard}
    />
  );

  const renderExportsTab = () => (
    <ExportsPage
      exportedCount={exportedCount}
      customExportedClip={customExportedClip}
      exportedClips={exportedClips}
      smartVerticalClips={smartVerticalClips}
      subtitledVerticalClips={subtitledVerticalClips}
      styles={styles}
      renderHeader={renderHeader}
      ExportPreviewCard={ExportPreviewCard}
    />
  );

  const renderSettingsTab = () => (
    <SettingsPage
      settings={settings}
      updateSetting={updateSetting}
      setSettings={setSettings}
      setAnalyzeMode={setAnalyzeMode}
      resetSettings={resetSettings}
      systemCheck={systemCheck}
      checkingSystem={checkingSystem}
      runSystemCheck={runSystemCheck}
      styles={styles}
      renderHeader={renderHeader}
    />
  );

  const renderProjectSettingsTab = () => (
    <ProjectSettingsPage
      videoData={videoData}
      analyzeMode={analyzeMode}
      updateProjectOptions={updateProjectOptions}
      styles={styles}
      renderHeader={renderHeader}
    />
  );

  const renderActiveTab = () => {
    if (activeTab === "project") return renderProjectTab();
    if (activeTab === "settings") return renderSettingsTab();

    return (
      <WorkspaceContentRouter
        activeTab={activeTab}
        renderAnalyzeTab={renderAnalyzeTab}
        renderClipsTab={renderClipsTab}
        renderClipWorkflowTab={renderClipWorkflowTab}
        renderSubtitlesTab={renderSubtitlesTab}
        renderEditorTab={renderEditorTab}
        renderExportsTab={renderExportsTab}
        renderProjectSettingsTab={renderProjectSettingsTab}
        renderProjectTab={renderProjectTab}
      />
    );
  };

  return (
    <AppShell
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      clips={clips}
      selectedClipIndexes={selectedClipIndexes}
      focusedClipIndex={focusedClipIndex}
      transcriptSegments={transcriptSegments}
      exportedCount={exportedCount}
      videoData={videoData}
      styles={styles}
      handleAnalyze={handleAnalyze}
      analyzing={analyzing}
      handleDetectLayout={handleDetectLayout}
      detectingLayout={detectingLayout}
    >
      {renderActiveTab()}
    </AppShell>
  );
}

export default App;
