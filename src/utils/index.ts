import { BeatData, TimeLineData } from "../types";
import * as Tone from "tone";

export function generateBeatData(
  duration: number,
  tempo: number,
  timeSignature: string,
  skipBeats: number = 1,
  TimeLineData: TimeLineData[]
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
        time: 0,
        hasMessage: false,
        message: "",
        countOut: 0,
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
      hasMessage: TimeLineData.some(
        (data) => data.beat === i && data.message.length > 0
      ),
      message: TimeLineData.find((data) => data.beat === i)?.message || "",
      countOut: TimeLineData.find((data) => data.beat === i)?.countOut || 0,
    });
  }

  console.log(beats);
  return beats;
}

export function approximatelyEqual(a: number, b: number, tolerance = 0.05) {
  return Math.abs(a - b) < tolerance;
}
