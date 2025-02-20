export interface Structure {
  fromBeat: number;
  toBeat: number;
  numerator: number;
  denominator: number;
  tempo: number;
}

export interface TimeLineData {
  beat: number;
  instrument: string;
  message: string;
  countOut: number;
}

export interface MarkerData {
  beat: number;
  label: string;
}

export interface SongData {
  track: {
    title: string;
    filename: string;
    url: string;
    tempo: number;
    timeSignature: string;
    numerator: number;
    denominator: number;
    countIn: number;
    skipBeatsBy: number;
    skipBeats: number;
  };
  structure: Structure[];
  timeline: TimeLineData[];
  markers: MarkerData[];
}

export interface BeatData {
  beat: number;
  bar: number;
  isBarStart: boolean;
  time: number;
  instrument: string;
  hasMessage: boolean;
  message: string;
  countOut: number;
  tempo: number;
}

export interface TimeSignature {
  numerator: number | 4;
  denominator: number | 4;
}

export interface TickData {
  beatIndex: number;
  type: "bar" | "beat" | "skip";
}

export interface EventData {
  beat: number;
  instrument: string;
  message: string;
  countOut: number;
  color: string;
}

export interface Instrument {
  name: string;
}

export type Mode = "edit" | "new" | "delete";

export type SetAudioSrc = (src: string) => void;
export type SetDuration = (duration: number) => void;
export type SetIsPlaying = (isPlaying: boolean) => void;
export type SetShowCountIn = (showCountIn: boolean) => void;
export type SetCurrentTime = (time: number) => void;
export type SetSongHasEnded = () => void;
