import ProjectWorkspaceShell from "./ProjectWorkspaceShell";
import NoProjectWorkspaceState from "./NoProjectWorkspaceState";
import { buildWorkspaceContext } from "./buildWorkspaceContext";
import { isWorkspaceTab } from "./workspaceTabs";

export default function ProjectWorkspacePage({
  activeTab,
  setActiveTab,
  clips,
  selectedClipIndexes,
  focusedClipIndex,
  transcriptSegments,
  exportedCount,
  videoData,
  styles,
  handleAnalyze,
  analyzing,
  handleDetectLayout,
  detectingLayout,
  children,
}) {
  const isValidWorkspaceTab = isWorkspaceTab(activeTab);

  if (!isValidWorkspaceTab) {
    return <div style={styles.page}>{children}</div>;
  }

  const hasLoadedProject = Boolean(videoData?.project_id || videoData?.video_path);

  if (!hasLoadedProject) {
    return <NoProjectWorkspaceState setActiveTab={setActiveTab} styles={styles} />;
  }

  const workspaceContext = buildWorkspaceContext({
    activeTab,
    videoData,
    clips,
    selectedClipIndexes,
    focusedClipIndex,
    transcriptSegments,
    exportedCount,
  });

  return (
    <div style={styles.page}>
      <ProjectWorkspaceShell
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        clips={clips}
        selectedClipIndexes={selectedClipIndexes}
        focusedClipIndex={focusedClipIndex}
        transcriptSegments={transcriptSegments}
        exportedCount={exportedCount}
        videoData={videoData}
        styles={styles}
        workspaceContext={workspaceContext}
        handleAnalyze={handleAnalyze}
        analyzing={analyzing}
        handleDetectLayout={handleDetectLayout}
        detectingLayout={detectingLayout}
      >
        {children}
      </ProjectWorkspaceShell>
    </div>
  );
}
