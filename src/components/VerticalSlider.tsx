import React, { useState } from "react";
import "./VerticalSlider.css";

const VerticalSlider = ({ min = 0, max = 100, initialValue = 50 }) => {
  const [value, setValue] = useState(initialValue);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  return (
    <div className="vertical-slider">
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        className="slider"
      />
      <div className="slider-value">{value}</div>
    </div>
  );
};

export default VerticalSlider;
