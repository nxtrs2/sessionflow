import "./VerticalSlider.css";
interface VerticalSliderProps {
  min?: number;
  max?: number;
  initialValue?: number;
  value?: number;
  onChange?: (value: number) => void;
}
const VerticalSlider = ({
  min = 0,
  max = 100,
  value,
  onChange,
}: VerticalSliderProps) => {
  return (
    <div className="vertical-slider">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={() => onChange}
        className="slider"
      />
    </div>
  );
};

export default VerticalSlider;
