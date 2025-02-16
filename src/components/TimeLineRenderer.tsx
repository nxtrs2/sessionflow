import { CSSProperties } from "react";
import { TimeLineData, MarkerData, TickData } from "../types";

// Render a tick as a div positioned from the top.
export const renderTick2 = (
  tick: TickData,
  index: number,
  timelines: TimeLineData[],
  markers: MarkerData[],
  pixelsPerBeat: number,
  beatsPerBar: number,
  skipBeats: number,
  currentBeat: number,
  selectedInstrument: string | "ALL",
  eneableEditing: boolean,
  editMarker: (tick: TickData, deleteMarker: boolean) => void,
  editEvent: (tick: TickData, deleteEvent: boolean) => void
) => {
  const isMarker = markers.some((marker) => marker.beat === tick.beatIndex);
  const filteredTimelines =
    selectedInstrument === "ALL"
      ? timelines
      : timelines.filter(
          (timeline) => timeline.instrument === selectedInstrument
        );
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

      {filteredTimelines.some(
        (timeline) => timeline.beat === tick.beatIndex
      ) && (
        <div
          className={`tick-message ${
            Math.floor(currentBeat) === tick.beatIndex &&
            (
              timelines.find(
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
            timelines.find(
              (timeline) =>
                timeline.beat === tick.beatIndex && timeline.countOut < 1
            )?.message
          }
        </div>
      )}
      {filteredTimelines.some(
        (timeline) => timeline.beat === tick.beatIndex
      ) && (
        <div className="tick-message" style={{ color: "yellow" }}>
          {
            timelines.find(
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
      {eneableEditing && (
        <div className="hoverDiv">
          <button onClick={() => editMarker(tick, false)}>+ Marker</button>
          {isMarker && (
            <button onClick={() => editMarker(tick, true)}>- Marker</button>
          )}
          <button onClick={() => editEvent(tick, false)}>+ Event</button>
        </div>
      )}
    </div>
  );
};
