import Button from "../../common/Button";
import { OptionCard } from "./WizardParts";
import { CLIP_GOALS, EXPORT_FORMATS, STREAM_TYPES, SUBTITLE_STYLES } from "./newProjectOptions";

export default function SetupOptionsStep({ projectOptions, updateOption, setStep, styles }) {
  return (
    <div style={{ display: "grid", gap: "18px" }}>
      <div>
        <h3 style={{ marginTop: 0 }}>What type of stream is this?</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px" }}>
          {STREAM_TYPES.map((option) => (
            <OptionCard
              key={option.id}
              selected={projectOptions.streamType === option.id}
              label={option.label}
              description={option.description}
              onClick={() => {
                updateOption("streamType", option.id);
                if (option.id === "horror_reaction") {
                  updateOption("analysisMode", "deep");
                  updateOption("subtitleStyle", "horror_red");
                }
                if (option.id === "gaming") updateOption("analysisMode", "fast");
              }}
              styles={styles}
            />
          ))}
        </div>
      </div>

      <div>
        <h3>Subtitle style</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px" }}>
          {SUBTITLE_STYLES.map((option) => (
            <OptionCard key={option.id} selected={projectOptions.subtitleStyle === option.id} label={option.label} description={option.description} onClick={() => updateOption("subtitleStyle", option.id)} styles={styles} />
          ))}
        </div>
      </div>

      <div>
        <h3>Clip goal</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px" }}>
          {CLIP_GOALS.map((option) => (
            <OptionCard key={option.id} selected={projectOptions.clipGoal === option.id} label={option.label} description={option.description} onClick={() => updateOption("clipGoal", option.id)} styles={styles} />
          ))}
        </div>
      </div>

      <div>
        <h3>Export format</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: "12px" }}>
          {EXPORT_FORMATS.map((option) => (
            <OptionCard key={option.id} selected={projectOptions.exportFormat === option.id} label={option.label} description={option.description} onClick={() => updateOption("exportFormat", option.id)} styles={styles} />
          ))}
        </div>
      </div>

      <div style={styles.cardFlat}>
        <h3 style={{ marginTop: 0 }}>Analysis mode</h3>
        <div style={styles.buttonRow}>
          <Button onClick={() => updateOption("analysisMode", "fast")} variant={projectOptions.analysisMode === "fast" ? "primary" : "normal"} styles={styles}>Fast</Button>
          <Button onClick={() => updateOption("analysisMode", "deep")} variant={projectOptions.analysisMode === "deep" ? "primary" : "normal"} styles={styles}>Deep</Button>
        </div>
        <p style={{ ...styles.muted, marginBottom: 0 }}>Fast is best for long streams. Deep is better for horror/reaction but takes longer.</p>
      </div>

      <div style={{ ...styles.buttonRow, justifyContent: "space-between" }}>
        <Button onClick={() => setStep(2)} styles={styles}>Back</Button>
        <Button onClick={() => setStep(4)} variant="primary" styles={styles}>Continue</Button>
      </div>
    </div>
  );
}
