import {
  BeatData,
  SongData,
  Structure,
  TimeLineData,
  TimeSignature,
} from "../types";
// import * as Tone from "tone";

export function generateBeatData(
  duration: number,
  defaultTempo: number,
  defaultTimeSignature: TimeSignature,
  skipBeats: number = 1,
  structure: Structure[],
  timeline: TimeLineData[]
): BeatData[] {
  const beats: BeatData[] = [];

  // Add any skip beats at the beginning (these remain at time 0)
  if (skipBeats > 0) {
    for (let i = 1; i <= skipBeats + 1; i++) {
      beats.push({
        beat: 0,
        bar: 0,
        isBarStart: false,
        time: 0,
        hasMessage: false,
        message: "",
        countOut: 0,
        tempo: defaultTempo,
        instrument: "",
      });
    }
  }

  // Sort the structure segments in case they aren’t already.
  const sortedStructure = structure
    .slice()
    .sort((a, b) => a.fromBeat - b.fromBeat);
  let structureIndex = 0;
  // currentSegment is null when we’re in the default section.
  let currentSegment: Structure | null = null;

  // Initialize local settings to the defaults.
  let currentTempo = defaultTempo;
  let currentBeatsPerBar = defaultTimeSignature.numerator;
  let localSegmentStartBeat = 1; // resets when entering a new section

  let currentTime = 0;
  let currentBeat = 1;

  // Iterate beat-by-beat until the accumulated time reaches the duration.
  while (currentTime < duration) {
    // If we’re in a segment and have reached its end, revert to default settings.
    if (currentSegment && currentBeat >= currentSegment.toBeat) {
      currentSegment = null;
      currentTempo = defaultTempo;
      currentBeatsPerBar = defaultTimeSignature.numerator;
      localSegmentStartBeat = currentBeat; // restart bar counting in the new section
    }

    // If a new structure segment should start at this beat, update settings.
    if (
      !currentSegment &&
      structureIndex < sortedStructure.length &&
      currentBeat === sortedStructure[structureIndex].fromBeat
    ) {
      currentSegment = sortedStructure[structureIndex];
      currentTempo = currentSegment.tempo;
      currentBeatsPerBar = currentSegment.numerator;
      // (You could also recreate a TimeSignature object if needed)
      localSegmentStartBeat = currentBeat;
      structureIndex++;
    }

    // Calculate the duration of this beat in seconds based on the effective tempo.
    const beatDurationSeconds = 60 / currentTempo;

    // Determine if this beat starts a new bar.
    const isBarStart =
      (currentBeat - localSegmentStartBeat) % currentBeatsPerBar === 0;
    const bar =
      Math.floor((currentBeat - localSegmentStartBeat) / currentBeatsPerBar) +
      1;

    // Look for any timeline data attached to this beat.
    const timelineEntry = timeline.find((data) => data.beat === currentBeat);

    beats.push({
      beat: currentBeat,
      bar,
      isBarStart,
      time: currentTime,
      hasMessage: timelineEntry ? timelineEntry.message.length > 0 : false,
      message: timelineEntry ? timelineEntry.message : "",
      countOut: timelineEntry ? timelineEntry.countOut : 0,
      instrument: timelineEntry ? timelineEntry.instrument : "",
      tempo: currentTempo,
    });

    // Increment the accumulated time and beat count.
    currentTime += beatDurationSeconds;
    currentBeat++;
  }

  return beats;
}

// export function generateBeatData2(
//   duration: number,
//   tempo: number,
//   timeSignature: TimeSignature,
//   skipBeats: number = 1,
//   structure: Structure[],
//   TimeLineData: TimeLineData[]
// ): BeatData[] {
//   const beatDuration = Tone.Time("4n").toSeconds();
//   const totalBeats = Math.floor(duration / beatDuration);

//   const beatsPerBar = timeSignature.numerator; // parseInt(timeSignature?.split("/")[0], 10) || 4;

//   const beats: BeatData[] = [];

//   if (skipBeats > 0) {
//     for (let i = 1; i <= skipBeats + 1; i++) {
//       beats.push({
//         beat: 0,
//         bar: 0,
//         isBarStart: false,
//         time: 0,
//         hasMessage: false,
//         message: "",
//         countOut: 0,
//         tempo: tempo,
//         instrument: "",
//       });
//     }
//   }

//   // 1-based beat numbering: beat 1 occurs at time = offsetTime, beat 2 = offsetTime + beatDuration, etc.
//   for (let i = 1; i <= totalBeats; i++) {
//     // Calculate time using Tone’s conversion (if needed, although multiplication should be fine)
//     const time = (i - 1) * beatDuration;

//     const bar = Math.floor((i - 1) / beatsPerBar) + 1;
//     const isBarStart = (i - 1) % beatsPerBar === 0;

//     beats.push({
//       beat: i,
//       bar,
//       isBarStart,
//       time,
//       hasMessage: TimeLineData.some(
//         (data) => data.beat === i && data.message.length > 0
//       ),
//       message: TimeLineData.find((data) => data.beat === i)?.message || "",
//       countOut: TimeLineData.find((data) => data.beat === i)?.countOut || 0,
//       instrument:
//         TimeLineData.find((data) => data.beat === i)?.instrument || "",
//       tempo,
//     });
//   }

//   return beats;
// }

export function approximatelyEqual(a: number, b: number, tolerance = 0.05) {
  return Math.abs(a - b) < tolerance;
}

/* Maybe this function needs to be helpers/FileFunctions */
export async function loadSongFile(
  file: string,
  setSongData: (data: SongData) => void,
  setFileLoaded: (loaded: boolean) => void
): Promise<boolean> {
  try {
    const res = await fetch(file);
    const data = await res.json();
    setSongData(data);
    setFileLoaded(true);
    return true;
  } catch (err) {
    console.error("Error loading song data", err);
    return false;
  }
}
