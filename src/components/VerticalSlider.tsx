import "./VerticalSlider.css";
interface VerticalSliderProps {
  min?: number;
  max?: number;
  initialValue?: number;
  value?: number;
  onChange?: (value: number) => void;
  muted?: boolean;
}
const VerticalSlider = ({
  min,
  max,
  value,
  onChange,
  muted,
}: VerticalSliderProps) => {
  return (
    <div className="vertical-slider">
      <input
        type="range"
        defaultValue={value?.toString()}
        min={min}
        max={max}
        onChange={(e) => onChange?.(parseInt(e.target.value, 10))}
        className={muted ? "slider gray-background" : "slider"}
      />
    </div>
  );
};

export default VerticalSlider;
