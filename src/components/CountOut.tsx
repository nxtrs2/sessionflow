// import React, { useState, useEffect } from "react";
// import * as Tone from "tone";
// import "./CountIn.css";

// interface CountOutProps {
//   countOut?: number;
//   message?: string;
//   bpm: number;
//   onComplete?: () => void;
// }

// const CountOut: React.FC<CountOutProps> = ({
//   countOut = 4,
//   message,
//   bpm,
//   onComplete,
// }) => {
//   // Initialize count to countOut + 1 (if you want to include the starting value)
//   const [count, setCount] = useState<number>(countOut + 1);

//   useEffect(() => {
//     // Set the BPM on Tone.Transport so that our scheduled events match the tempo.
//     const tObject = Tone.getTransport();
//     tObject.bpm.value = bpm;

//     // We'll use a local variable to track the countdown.
//     let scheduledCount = countOut + 1;

//     // Schedule a repeating event using Tone.Transport.scheduleRepeat.
//     // "4n" refers to a quarter note interval; adjust if needed.
//     const scheduleId = tObject.scheduleRepeat((time) => {
//       scheduledCount--;
//       setCount(scheduledCount);

//       // Once the countdown reaches below 1, call onComplete and clear the scheduled event.
//       if (scheduledCount < 1) {
//         if (onComplete) onComplete();
//         tObject.clear(scheduleId);
//       }
//     }, "4n");

//     // Start the Tone.Transport if it isn’t already running.
//     if (tObject.state !== "started") {
//       tObject.start();
//     }

//     // Cleanup: clear the scheduled event on component unmount.
//     return () => {
//       tObject.clear(scheduleId);
//     };
//   }, [bpm, countOut, onComplete]);

//   return (
//     <div className="count-out">
//       <div key={count}>
//         <div className="message">{message}</div>
//         <div className="message-count">{count}</div>
//       </div>
//     </div>
//   );
// };

// export default CountOut;

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

    // if (count > 0 && onBeat) {
    //   onBeat(count);
    // }

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
