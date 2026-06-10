export default function CropBoxEditor({
  title,
  boxType,
  box,
  styles,
  updateCropBoxField,
}) {
  if (!box) return null;

  return (
    <div style={styles.cardFlat}>
      <h3 style={{ marginTop: 0 }}>{title}</h3>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "12px",
        }}
      >
        {["x", "y", "width", "height"].map((field) => (
          <label key={field}>
            <strong>{field}</strong>

            <input
              type="number"
              value={box[field]}
              onChange={(e) =>
                updateCropBoxField(boxType, field, e.target.value)
              }
              style={{ ...styles.input, marginTop: "6px" }}
            />
          </label>
        ))}
      </div>
    </div>
  );
}