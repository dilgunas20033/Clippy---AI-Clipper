export default function Badge({ children, type = "normal", styles }) {
  let style = styles.badge;

  if (type === "good") style = styles.goodBadge;
  if (type === "warn") style = styles.warnBadge;

  return <span style={style}>{children}</span>;
}