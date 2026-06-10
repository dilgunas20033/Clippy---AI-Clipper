export default function WorkspaceContentRouter({
  activeTab,
  renderAnalyzeTab,
  renderClipsTab,
  renderClipWorkflowTab,
  renderSubtitlesTab,
  renderEditorTab,
  renderExportsTab,
  renderProjectSettingsTab,
  renderProjectTab,
}) {
  if (activeTab === "analyze") return renderAnalyzeTab();
  if (activeTab === "clips") return renderClipsTab();
  if (activeTab === "clip-workflow") return renderClipWorkflowTab();
  if (activeTab === "subtitles") return renderSubtitlesTab();
  if (activeTab === "editor") return renderEditorTab();
  if (activeTab === "exports") return renderExportsTab();
  if (activeTab === "project-settings") return renderProjectSettingsTab();

  return renderProjectTab();
}
