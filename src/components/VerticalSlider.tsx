import "./VerticalSlider.css";
interface VerticalSliderProps {
  min?: number;
  max?: number;
  initialValue?: number;
  value?: number;
  onChange?: (value: number) => void;
}
const VerticalSlider = ({ min, max, value, onChange }: VerticalSliderProps) => {
  return (
    <div className="vertical-slider">
      <input
        type="range"
        defaultValue={value}
        min={min}
        max={max}
        onChange={(e) => onChange?.(parseInt(e.target.value, 10))}
        className="slider"
      />
    </div>
  );
};

export default VerticalSlider;
