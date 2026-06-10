import ProjectWorkspaceSidebar from "./ProjectWorkspaceSidebar";
import ProjectWorkspaceHeader from "./ProjectWorkspaceHeader";
import ProjectWorkspaceActionBar from "./ProjectWorkspaceActionBar";
import ProjectWorkspaceTimeline from "./ProjectWorkspaceTimeline";

export default function ProjectWorkspaceShell({
  activeTab,
  setActiveTab,
  clips,
  selectedClipIndexes,
  focusedClipIndex,
  transcriptSegments,
  exportedCount,
  videoData,
  styles,
  workspaceContext,
  handleAnalyze,
  analyzing,
  handleDetectLayout,
  detectingLayout,
  children,
}) {
  const context =
    workspaceContext || {
      project: {
        hasVideo: Boolean(videoData),
        title: videoData?.video_title || videoData?.title || "Untitled Project",
      },
      counts: {
        clips: clips.length,
        selectedClips: selectedClipIndexes.length,
        subtitles: transcriptSegments.length,
        exports: exportedCount,
      },
      focusedClip: {
        displayIndex: focusedClipIndex !== null ? focusedClipIndex + 1 : null,
      },
      status: {
        hasClips: clips.length > 0,
        hasSelectedClips: selectedClipIndexes.length > 0,
        hasSubtitles: transcriptSegments.length > 0,
        hasExports: exportedCount > 0,
      },
    };

  return (
    <div style={styles.shell}>
      <ProjectWorkspaceSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        workspaceContext={context}
        styles={styles}
      />

      <main style={styles.main}>
        <ProjectWorkspaceHeader
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          videoData={videoData}
          clips={clips}
          transcriptSegments={transcriptSegments}
          exportedCount={exportedCount}
          styles={styles}
          workspaceContext={context}
        />

        <ProjectWorkspaceTimeline
          workspaceContext={context}
          styles={styles}
        />

        <ProjectWorkspaceActionBar
          workspaceContext={context}
          setActiveTab={setActiveTab}
          handleAnalyze={handleAnalyze}
          analyzing={analyzing}
          handleDetectLayout={handleDetectLayout}
          detectingLayout={detectingLayout}
          styles={styles}
        />

        {children}
      </main>
    </div>
  );
}
