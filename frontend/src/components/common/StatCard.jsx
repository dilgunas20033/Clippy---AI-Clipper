export default function StatCard({ label, value, sub, styles }) {
  return (
    <div style={{ ...styles.cardFlat, gridColumn: "span 3" }}>
      <div style={{ color: "#94a3b8", fontSize: "13px", marginBottom: "8px" }}>
        {label}
      </div>

      <div style={{ fontSize: "28px", fontWeight: 900 }}>{value}</div>

      {sub && <div style={{ ...styles.muted, fontSize: "13px" }}>{sub}</div>}
    </div>
  );
}