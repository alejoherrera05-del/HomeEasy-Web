import { HERO_STAGES } from "./heroScene.config.js";

export function HeroStageIndicator({ stage, onSelect }) {
  return (
    <div className="stage-track" aria-label={`Estado de luz: ${HERO_STAGES[stage].label}`}>
      {HERO_STAGES.map((item, index) => (
        <button
          key={item.id}
          type="button"
          className={index === stage ? "active" : index < stage ? "complete" : ""}
          aria-pressed={index === stage}
          onClick={() => onSelect(item.progress)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
