export default function SidebarButton({
  tab,
  label,
  count,
  activeTab,
  setActiveTab,
  styles,
}) {
  const isActive = activeTab === tab;

  return (
    <button
      onClick={() => setActiveTab(tab)}
      style={isActive ? styles.navButtonActive : styles.navButton}
    >
      <span>{label}</span>
      {count !== undefined && <span>{count}</span>}
    </button>
  );
}