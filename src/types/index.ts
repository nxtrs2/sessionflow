export interface TimeLineData {
  beat: number;
  message: string;
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
    countIn: number;
    skipBeats: number;
  };
  timeline: TimeLineData[];
  markers: MarkerData[];
}
export interface BeatData {
  beat: number; // 1-based beat number (e.g. 1, 2, 3, ...)
  bar: number; // Bar number (starting at 1)
  isBarStart: boolean; // True if this beat is the first beat in a bar
  time: number; // Time in seconds (from song start) when this beat occurs
}

export type SetAudioSrc = (src: string) => void;
export type SetDuration = (duration: number) => void;
export type SetIsPlaying = (isPlaying: boolean) => void;
export type SetShowCountIn = (showCountIn: boolean) => void;
export type SetCurrentTime = (time: number) => void;
export type SetSongHasEnded = () => void;
