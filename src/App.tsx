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
import { Repeat2 } from "lucide-react";
import {
  loadMasterTrackFromJson,
  handleMasterTrackFileChange,
  loadTracksFromInstruments,
} from "./helpers/FileFunctions";
import { generateBeatData, approximatelyEqual, loadSongFile } from "./utils";
import { handleRestart } from "./helpers/TransportFunctions";
import Loader from "./components/Loader";
import EventDialog from "./components/EventDialog";
import Instruments from "./components/Instruments";
import Tabs from "./components/Tabs";
import ProjectsList from "./components/ProjectsList";
import Header from "./components/Header";
import TransportControls from "./components/TransportControls";

// const supabase = createClient(
//   "https://zjhdapoqakbbheerqvsm.supabase.co",
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpqaGRhcG9xYWtiYmhlZXJxdnNtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MTYwMzksImV4cCI6MjA1NTk5MjAzOX0.zK1RcWP23BofCvpt2gcvE2psWMADHRQBT-HduaUX2SE"
// );

const App: React.FC = () => {
  // Tone.Player reference
  const [activeTab, setActiveTab] = useState<string>("track");
  // const playerRef = useRef<Tone.Player | undefined>(undefined);
  const playersRef = useRef<Tone.Players | null>(null);

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
  const [masterVolume, setMasterVolume] = useState<number>(-6);
  const [masterPan, setMasterPan] = useState<number>(0);
  const [masterMute, setMasterMute] = useState<boolean>(false);
  const [masterSolo, setMasterSolo] = useState<boolean>(false);
  // const [skipStartBeat, setSkipStartBeat] = useState<number>(0);
  const [pulse, setPulse] = useState<boolean>(false);

  // Global tempo and time signature state
  const [tempo, setTempo] = useState<number>(130); // BPM
  // const [timeSignatureString, setTimeSignatureString] = useState<string>("4/4");
  const [timeSignature, setTimeSignature] = useState<TimeSignature>({
    numerator: 4,
    denominator: 4,
  });

  // Current transport time (using Tone.Transport.seconds)
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Timeline configuration (vertical)
  const pixelsPerBeat = 50; // vertical scale: pixels per beat
  const containerHeight = 700; // container height in px
  const containerCenter = containerHeight / 2; // vertical center

  const [songData, setSongData] = useState<SongData | null>(null);
  const [notes, setNotes] = useState<string>("");
  const [structure, setStructure] = useState<Structure[]>([]);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [songTimeLines, setSongTimeLines] = useState<EventData[]>([]);
  const [existingEvent, setExistingEvent] = useState<EventData | undefined>(
    undefined
  );

  const [currentTickData, setCurrentTickData] = useState<TickData | null>(null);

  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selectedInstrument, setSelectedInstrument] =
    useState<Instrument | null>(null);

  const [showMessage, setShowMessage] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [messageCountOut, setMessageCountOut] = useState<number>(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [loadingMsg, setLoadingMsg] = useState<string>("");
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
        handleLoadMasterTrack(songData.project.url + songData.project.filename);
      } catch (error) {
        console.error("Error loading song", error);
      }
      setTitle(songData.project.title);
      setNotes(songData.notes);
      setStructure(songData.structure);
      setSongTimeLines(songData.timeline);
      setMarkers(songData.markers);
      setSkipBeats(songData.project.skipBeats);
      setMasterVolume(songData.project.masterVolume);
      setMasterPan(songData.project.masterPan);
      setMasterMute(songData.project.masterMute);
      setMasterSolo(songData.project.masterSolo);
      setTimeSignature({
        numerator: songData.project.numerator,
        denominator: songData.project.denominator,
      });
      setTempo(songData.project.tempo);
      setSkipBeatsBy(songData.project.skipBeatsBy);
      setCountIn(songData.project.countIn);
      setCanEdit(true); /* change this when user is logged in */
      setInstruments(songData.instruments);
      handleRestart(setCurrentTime, setIsPlaying);
    }
  }, [songData]);

  useEffect(() => {
    // console.log("timesignature changed", timeSignature);
    if (duration && tempo && timeSignature) {
      const newBeatData = generateBeatData(
        duration,
        tempo,
        timeSignature,
        skipBeats,
        structure,
        songTimeLines
      );

      if (instruments.length > 0) {
        loadTracksFromInstruments(
          instruments,
          playersRef,
          setLoading,
          setLoadingMsg
        );
      }
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

  const handleLoadMasterTrack = (file: string) => {
    //  setLoading(true);
    setLoadingMsg("Loading Master Track");
    loadMasterTrackFromJson(file, setAudioSrc, setDuration, playersRef);
    //  setLoading(false);
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleMasterTrackFileChange(e, setAudioSrc, setDuration, playersRef);
    setFileLoaded(true);
    setCanEdit(true);
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
  const handleTimeSignatureNumeratorChange = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    // setTimeSignatureString(e.target.value);
    setTimeSignature({
      numerator: parseInt(e.target.value),
      denominator: timeSignature.denominator,
    });
  };

  const handleTimeSignatureDenominatorChange = (
    e: ChangeEvent<HTMLSelectElement>
  ) => {
    // setTimeSignatureString(e.target.value);
    setTimeSignature({
      numerator: timeSignature.numerator,
      denominator: parseInt(e.target.value),
    });
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
    setLoadingMsg("Loading Project File");
    const loaded = await loadSongFile(file, setSongData, setFileLoaded);
    if (!loaded) {
      alert("Error loading song file.");
    }
    // setLoading(false);
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
      const existingEvent = songTimeLines.find(
        (event) =>
          event.beat === tick.beatIndex &&
          event.instrumentId === selectedInstrument?.id
      );
      setExistingEvent(existingEvent || undefined);
      setCurrentTickData(tick);
      setShowEditEventDialog(true);
      console.log("Edit Event", tick, deleteEvent, existingEvent);
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

  const exportSongData = () => {
    const songData: SongData = {
      project: {
        title,
        url: "/data",
        filename: "song.json",
        skipBeats,
        skipBeatsBy,
        masterVolume,
        masterPan,
        masterMute,
        masterSolo,
        countIn,
        numerator: timeSignature.numerator,
        denominator: timeSignature.denominator,
        tempo,
      },
      notes,
      structure,
      timeline: songTimeLines,
      markers,
      instruments,
    };
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(songData, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "song.json");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <div className="app-container">
      {loading && <Loader message={loadingMsg} />}
      <Header isLoggedIn={true} />
      <div className="app-content">
        <div className="timeline-sidebar">
          <div
            className="timeline-container"
            style={{ height: containerHeight }}
          >
            <div className="timeline-header">
              {fileLoaded && (
                <>
                  <TransportControls
                    size={20}
                    isPlaying={isPlaying}
                    loop={loop}
                    loopStart={loopStart}
                    loopEnd={loopEnd}
                    beatData={beatData}
                    timeSignature={timeSignature}
                    skipBeats={skipBeats}
                    countIn={countIn}
                    skipBeatsBy={skipBeatsBy}
                    setCurrentTime={setCurrentTime}
                    setIsPlaying={setIsPlaying}
                    setShowCountIn={setShowCountIn}
                  />

                  {/* <div className="time-display">
                    {timeSignature.numerator + "/" + timeSignature.denominator}
                  </div> */}
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
              {!fileLoaded && <h2>Select a project from the Projects tab</h2>}
            </div>
            <div
              className={`center-indicator ${pulse ? "pulse" : ""}`}
              style={{ top: containerCenter }}
            />
            <div className="timeline-footer">
              {fileLoaded && (
                <button
                  className={selectedInstrument === null ? "selected" : ""}
                  onClick={() => {
                    setSelectedInstrument(null);
                  }}
                >
                  ALL
                </button>
              )}
              {fileLoaded && instruments.length < 1 && (
                <button onClick={() => setActiveTab("settings")}>
                  Add an Instrument
                </button>
              )}
              {fileLoaded &&
                instruments.length > 0 &&
                instruments.map((instrument, index) => (
                  <button
                    className={
                      selectedInstrument?.id === instrument.id ? "selected" : ""
                    }
                    key={index}
                    onClick={() => {
                      //console.log(":->", instrument);
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
          <Tabs
            fileLoaded={fileLoaded}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
          {activeTab === "playback" && (
            <div className="main-content">
              {audioSrc && (
                <>
                  <div className="transport-system">
                    <div className="transport-controls">
                      <TransportControls
                        size={20}
                        isPlaying={isPlaying}
                        loop={loop}
                        loopStart={loopStart}
                        loopEnd={loopEnd}
                        beatData={beatData}
                        timeSignature={timeSignature}
                        skipBeats={skipBeats}
                        countIn={countIn}
                        skipBeatsBy={skipBeatsBy}
                        setCurrentTime={setCurrentTime}
                        setIsPlaying={setIsPlaying}
                        setShowCountIn={setShowCountIn}
                      />
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
                      Click Volume:
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
          {activeTab === "instruments" && (
            <div className="main-content">
              {audioSrc && playersRef && (
                <>
                  <Instruments
                    masterSolo={masterSolo}
                    setMasterSolo={setMasterSolo}
                    masterMute={masterMute}
                    setMasterMute={setMasterMute}
                    instruments={instruments}
                    handleInstrumentsUpdate={handleInstrumentsUpdate}
                    playersRef={playersRef}
                  />
                </>
              )}
            </div>
          )}
          {activeTab === "settings" && (
            <div className="main-content">
              {fileLoaded && (
                <div className="file-info">
                  <h2 style={{ color: "white" }}>
                    {title ? title : "Track Title"}
                  </h2>

                  <button onClick={exportSongData}>Export Song Data</button>
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
                          value={timeSignature.numerator}
                          onChange={handleTimeSignatureNumeratorChange}
                        >
                          <option value="4">4</option>
                          <option value="3">3</option>
                          <option value="6">6</option>
                        </select>{" "}
                        {"/"}
                        <select
                          value={timeSignature.denominator}
                          onChange={handleTimeSignatureDenominatorChange}
                        >
                          <option value="4">4</option>
                          <option value="4">4</option>
                          <option value="8">8</option>
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
                </>
              )}
            </div>
          )}

          {/* {activeTab === "notes" && (
            <div className="main-content">
              {audioSrc && (
                <>
                  <div className="settings">
                    <h2>Notes</h2>
                    <div className="settings-section">
                      <textarea
                        style={{
                          width: "100%",
                          height: "200px",
                          fontFamily: "Roboto",
                        }}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )} */}
          {activeTab === "projects" && (
            <div className="main-content">
              <div className="settings">
                <h2>Your Projects</h2>

                <div className="settings-section">
                  <ProjectsList
                    isPlaying={isPlaying}
                    handleLoadSongJSON={handleLoadSongJSON}
                    onFileChange={onFileChange}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showEditEventDialog && currentTickData && selectedInstrument && (
        <EventDialog
          mode={existingEvent ? "edit" : "new"}
          tickData={currentTickData}
          // instruments={instruments}
          existingEvent={existingEvent}
          selectedInstrument={selectedInstrument}
          setSongTimeLines={setSongTimeLines}
          setShowEventDialog={setShowEditEventDialog}
        />
      )}
    </div>
  );
};

export default App;
