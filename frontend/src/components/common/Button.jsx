export default function Button({
  children,
  onClick,
  disabled,
  variant = "normal",
  styles,
}) {
  let style = styles.button;

  if (variant === "primary") style = styles.primaryButton;
  if (variant === "danger") style = styles.dangerButton;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...style,
        ...(disabled ? styles.disabled : {}),
      }}
    >
      {children}
    </button>
  );
}