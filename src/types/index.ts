import * as Tone from "tone";

const appURL = process.env.REACT_SUPABASE_URL;
const projectsURL = `${appURL}/storage/v1/object/project_files`;

export { appURL, projectsURL };

export interface CustomPlayer extends Tone.Player {
  solo?: boolean;
}

export interface Structure {
  fromBeat: number;
  toBeat: number;
  numerator: number;
  denominator: number;
  tempo: number;
}

// export interface TimeLineData {
//   beat: number;
//   instrument: string;
//   instrumentId: number | null;
//   message: string;
//   countOut: number;
// }

export interface EventData {
  beat: number;
  instrumentId: number | null;
  message: string;
  countOut: number;
}

export interface MarkerData {
  beat: number;
  label: string;
}

export interface SongData {
  project: {
    title: string;
    filename: string;
    url: string;
    tempo: number;
    numerator: number;
    denominator: number;
    countIn: number;
    skipBeatsBy: number;
    skipBeats: number;
    masterVolume: number;
    masterPan: number;
    masterMute: boolean;
    masterSolo: boolean;
  };
  notes: string;
  structure: Structure[];
  instruments: Instrument[];
  timeline: EventData[];
  markers: MarkerData[];
}

export interface BeatData {
  beat: number;
  bar: number;
  isBarStart: boolean;
  time: number;
  instrumentId: number | null;
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

export interface Instrument {
  id: number;
  name: string;
  filename?: string;
  url?: string;
  color: string;
  bgcolor: string;
  volume: number;
  pan: number;
  mute: boolean;
  solo: boolean;
}

export type Mode = "edit" | "new" | "delete";

export type SetAudioSrc = (src: string) => void;
export type SetDuration = (duration: number) => void;
export type SetIsPlaying = (isPlaying: boolean) => void;
export type SetShowCountIn = (showCountIn: boolean) => void;
export type SetCurrentTime = (time: number) => void;
export type SetSongHasEnded = () => void;
