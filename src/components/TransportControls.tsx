import React from "react";
import { Rewind, FastForward, Play, Pause, SkipBack } from "lucide-react";
import {
  togglePlayPauseWithLoop,
  togglePlayPause,
  handleRestart,
  handleSkipBackward,
  handleSkipForward,
} from "../helpers/TransportFunctions";
interface TransportControlsProps {
  size: number;
  isPlaying: boolean;
  loop: boolean;
  loopStart: number;
  loopEnd: number;
  beatData: { time: number }[];
  timeSignature: { numerator: number; denominator: number };
  skipBeats: number;
  countIn: number;
  skipBeatsBy: number;
  setCurrentTime: React.Dispatch<React.SetStateAction<number>>;
  setIsPlaying: React.Dispatch<React.SetStateAction<boolean>>;
  setShowCountIn: React.Dispatch<React.SetStateAction<boolean>>;
}

const TransportControls: React.FC<TransportControlsProps> = ({
  size,
  isPlaying,
  loop,
  loopStart,
  loopEnd,
  beatData,
  timeSignature,
  skipBeats,
  countIn,
  skipBeatsBy,
  setCurrentTime,
  setIsPlaying,
  setShowCountIn,
}) => {
  return (
    <div className="transport-controls">
      <button onClick={() => handleRestart(setCurrentTime, setIsPlaying)}>
        <SkipBack size={size} />
      </button>
      <button
        onClick={() => {
          setIsPlaying(!isPlaying);

          if (loop) {
            togglePlayPauseWithLoop(
              isPlaying,
              beatData[loopStart].time,
              beatData[loopEnd].time,
              timeSignature,
              skipBeats,
              setIsPlaying
            );
          } else {
            togglePlayPause(
              isPlaying,
              countIn,
              timeSignature,
              skipBeats,
              setShowCountIn,
              setIsPlaying
            );
          }
        }}
      >
        {isPlaying ? <Pause size={size} /> : <Play size={size} />}
      </button>
      <button onClick={() => handleSkipBackward(skipBeatsBy, setCurrentTime)}>
        <Rewind size={size} />
      </button>
      <button onClick={() => handleSkipForward(skipBeatsBy, setCurrentTime)}>
        <FastForward size={size} />
      </button>
    </div>
  );
};

export default TransportControls;
