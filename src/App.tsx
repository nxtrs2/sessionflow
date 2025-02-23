import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import * as Tone from "tone";
import "./App.css";
import CountIn from "./components/CountIn";
import CountOut from "./components/CountOut";
import { renderTick2 } from "./components/TimeLineRenderer";
import {
  SongData,
  EventData,
  MarkerData,
  BeatData,
  TickData,
  TimeSignature,
  Structure,
  Instrument,
} from "./types";
import {
  Rewind,
  FastForward,
  Play,
  Pause,
  SkipBack,
  Repeat2,
} from "lucide-react";
import { loadSongFromJson, handleFileChange } from "./helpers/FileFunctions";
import { generateBeatData, approximatelyEqual, loadSongFile } from "./utils";
import {
  togglePlayPause,
  togglePlayPauseWithLoop,
  handleSkipBackward,
  handleSkipForward,
  handleRestart,
} from "./helpers/TransportFunctions";
import Loader from "./components/Loader";
import EventDialog from "./components/EventDialog";
import Settings from "./components/Settings";

const App: React.FC = () => {
  // Tone.Player reference
  const [activeTab, setActiveTab] = useState<string>("track");
  const playerRef = useRef<Tone.Player | undefined>(undefined);
  const clickSynthRef = useRef<Tone.Synth | null>(null);

  const [beatData, setBeatData] = useState<BeatData[]>([]);

  // Audio file source and duration
  // const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(0);

  // const [currentBar, setCurrentBar] = useState<number>(0);

  const [countIn, setCountIn] = useState<number>(4);
  const [showCountIn, setShowCountIn] = useState<boolean>(false);

  // Playback state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [showEditEventDialog, setShowEditEventDialog] =
    useState<boolean>(false);
  const [canEdit, setCanEdit] = useState<boolean>(false);
  // const [songEnded, setSongEnded] = useState<boolean>(false);

  const [loop, setLoop] = useState<boolean>(false);
  const [loopStart, setLoopStart] = useState<number>(0);
  const [loopEnd, setLoopEnd] = useState<number>(0);

  const [goToBeat, setGoToBeat] = useState<number>(0);
  const [skipBeatsBy, setSkipBeatsBy] = useState<number>(1);
  const [skipBeats, setSkipBeats] = useState<number>(0);
  // const [skipStartBeat, setSkipStartBeat] = useState<number>(0);
  const [pulse, setPulse] = useState<boolean>(false);

  // Global tempo and time signature state
  const [tempo, setTempo] = useState<number>(130); // BPM
  const [timeSignature, setTimeSignature] = useState<TimeSignature>({
    numerator: 4,
    denominator: 4,
  });

  const [timeSignatureString, setTimeSignatureString] = useState<string>("");

  // Current transport time (using Tone.Transport.seconds)
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Timeline configuration (vertical)
  const pixelsPerBeat = 50; // vertical scale: pixels per beat
  const containerHeight = 700; // container height in px
  const containerCenter = containerHeight / 2; // vertical center

  const [songData, setSongData] = useState<SongData | null>(null);
  const [structure, setStructure] = useState<Structure[]>([]);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [songTimeLines, setSongTimeLines] = useState<EventData[]>([]);

  const [currentTickData, setCurrentTickData] = useState<TickData | null>(null);

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);

  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messageCountOut, setMessageCountOut] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [fileLoaded, setFileLoaded] = useState<boolean>(false);

  // High-frequency update using requestAnimationFrame
  useEffect(() => {
    // console.log("useEffect");
    let animationFrameId: number;
    const updateTime = () => {
      const tObject = Tone.getTransport();
      setCurrentTime(tObject.seconds);
      animationFrameId = requestAnimationFrame(updateTime);
    };
    animationFrameId = requestAnimationFrame(updateTime);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  useEffect(() => {
    if (songData) {
      try {
        handleLoadSong(songData.track.url + songData.track.filename);
      } catch (error) {
        console.error("Error loading song", error);
      }
      setTitle(songData.track.title);
      setStructure(songData.structure);
      setSongTimeLines(songData.timeline);
      setMarkers(songData.markers);
      setSkipBeats(songData.track.skipBeats);
      setTimeSignature({
        numerator: songData.track.numerator,
        denominator: songData.track.denominator,
      });
      setTempo(songData.track.tempo);
      setSkipBeatsBy(songData.track.skipBeatsBy);
      setCountIn(songData.track.countIn);
      setCanEdit(true); /* change this when user is logged in */
      setInstruments(songData.instruments);
      handleRestart(setCurrentTime, setIsPlaying);
    }
  }, [songData]);

  useEffect(() => {
    if (duration && tempo && timeSignature) {
      console.log("Instruments changed", instruments);
      // console.log("Time Signature changed ----> -----?", timeSignature);
      const newBeatData = generateBeatData(
        duration,
        tempo,
        timeSignature,
        skipBeats,
        structure,
        songTimeLines
      );
      // setLoopEnd(duration);
      setLoopEnd(newBeatData.length - 1);
      setBeatData(newBeatData);
    }
  }, [duration, tempo, timeSignature, instruments]);

  // When tempo changes, update Tone.Transport BPM.
  useEffect(() => {
    const tObject = Tone.getTransport();
    tObject.bpm.value = tempo;
    tObject.timeSignature = timeSignature.numerator;
    // console.log("Time Signature changed ---->", timeSignature);
  }, [tempo, timeSignature]);

  useEffect(() => {
    // Schedule a repeat callback on every quarter note (assuming beat = quarter note)
    const tObject = Tone.getTransport();
    const pulseId = tObject.scheduleRepeat(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 100);
    }, "4n");

    return () => {
      tObject.clear(pulseId);
    };
  }, []);

  useEffect(() => {
    // Initialize the synth with a short envelope for a click sound.
    clickSynthRef.current = new Tone.Synth({
      oscillator: { type: "sine" },
      envelope: {
        attack: 0.001,
        decay: 0.05,
        sustain: 0,
        release: 0.05,
      },
    }).toDestination();

    // Cleanup when the component unmounts
    return () => {
      if (clickSynthRef.current) {
        clickSynthRef.current.dispose();
      }
    };
  }, []);

  /* 
  This Triggers the metronome sound at the appropriate time.
  */
  useEffect(() => {
    const transport = Tone.getTransport();
    const clickId = transport.scheduleRepeat((time) => {
      // if (transport.seconds >= duration) {
      //   transport.pause();
      //   // setSongEnded(true);
      //   setIsPlaying(false);
      // }
      for (let i = 0; i < beatData.length; i++) {
        if (approximatelyEqual(beatData[i].time, transport.seconds, 0.07)) {
          if (beatData[i].hasMessage) {
            setShowMessage(true);
            setMessage(beatData[i].message);
            setMessageCountOut(beatData[i].countOut);
          }
          if (beatData[i].isBarStart) {
            if (clickSynthRef.current) {
              clickSynthRef.current.triggerAttackRelease("C5", "8n", time);
            }
          } else {
            if (clickSynthRef.current) {
              clickSynthRef.current.triggerAttackRelease("C6", "8n", time);
            }
          }
          break;
        }
      }
    }, "4n");
    return () => {
      transport.clear(clickId);
    };
  }, [beatData]);

  // useEffect(() => {
  //   console.log("Loop settings changed", loopStart, loopEnd);
  // }, [loopStart, loopEnd]);

  const handleLoadSong = (file: string) => {
    loadSongFromJson(file, setAudioSrc, setDuration, playerRef);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, setAudioSrc, setDuration, playerRef);
  };

  // const handleSongHasEnded = () => {
  //   const tObject = Tone.getTransport();
  //   tObject.stop();
  //   setSongEnded(true);
  //   setIsPlaying(false);
  // };

  // Tempo input change
  const handleTempoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newTempo = parseFloat(e.target.value);
    if (!isNaN(newTempo)) {
      setTempo(newTempo);
    }
  };

  // Skip Bars input change
  const handleSkipBeatsChange = (e: ChangeEvent<HTMLInputElement>) => {
    const beats = parseInt(e.target.value, 10);
    setSkipBeats(isNaN(beats) ? 0 : beats);
  };

  // Time signature change
  const handleTimeSignatureChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setTimeSignatureString(e.target.value);
    // setTimeSignature({
    //   numerator: parseInt(e.target.value.split("/")[0], 10),
    //   denominator: parseInt(e.target.value.split("/")[1], 10),
    // });
  };

  const handleLoopStartChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLoopStart(parseInt(e.target.value, 10));
  };

  const handleLoopEndChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setLoopEnd(parseInt(e.target.value, 10));
  };

  const handleCountInComplete = () => {
    const tObject = Tone.getTransport();
    tObject.start();
    setIsPlaying(true);
    setShowCountIn(false);
  };

  const handleMessageCountOutComplete = () => {
    setMessageCountOut(0);
    setShowMessage(false);
  };

  // Compute beat duration (in seconds) based on tempo.
  // const currentBeat = Math.floor(currentTime / (60 / tempo));
  const beatDuration = 60 / tempo;
  // Total beats (rounded up)
  const totalBeats = duration ? Math.ceil(duration / beatDuration) : 0;
  // Total timeline height (in pixels)
  const timelineHeight = totalBeats * pixelsPerBeat;

  // Compute current beat (fractional)
  const currentBeat = currentTime / beatDuration;

  // Suppose skipStartBeat is set when playback begins.
  // const skipDurationBeats = skip * 1;
  let effectiveBeat: number;
  if (currentBeat < skipBeats) {
    // Pause movement: effectiveBeat remains constant.
    effectiveBeat = 0;
  } else {
    // Now that the skip period is over, start moving:
    effectiveBeat = currentBeat - skipBeats;
  }

  // Compute top offset: we want the tick for the current beat (at currentBeat * pixelsPerBeat from the top)
  // to be aligned with the container center.
  // const timelineOffset = containerCenter - currentBeat * pixelsPerBeat;

  const timelineOffset = containerCenter - effectiveBeat * pixelsPerBeat;

  // Determine beats per bar from the time signature (e.g. "4/4" means 4 beats per bar)
  const beatsPerBar = timeSignature.numerator; // parseInt(timeSignature?.split("/")[0], 10) || 3;

  const currentBar = Math.floor(effectiveBeat / beatsPerBar) + 1;

  const beatCount = (Math.floor(effectiveBeat) % beatsPerBar) + 1;

  // Build ticks: an array where each tick is for one beat.
  const startTicks: TickData[] = Array.from(
    { length: totalBeats + 1 },
    (_, beatIndex): TickData => ({
      beatIndex,
      type: beatIndex % beatsPerBar === 0 ? "bar" : "beat",
    })
  );

  // Add an extra item to the top of the ticks array for each skipBeats
  const ticks: TickData[] = [
    ...Array.from(
      { length: skipBeats },
      (_, beatIndex): TickData => ({
        beatIndex: -skipBeats + beatIndex,
        type: "skip",
      })
    ),
    ...startTicks,
  ];

  const handleBeat = (beat: number) => {
    // Trigger a click sound at the appropriate time.
    if (clickSynthRef.current) {
      clickSynthRef.current.triggerAttackRelease("C5", "8n");
    }
    console.log("Beat:", beat);
  };

  const handleLoadSongJSON = async (file: string) => {
    setLoading(true);
    const loaded = await loadSongFile(file, setSongData, setFileLoaded);
    if (!loaded) {
      alert("Error loading song file.");
    }
    setLoading(false);
  };

  const handleAddEditMarker = (tick: TickData, deleteMarker: boolean) => {
    const existingMarker = markers.find(
      (marker) => marker.beat === tick.beatIndex
    );
    if (deleteMarker) {
      if (existingMarker) {
        const confirmDelete = window.confirm(
          `Are you sure you want to delete the marker "${existingMarker.label}"?`
        );
        if (confirmDelete) {
          setMarkers((prevMarkers) =>
            prevMarkers.filter((marker) => marker.beat !== tick.beatIndex)
          );
        }
      } else {
        alert("No marker found at this position to delete.");
      }
    } else {
      if (existingMarker) {
        const newLabel = prompt("Edit marker label:", existingMarker.label);
        if (newLabel) {
          setMarkers((prevMarkers) =>
            prevMarkers.map((marker) =>
              marker.beat === tick.beatIndex
                ? { ...marker, label: newLabel }
                : marker
            )
          );
        }
      } else {
        const label = prompt("Enter marker label:");
        if (label) {
          setMarkers((prevMarkers) => [
            ...prevMarkers,
            { label, beat: tick.beatIndex },
          ]);
        }
      }
    }
  };

  const handleEditEvent = (tick: TickData, deleteEvent: boolean) => {
    if (deleteEvent) {
      const confirmDelete = window.confirm(
        `Are you sure you want to delete the event at beat ${tick.beatIndex}?`
      );
      if (confirmDelete) {
        setSongTimeLines((prevTimeLines) =>
          prevTimeLines.filter((line) => line.beat !== tick.beatIndex)
        );
        console.log("Event deleted at beat", tick.beatIndex);
      }
    } else {
      setCurrentTickData(tick);
      setShowEditEventDialog(true);
      console.log("Edit Event", tick, deleteEvent);
    }
  };

  const handleInstrumentsUpdate = (
    instrument: Instrument,
    deleteInstrument: boolean
  ) => {
    if (deleteInstrument) {
      setSongTimeLines((prevTimeLines) =>
        prevTimeLines.filter((line) => line.instrumentId !== instrument.id)
      );
      setInstruments((prevInstruments) =>
        prevInstruments.filter((inst) => inst.id !== instrument.id)
      );
    } else {
      setInstruments((prevInstruments) => {
        const existingInstrumentIndex = prevInstruments.findIndex(
          (inst) => inst.id === instrument.id
        );
        if (existingInstrumentIndex !== -1) {
          const updatedInstruments = [...prevInstruments];
          updatedInstruments[existingInstrumentIndex] = instrument;
          return updatedInstruments;
        } else {
          return [...prevInstruments, instrument];
        }
      });
    }
  };

  // const handleAddEvent = (eventData: EventData | undefined) => {
  //   if (!eventData) {
  //     return;
  //   }
  //   setSongTimeLines((prevTimeLines) => [...prevTimeLines, eventData]);
  // };

  return (
    <div className="app-container">
      {loading && <Loader />}
      <div className="app-header">
        <button
          disabled={isPlaying}
          onClick={() => {
            handleLoadSongJSON("/data/song2.json");
          }}
        >
          Signals
        </button>
        <button
          disabled={isPlaying}
          onClick={() => {
            handleLoadSongJSON("/data/song.json");
          }}
        >
          Untitled
        </button>
      </div>
      <div className="app-content">
        <div className="timeline-sidebar">
          <div
            className="timeline-container"
            style={{ height: containerHeight }}
          >
            <div className="timeline-header">
              {fileLoaded && (
                <>
                  <div className="time-display">{timeSignatureString}</div>
                  <div className="time-display" style={{ width: "100px" }}>
                    <div>
                      {`${Math.floor(currentBar)}`} :{" "}
                      {`${Math.floor(beatCount)}`}
                    </div>
                  </div>
                </>
              )}
            </div>
            {showCountIn && (
              <CountIn
                countIn={countIn}
                skipBeats={skipBeats}
                atStart={currentTime === 0}
                bpm={tempo}
                onComplete={handleCountInComplete}
                onBeat={handleBeat}
              />
            )}
            {isPlaying && showMessage && (
              <CountOut
                countOut={messageCountOut}
                message={message}
                bpm={tempo}
                onComplete={handleMessageCountOutComplete}
              />
            )}
            <div
              className="timeline-inner"
              style={{
                height: timelineHeight,
                transform: `translateY(${timelineOffset}px)`,
              }}
            >
              {/* {ticks.map((tick, index) => renderTick(tick, index))} */}
              {fileLoaded &&
                ticks.map((tick, index) =>
                  renderTick2(
                    tick,
                    index,
                    songTimeLines,
                    markers,
                    pixelsPerBeat,
                    beatsPerBar,
                    skipBeats,
                    currentBeat,
                    instruments,
                    selectedInstrument,
                    !isPlaying && canEdit,
                    handleAddEditMarker,
                    handleEditEvent
                    // renderTick(tick, index)
                  )
                )}
              {!fileLoaded && <h3>Select a song from above</h3>}
            </div>
            <div
              className={`center-indicator ${pulse ? "pulse" : ""}`}
              style={{ top: containerCenter }}
            />
            <div className="timeline-footer">
              {fileLoaded && (
                <button
                  onClick={() => {
                    setSelectedInstrument(null);
                  }}
                >
                  ALL
                </button>
              )}

              {fileLoaded &&
                instruments.length > 0 &&
                instruments.map((instrument, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      console.log(":->", instrument);
                      setSelectedInstrument(instrument);
                    }}
                  >
                    {instrument.name}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Main content: controls and settings */}
        <div className="main-tabs">
          <div className="tab-links">
            <button
              onClick={() => setActiveTab("track")}
              style={{ color: activeTab === "track" ? "yellow" : "lightgray" }}
            >
              Playback
            </button>
            <button
              onClick={() => setActiveTab("settings")}
              style={{
                color: activeTab === "settings" ? "yellow" : "lightgray",
              }}
            >
              Settings
            </button>
            <button
              onClick={() => setActiveTab("markers")}
              style={{
                color: activeTab === "markers" ? "yellow" : "lightgray",
              }}
            >
              Markers
            </button>
            {/* <button
              onClick={() => setActiveTab("settings")}
              style={{
                color: activeTab === "events" ? "yellow" : "lightgray",
              }}
            >
              Events
            </button> */}
          </div>
          {activeTab === "track" && (
            <div className="main-content">
              {audioSrc && (
                <>
                  <div className="transport-system">
                    <div className="transport-controls">
                      <button
                        onClick={() => {
                          setIsPlaying(!isPlaying);

                          if (loop) {
                            //console.log("Looping");
                            togglePlayPauseWithLoop(
                              isPlaying,
                              beatData[loopStart].time,
                              beatData[loopEnd].time,
                              timeSignature,
                              skipBeats,
                              setIsPlaying
                            );
                          } else {
                            //console.log("Not Looping");
                            togglePlayPause(
                              isPlaying,
                              countIn,
                              timeSignature,
                              skipBeats,
                              setShowCountIn,
                              setIsPlaying
                            );
                          }
                        }}
                      >
                        {isPlaying ? <Pause /> : <Play />}
                      </button>
                      <button
                        onClick={() =>
                          handleRestart(setCurrentTime, setIsPlaying)
                        }
                      >
                        <SkipBack />
                      </button>
                      <button
                        onClick={() =>
                          handleSkipBackward(skipBeatsBy, setCurrentTime)
                        }
                      >
                        <Rewind />
                      </button>
                      <button
                        onClick={() =>
                          handleSkipForward(skipBeatsBy, setCurrentTime)
                        }
                      >
                        <FastForward />
                      </button>
                    </div>
                    <div className="transport-tools">
                      <label>
                        Skip by:
                        <input
                          type="number"
                          value={skipBeatsBy}
                          onChange={(e) =>
                            setSkipBeatsBy(parseInt(e.target.value, 10))
                          }
                        />
                      </label>
                      <label>
                        <button
                          disabled={isPlaying}
                          onClick={() => {
                            const tObject = Tone.getTransport();
                            tObject.seconds = beatData[goToBeat].time;
                          }}
                        >
                          Go:
                        </button>
                        <input
                          disabled={isPlaying}
                          type="number"
                          value={goToBeat}
                          onChange={(e) => {
                            setGoToBeat(
                              parseInt(e.target.value, 10) < beatData.length
                                ? parseInt(e.target.value, 10)
                                : beatData.length - 2
                            );
                          }}
                        />{" "}
                        <select
                          value={goToBeat}
                          onChange={(e) =>
                            setGoToBeat(parseInt(e.target.value, 10))
                          }
                        >
                          <option value={0}>Start</option>
                          {markers.map((marker, index) => (
                            <option key={index} value={marker.beat}>
                              {marker.label}
                            </option>
                          ))}
                          <option value={beatData.length - 1}>End</option>
                        </select>
                      </label>
                    </div>
                  </div>

                  <div className="loop-settings">
                    <button
                      disabled={loopEnd === loopStart || loopStart > loopEnd}
                      onClick={() => {
                        setLoop(!loop);
                      }}
                      style={{ color: loop ? "limegreen" : "" }}
                    >
                      <Repeat2 />
                    </button>
                    <label>
                      From:&nbsp;
                      <select
                        value={loopStart || 0}
                        onChange={handleLoopStartChange}
                      >
                        <option value="0">Start</option>
                        {markers.map((marker, index) => (
                          <option key={index} value={marker.beat}>
                            {marker.label}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      To:&nbsp;
                      <select
                        value={loopEnd || 0}
                        onChange={handleLoopEndChange}
                      >
                        {markers.map((marker, index) => (
                          <option key={index} value={marker.beat}>
                            {marker.label}
                          </option>
                        ))}
                        <option value={loopEnd}>End</option>
                      </select>
                    </label>
                  </div>
                  <div className="volume-controls">
                    <label>
                      Song:
                      <input
                        type="range"
                        min="-20"
                        max="5"
                        step="1"
                        defaultValue="-6"
                        onChange={(e) => {
                          if (playerRef.current) {
                            playerRef.current.volume.value = parseInt(
                              e.target.value
                            );
                          }
                        }}
                      />
                    </label>
                    <label>
                      Click:
                      <input
                        type="range"
                        min="-20"
                        max="5"
                        step="1"
                        defaultValue="-6"
                        onChange={(e) => {
                          if (clickSynthRef.current) {
                            clickSynthRef.current.volume.value = parseInt(
                              e.target.value
                            );
                          }
                        }}
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
          )}
          {activeTab === "settings" && (
            <div className="main-content">
              {fileLoaded && (
                <div className="file-info">
                  <h2>{title ? title : "Track Title"}</h2>

                  <div className="file-loader">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={onFileChange}
                    />
                  </div>
                </div>
              )}
              {audioSrc && (
                <>
                  <div className="settings">
                    <h2>Global</h2>
                    <div className="settings-section">
                      <label>
                        Tempo (BPM):&nbsp;
                        <input
                          type="number"
                          value={tempo}
                          onChange={handleTempoChange}
                        />
                      </label>

                      <label>
                        Time Sig:&nbsp;
                        <select
                          value={timeSignatureString}
                          onChange={handleTimeSignatureChange}
                        >
                          <option value="4/4">4/4</option>
                          <option value="3/4">3/4</option>
                          <option value="6/8">6/8</option>
                        </select>
                      </label>
                    </div>
                    <div className="settings-section">
                      <label>
                        Count-In:
                        <input
                          type="number"
                          value={countIn}
                          onChange={(e) =>
                            setCountIn(parseInt(e.target.value, 10))
                          }
                        />
                      </label>
                      <label>
                        Skip Beats (at Start):&nbsp;
                        <input
                          type="number"
                          value={skipBeats}
                          onChange={handleSkipBeatsChange}
                        />
                      </label>
                    </div>
                  </div>
                  <Settings
                    instruments={instruments}
                    handleInstrumentsUpdate={handleInstrumentsUpdate}
                  />
                </>
              )}
            </div>
          )}
          {activeTab === "markers" && (
            <div className="main-content">
              {audioSrc && (
                <>
                  <div className="settings">
                    <div className="marker-list">
                      <h3>Markers</h3>
                      <ul>
                        {markers.map((marker, index) => (
                          <li key={index}>
                            <strong>{marker.label}</strong> at beat{" "}
                            {marker.beat}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showEditEventDialog && currentTickData && (
        <EventDialog
          mode="new"
          tickData={currentTickData}
          instruments={instruments}
          setSongTimeLines={setSongTimeLines}
          setShowEventDialog={setShowEditEventDialog}
        />
      )}
    </div>
  );
};

export default App;
