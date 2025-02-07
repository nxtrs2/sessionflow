// TransportFunctions.ts
import * as Tone from "tone";
import {
  SetCurrentTime,
  SetIsPlaying,
  SetShowCountIn,
  TimeSignature,
} from "../types";

export const handlePauseAtBar = (
  timeSignature: TimeSignature,
  skipBeats: number,
  setIsPlaying: SetIsPlaying
) => {
  const tObject = Tone.getTransport();
  const currentTime = tObject.seconds;
  const bpm = tObject.bpm.value;

  // Parse the time signature (assumes format "X/Y")
  // const [numeratorStr] = timeSignature.split("/");
  const beatsPerBar = timeSignature.numerator; // parseInt(numeratorStr, 10);
  const secondsPerBeat = 60 / bpm;
  const barDuration = beatsPerBar * secondsPerBeat;

  // Calculate the start time of the current bar
  const currentBarStart = Math.floor(currentTime / barDuration) * barDuration;
  tObject.seconds = currentBarStart + secondsPerBeat * skipBeats;

  // Now pause playback
  tObject.pause();
  setIsPlaying(false);
};

export const togglePlayPause = async (
  isPlaying: boolean,
  countIn: number,
  timeSignature: TimeSignature,
  skipBeats: number,
  setShowCountIn: SetShowCountIn,
  setIsPlaying: SetIsPlaying
) => {
  // Ensure the audio context is started
  await Tone.start();
  const tObject = Tone.getTransport();

  if (isPlaying) {
    // Pause at the calculated bar
    handlePauseAtBar(timeSignature, skipBeats, setIsPlaying);
  } else {
    tObject.loop = false;
    if (countIn > 0) {
      // Show the CountIn overlay
      setShowCountIn(true);
    } else {
      tObject.start();
      setIsPlaying(true);
    }
  }
};

export const togglePlayPauseWithLoop = async (
  isPlaying: boolean,
  loopStart: number,
  loopEnd: number,
  timeSignature: TimeSignature,
  skipBeats: number,
  setIsPlaying: SetIsPlaying
) => {
  // Ensure the audio context is started
  await Tone.start();
  const tObject = Tone.getTransport();

  if (isPlaying) {
    // Pause at the calculated bar
    handlePauseAtBar(timeSignature, skipBeats, setIsPlaying);
  } else {
    tObject.loop = true;
    tObject.loopStart = loopStart;
    tObject.loopEnd = loopEnd;
    tObject.seconds = loopStart;
    tObject.start();
    setIsPlaying(true);
  }
};

export const handleSkipForward = (
  skipByBeats: number,
  setCurrentTime: SetCurrentTime
) => {
  const tObject = Tone.getTransport();
  const current = tObject.seconds;
  const bpm = tObject.bpm.value;
  const secondsPerBeat = 60 / bpm;
  const newTime = Math.max(0, current + skipByBeats * secondsPerBeat);
  tObject.seconds = newTime;
  setCurrentTime(newTime);
};

export const handleSkipBackward = (
  skipByBeats: number,
  setCurrentTime: SetCurrentTime
) => {
  const tObject = Tone.getTransport();
  const current = tObject.seconds;
  const bpm = tObject.bpm.value;
  const secondsPerBeat = 60 / bpm;
  const newTime = Math.max(0, current - skipByBeats * secondsPerBeat);
  tObject.seconds = newTime;
  setCurrentTime(newTime);
};

export const handleRestart = (
  setCurrentTime: SetCurrentTime,
  setIsPlaying: SetIsPlaying
) => {
  const tObject = Tone.getTransport();
  tObject.seconds = 0;
  tObject.stop();
  setCurrentTime(0);
  setIsPlaying(false);
};
