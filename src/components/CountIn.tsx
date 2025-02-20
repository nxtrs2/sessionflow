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

// import React, { useState, useEffect } from "react";
// import * as Tone from "tone";
// import "./CountIn.css";

// interface CountInProps {
//   countIn?: number;
//   skipBeats?: number;
//   atStart?: boolean;
//   bpm: number; // beats per minute - used to sync the count-in
//   onComplete?: () => void;
//   onBeat?: (beat: number) => void;
// }

// const CountIn: React.FC<CountInProps> = ({
//   countIn = 4,
//   skipBeats = 0,
//   atStart = false,
//   bpm,
//   onComplete,
//   onBeat,
// }) => {
//   const [count, setCount] = useState<number>(0);

//   useEffect(() => {
//     const totalBeats = countIn - (atStart ? skipBeats : 0);
//     const beatDuration = 60 / bpm; // in seconds
//     const tObject = Tone.getTransport();
//     const tDraw = Tone.getDraw();

//     // Cancel any previous schedules
//     // tObject.cancel();

//     // Schedule each beat using Tone.Transport and Tone.Draw
//     for (let i = 1; i <= totalBeats; i++) {
//       tObject.schedule((time) => {
//         tDraw.schedule(() => {
//           setCount(i);
//           if (onBeat) onBeat(i);
//         }, time);
//       }, i * beatDuration);
//     }

//     // Schedule onComplete after the count-in is finished
//     tObject.schedule((time) => {
//       tDraw.schedule(() => {
//         if (onComplete) onComplete();
//       }, time);
//     }, (totalBeats + 1) * beatDuration);

//     // Start the transport if it isn't already running
//     if (tObject.state !== "started") {
//       tObject.start();
//     }

//     return () => {
//       tObject.cancel();
//       // Optionally, stop the transport if no longer needed
//       // Tone.Transport.stop();
//     };
//   }, [bpm, countIn, skipBeats, atStart, onComplete, onBeat]);

//   return (
//     <div className="count-in">
//       {count > 0 && (
//         <div key={count} className="count-number">
//           {count}
//         </div>
//       )}
//     </div>
//   );
// };

// export default CountIn;
