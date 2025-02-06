export interface TimeLineData {
  beat: number;
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
    countIn: number;
    skipBeatsBy: number;
    skipBeats: number;
  };
  timeline: TimeLineData[];
  markers: MarkerData[];
}
export interface BeatData {
  beat: number;
  bar: number;
  isBarStart: boolean;
  time: number;
  hasMessage: boolean;
  message: string;
  countOut: number;
}

export type SetAudioSrc = (src: string) => void;
export type SetDuration = (duration: number) => void;
export type SetIsPlaying = (isPlaying: boolean) => void;
export type SetShowCountIn = (showCountIn: boolean) => void;
export type SetCurrentTime = (time: number) => void;
export type SetSongHasEnded = () => void;
