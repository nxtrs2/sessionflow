import { BeatData } from "../types";
import * as Tone from "tone";

export function generateBeatData(
  duration: number,
  tempo: number,
  timeSignature: string,
  skipBeats: number = 1 // optional offset beats
): BeatData[] {
  const beatDuration = Tone.Time("4n").toSeconds();

  // Optional: Account for skipBeats offset. (E.g., count-in beats)
  // const offsetTime = skipBeats * beatDuration;

  // Calculate total beats (considering only full beats)
  const totalBeats = Math.floor(duration / beatDuration);

  // Extract beats per bar from the time signature (e.g., "4/4")
  const beatsPerBar = parseInt(timeSignature.split("/")[0], 10) || 4;

  const beats: BeatData[] = [];

  if (skipBeats > 0) {
    for (let i = 1; i <= skipBeats + 1; i++) {
      beats.push({
        beat: 0,
        bar: 0,
        isBarStart: false,
        time: 0, //(i - 1) * beatDuration,
      });
    }
  }

  // 1-based beat numbering: beat 1 occurs at time = offsetTime, beat 2 = offsetTime + beatDuration, etc.
  for (let i = 1; i <= totalBeats; i++) {
    // Calculate time using Tone’s conversion (if needed, although multiplication should be fine)
    const time = (i - 1) * beatDuration;

    const bar = Math.floor((i - 1) / beatsPerBar) + 1;
    const isBarStart = (i - 1) % beatsPerBar === 0;

    beats.push({
      beat: i,
      bar,
      isBarStart,
      time,
    });
  }

  return beats;
}

export function approximatelyEqual(a: number, b: number, tolerance = 0.05) {
  return Math.abs(a - b) < tolerance;
}

// export function generateBeatData(
//   duration: number,
//   tempo: number,
//   timeSignature: string
// ): BeatData[] {
//   const beatDuration = 60 / tempo;
//   const totalBeats = Math.floor(duration / beatDuration);
//   // Assume timeSignature is something like "4/4"
//   const beatsPerBar = parseInt(timeSignature.split("/")[0], 10) || 4;

//   const beats: BeatData[] = [];

//   // Use 1-based beat numbering (beat 1 occurs at time 0)
//   for (let i = 1; i <= totalBeats; i++) {
//     // The time for beat 1 is 0, beat 2 is beatDuration, etc.
//     const time = (i - 1) * beatDuration;
//     // Bar calculation: for example, beats 1-4 belong to bar 1, 5-8 to bar 2, etc.
//     const bar = Math.floor((i - 1) / beatsPerBar) + 1;
//     const isBarStart = (i - 1) % beatsPerBar === 0;

//     beats.push({
//       beat: i,
//       bar,
//       isBarStart,
//       time,
//     });
//   }

//   return beats;
// }
