import React, { useState, useEffect } from "react";
import "./CountIn.css";

interface CountOutProps {
  countOut?: number;
  message?: string;
  bpm: number;
  onComplete?: () => void;
}

const CountOut: React.FC<CountOutProps> = ({
  countOut = 4,
  message,
  bpm,
  onComplete,
}) => {
  const [count, setCount] = useState<number>(countOut + 1);

  useEffect(() => {
    // Calculate beat duration in milliseconds based on BPM
    // const totalBeats = countOut;
    const beatDuration = (60 / bpm) * 1000;

    if (count < 1) {
      if (onComplete) onComplete();
      return;
    }

    const timer = setTimeout(() => {
      setCount((prevCount) => prevCount - 1);
    }, beatDuration);

    return () => clearTimeout(timer);
  }, [count, bpm, countOut]);

  return (
    <>
      {count <= countOut && (
        <div className="count-out">
          <div key={count}>
            <div className="message">{message}</div>
            <div className="message-count">{count}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default CountOut;
