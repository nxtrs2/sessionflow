import { CSSProperties } from "react";
import { EventData, MarkerData, TickData, Instrument } from "../types";

// Render a tick as a div positioned from the top.
export const renderTick2 = (
  tick: TickData,
  index: number,
  timelines: EventData[],
  markers: MarkerData[],
  pixelsPerBeat: number,
  beatsPerBar: number,
  skipBeats: number,
  currentBeat: number,
  instruments: Instrument[],
  selectedInstrument: Instrument | null,
  eneableEditing: boolean,
  editMarker: (tick: TickData, deleteMarker: boolean) => void,
  editEvent: (tick: TickData, deleteEvent: boolean) => void
) => {
  const isMarker = markers.some((marker) => marker.beat === tick.beatIndex);
  const isEvent = selectedInstrument
    ? timelines.some(
        (timeline) =>
          timeline.beat === tick.beatIndex &&
          timeline.instrumentId === selectedInstrument.id
      )
    : timelines.some((timeline) => timeline.beat === tick.beatIndex);
  // const isTimelineEvent = timelines.some(
  //   (timeline) => timeline.beat === tick.beatIndex
  // );
  const filteredTimelines =
    selectedInstrument === null
      ? timelines
      : timelines.filter(
          (event) => event.instrumentId === selectedInstrument.id
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

  // const color =
  //   instruments.find(
  //     (instrument) =>
  //       instrument.name ===
  //       timelines.find((timeline) => timeline.beat === tick.beatIndex)
  //         ?.instrument
  //   )?.color || "white";
  // const bgcolor =
  //   instruments.find(
  //     (instrument) =>
  //       instrument.name ===
  //       timelines.find((timeline) => timeline.beat === tick.beatIndex)
  //         ?.instrument
  //   )?.bgcolor || "black";

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

      {/* {filteredTimelines.some(
        (timeline) => timeline.beat === tick.beatIndex
      ) && (
        <div>
          {timelines
            .filter(
              (timeline) =>
                timeline.beat === tick.beatIndex && timeline.countOut < 1
            )
            .map((event, index) => (
              <div
                key={index}
                className={`tick-message ${
                  Math.floor(currentBeat) === tick.beatIndex &&
                  event.message.slice(-1) === "!"
                    ? "pop"
                    : ""
                }`}
                style={
                  Math.floor(currentBeat) < tick.beatIndex
                    ? {
                        color: color || "white",
                        backgroundColor: bgcolor || "black",
                      }
                    : { color: "gray" }
                }
              >
                {event.message}
              </div>
            ))}
        </div>
      )} */}

      {/* {filteredTimelines.some(
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
              ? {
                  color: color || "white",
                  backgroundColor: bgcolor || "black",
                }
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
      )} */}
      <div className="tick-message-div">
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
      </div>
      {markers.some((marker) => marker.beat === tick.beatIndex) && (
        <div className="marker-label">
          {markers.find((marker) => marker.beat === tick.beatIndex)?.label}
        </div>
      )}
      <span style={{ marginLeft: "5px", color: "white" }}>
        {tick.beatIndex > -1 ? tick.beatIndex : ""}
      </span>
      {filteredTimelines.some(
        (timeline) => timeline.beat === tick.beatIndex
      ) && (
        <div className="tick-message-div">
          {filteredTimelines
            .filter(
              (timeline) =>
                timeline.beat === tick.beatIndex && timeline.countOut < 1
            )
            .map((event, index) => {
              const instrumentData = instruments.find(
                (inst) => inst.id === event.instrumentId
              );
              const color = instrumentData?.color || "white";
              const bgcolor = instrumentData?.bgcolor || "black";

              return (
                <div
                  key={index}
                  className={`tick-message ${
                    Math.floor(currentBeat) === tick.beatIndex &&
                    event.message.slice(-1) === "!"
                      ? "pop"
                      : ""
                  }`}
                  style={
                    Math.floor(currentBeat) < tick.beatIndex
                      ? { color, backgroundColor: bgcolor }
                      : { color: "gray" }
                  }
                >
                  {event.message}
                </div>
              );
            })}
        </div>
      )}
      {eneableEditing && (
        <div className="hoverDiv">
          {!isMarker && (
            <button onClick={() => editMarker(tick, false)}>+ Marker</button>
          )}
          {isMarker && (
            <button onClick={() => editMarker(tick, true)}>- Marker</button>
          )}
          {!isEvent && selectedInstrument && (
            <button onClick={() => editEvent(tick, false)}>+ Event</button>
          )}
          {isEvent && selectedInstrument && (
            <button onClick={() => editEvent(tick, false)}>^ Event</button>
          )}
          {selectedInstrument && isEvent && (
            <button onClick={() => editEvent(tick, true)}>- Event</button>
          )}
        </div>
      )}
    </div>
  );
};
