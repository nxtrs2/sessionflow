import React, { useState, useEffect } from "react";
import "./CountIn.css";

interface CountOutProps {
  countIn?: number;
  message?: string;
  bpm: number;
  onComplete?: () => void;
}

const CountOut: React.FC<CountOutProps> = ({
  countIn = 4,
  message,
  bpm,
  onComplete,
}) => {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // Calculate beat duration in milliseconds based on BPM
    const totalBeats = countIn;
    const beatDuration = (60 / bpm) * 1000;

    if (count > totalBeats) {
      if (onComplete) onComplete();
      return;
    }

    // if (count > 0 && onBeat) {
    //   onBeat(count);
    // }

    const timer = setTimeout(() => {
      setCount((prevCount) => prevCount + 1);
    }, beatDuration);

    return () => clearTimeout(timer);
  }, [count, bpm, countIn]);

  return (
    <div className="count-out">
      {count > 0 && (
        <div key={count}>
          <div className="message">{message}</div>
          <div className="message-count">{count}</div>
        </div>
      )}
    </div>
  );
};

export default CountOut;
