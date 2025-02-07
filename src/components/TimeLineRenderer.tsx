import { CSSProperties } from "react";
import { TimeLineData, MarkerData, TickData } from "../types";

// Rend
// er a tick as a div positioned from the top.
export const renderTick2 = (
  tick: TickData,
  index: number,
  songTimeLines: TimeLineData[],
  markers: MarkerData[],
  pixelsPerBeat: number,
  beatsPerBar: number,
  skipBeats: number,
  currentBeat: number
) => {
  const topPos = tick.beatIndex * pixelsPerBeat;
  const tickStyle: CSSProperties = {
    position: "absolute",
    top: `${topPos}px`,
    left: "0",
    color: "black",
    backgroundColor: tick.type === "bar" ? "#ffc53f" : "white",
  };

  if (tick.type === "bar") {
    tickStyle.width = "100px";
    tickStyle.height = "1px";
  } else {
    tickStyle.width = "50px";
    tickStyle.height = "1px";
  }

  return (
    <div key={index} style={tickStyle}>
      {tick.type === "skip" && (
        <div className="tick-label">
          Skip {skipBeats} {skipBeats > 1 ? "beats" : "beat"}
        </div>
      )}
      {tick.type === "bar" && (
        <div className="tick-label">
          Bar {Math.floor(tick.beatIndex / beatsPerBar) + 1}
        </div>
      )}

      {songTimeLines.some((timeline) => timeline.beat === tick.beatIndex) && (
        <div
          className={`tick-message ${
            Math.floor(currentBeat) === tick.beatIndex &&
            (
              songTimeLines.find(
                (timeline) =>
                  timeline.beat === tick.beatIndex && timeline.countOut < 1
              )?.message || ""
            ).slice(-1) === "!"
              ? "pop"
              : ""
          }`}
          style={
            Math.floor(currentBeat) < tick.beatIndex
              ? { color: "white" }
              : { color: "gray" }
          }
        >
          {
            songTimeLines.find(
              (timeline) =>
                timeline.beat === tick.beatIndex && timeline.countOut < 1
            )?.message
          }
        </div>
      )}
      {songTimeLines.some((timeline) => timeline.beat === tick.beatIndex) && (
        <div className="tick-message" style={{ color: "yellow" }}>
          {
            songTimeLines.find(
              (timeline) =>
                timeline.beat === tick.beatIndex && timeline.countOut > 0
            )?.message
          }
        </div>
      )}
      {markers.some((marker) => marker.beat === tick.beatIndex) && (
        <div className="marker-label">
          {markers.find((marker) => marker.beat === tick.beatIndex)?.label}
        </div>
      )}
      <span style={{ marginLeft: "5px", color: "white" }}>
        {tick.beatIndex > -1 ? tick.beatIndex : ""}
      </span>
    </div>
  );
};
