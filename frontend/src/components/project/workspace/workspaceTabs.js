export const WORKSPACE_TABS = [
  {
    id: "analyze",
    view: "overview",
    label: "Overview",
    shortLabel: "Overview",
    description: "Project status, analysis plan, and layout detection.",
  },
  {
    id: "clips",
    view: "clips",
    label: "Clips",
    shortLabel: "Clips",
    description: "Review detected moments and choose what to keep.",
  },
  {
    id: "clip-workflow",
    view: "workflow",
    label: "Clip Workflow",
    shortLabel: "Workflow",
    description: "Work through one selected clip at a time.",
  },
  {
    id: "subtitles",
    view: "subtitles",
    label: "Subtitles",
    shortLabel: "Subtitles",
    description: "Review and edit generated transcript subtitles.",
  },
  {
    id: "editor",
    view: "editor",
    label: "Editor",
    shortLabel: "Editor",
    description: "Adjust crop and vertical layout settings.",
  },
  {
    id: "exports",
    view: "exports",
    label: "Exports",
    shortLabel: "Exports",
    description: "Preview exported files and final outputs.",
  },
  {
    id: "project-settings",
    view: "settings",
    label: "Project Settings",
    shortLabel: "Settings",
    description: "Update this project’s clip strategy.",
  },
];

export const WORKSPACE_TAB_IDS = WORKSPACE_TABS.map((tab) => tab.id);
export const WORKSPACE_VIEW_NAMES = WORKSPACE_TABS.map((tab) => tab.view);

export const isWorkspaceTab = (tabId) => WORKSPACE_TAB_IDS.includes(tabId);

export const getWorkspaceTabById = (tabId) => {
  return WORKSPACE_TABS.find((tab) => tab.id === tabId) || WORKSPACE_TABS[0];
};

export const getWorkspaceViewName = (tabId) => {
  return getWorkspaceTabById(tabId).view;
};

export const getWorkspaceTitle = (tabId) => {
  return getWorkspaceTabById(tabId).label;
};

export const getWorkspaceDescription = (tabId) => {
  return getWorkspaceTabById(tabId).description;
};
