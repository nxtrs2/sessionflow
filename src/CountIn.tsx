import React, { useState, useEffect } from "react";
import "./CountIn.css";

interface CountInProps {
  countIn?: number;
  skipBeats?: number;
  atStart?: boolean;
  bpm: number; // beats per minute - used to sync the count-in
  onComplete?: () => void;
  onBeat?: (beat: number) => void;
}

const CountIn: React.FC<CountInProps> = ({
  countIn = 4,
  skipBeats = 0,
  atStart = false,
  bpm,
  onComplete,
  onBeat,
}) => {
  // const [count, setCount] = useState<number>(
  //   atStart ? countIn - skipBeats : countIn
  // );
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    // Calculate beat duration in milliseconds based on BPM
    const totalBeats = countIn - (atStart ? skipBeats : 0);
    const beatDuration = (60 / bpm) * 1000;

    if (count > totalBeats) {
      if (onComplete) onComplete();
      return;
    }

    if (count > 0 && onBeat) {
      onBeat(count);
    }

    // if (count > countIn - (atStart ? skipBeats : 0)) {
    //   if (onComplete) onComplete();
    //   return;
    // }

    const timer = setTimeout(() => {
      setCount((prevCount) => prevCount + 1);
    }, beatDuration);

    return () => clearTimeout(timer);
  }, [count, bpm, onComplete, onBeat, countIn, skipBeats, atStart]);

  return (
    <div className="count-in">
      {count > 0 && (
        <div key={count} className="count-number">
          {count}
        </div>
      )}
    </div>
  );
};

export default CountIn;
