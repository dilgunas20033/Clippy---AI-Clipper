export default function PageHeader({ title, subtitle, styles }) {
  return (
    <div style={styles.topbar}>
      <div>
        <h1 style={styles.title}>{title}</h1>
        <p style={styles.subtitle}>{subtitle}</p>
      </div>
    </div>
  );
}
