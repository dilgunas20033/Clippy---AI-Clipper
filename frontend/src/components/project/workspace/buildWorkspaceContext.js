import {
  getWorkspaceDescription,
  getWorkspaceTitle,
  getWorkspaceViewName,
  isWorkspaceTab,
} from "./workspaceTabs";

export function buildWorkspaceContext({
  activeTab,
  videoData,
  clips,
  selectedClipIndexes,
  focusedClipIndex,
  transcriptSegments,
  exportedCount,
}) {
  const projectOptions = videoData?.project_options || {};
  const clipCount = clips.length;
  const selectedClipCount = selectedClipIndexes.length;
  const subtitleCount = transcriptSegments.length;

  return {
    activeTab,
    isWorkspace: isWorkspaceTab(activeTab),
    title: getWorkspaceTitle(activeTab),
    view: getWorkspaceViewName(activeTab),
    description: getWorkspaceDescription(activeTab),

    project: {
      id: videoData?.project_id || null,
      title: videoData?.video_title || videoData?.title || "Untitled Project",
      sourceType: videoData?.source_type || "local",
      videoPath: videoData?.video_path || "",
      options: projectOptions,
      hasVideo: Boolean(videoData?.video_path),
    },

    counts: {
      clips: clipCount,
      selectedClips: selectedClipCount,
      subtitles: subtitleCount,
      exports: exportedCount,
    },

    focusedClip: {
      index: focusedClipIndex,
      displayIndex: focusedClipIndex !== null ? focusedClipIndex + 1 : null,
    },

    status: {
      hasClips: clipCount > 0,
      hasSelectedClips: selectedClipCount > 0,
      hasSubtitles: subtitleCount > 0,
      hasExports: exportedCount > 0,
    },
  };
}
