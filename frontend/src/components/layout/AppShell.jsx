import ProjectWorkspacePage from "../project/workspace/ProjectWorkspacePage";
import { isWorkspaceTab } from "../project/workspace/workspaceTabs";

export default function AppShell({
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
  const isHome = activeTab === "project";
  const isDebugSettings = activeTab === "settings";
  const shouldShowWorkspace = isWorkspaceTab(activeTab);

  if (isHome || isDebugSettings || !shouldShowWorkspace) {
    return <div style={styles.page}>{children}</div>;
  }

  return (
    <ProjectWorkspacePage
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
      {children}
    </ProjectWorkspacePage>
  );
}
