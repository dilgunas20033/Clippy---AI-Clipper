export function StepPill({ number, label, active, complete, styles }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", color: active || complete ? "#fff" : "#64748b", fontSize: "13px", fontWeight: 800 }}>
      <span style={{ width: "26px", height: "26px", borderRadius: "999px", display: "inline-flex", alignItems: "center", justifyContent: "center", background: complete ? "rgba(34,197,94,0.25)" : active ? "rgba(99,102,241,0.35)" : "rgba(255,255,255,0.06)", border: active ? "1px solid rgba(129,140,248,0.7)" : "1px solid rgba(255,255,255,0.08)" }}>
        {complete ? "✓" : number}
      </span>
      {label}
    </div>
  );
}

export function OptionCard({ selected, label, description, onClick, styles }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ ...styles.cardFlat, width: "100%", textAlign: "left", cursor: "pointer", border: selected ? "1px solid rgba(129,140,248,0.75)" : styles.cardFlat.border, background: selected ? "linear-gradient(135deg, rgba(99,102,241,0.24), rgba(236,72,153,0.12))" : styles.cardFlat.background }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", alignItems: "center" }}>
        <strong>{label}</strong>
        {selected && <span style={styles.goodBadge}>Selected</span>}
      </div>
      <p style={{ ...styles.muted, marginBottom: 0, fontSize: "13px" }}>{description}</p>
    </button>
  );
}

export function formatDuration(seconds) {
  if (!seconds) return "Unknown duration";
  const total = Math.round(Number(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours > 0) return `${hours}h ${minutes}m`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

export function niceValue(value) {
  if (!value) return "Default";
  return String(value).replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
