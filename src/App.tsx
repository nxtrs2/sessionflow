import React, {
  useState,
  useRef,
  useEffect,
  ChangeEvent,
  CSSProperties,
} from "react";
import {
  Rewind,
  FastForward,
  Play,
  Pause,
  SkipBack,
  Repeat2,
} from "lucide-react";

import * as Tone from "tone";
import "./App.css";
import CountIn from "./CountIn";
import { SongData, TimeLineData, MarkerData, BeatData } from "./types";
import { loadSongFromJson, handleFileChange } from "./helpers/FileFunctions";
import { generateBeatData, approximatelyEqual } from "./utils";
import {
  togglePlayPause,
  handleSkipBackward,
  handleSkipForward,
  handleRestart,
} from "./helpers/TransportFunctions";

const App: React.FC = () => {
  // Tone.Player reference
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
  const [songEnded, setSongEnded] = useState<boolean>(false);

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
  const [timeSignature, setTimeSignature] = useState<string>("4/4");

  // Current transport time (using Tone.Transport.seconds)
  const [currentTime, setCurrentTime] = useState<number>(0);

  // Timeline configuration (vertical)
  const pixelsPerBeat = 50; // vertical scale: pixels per beat
  const containerHeight = 700; // container height in px
  const containerCenter = containerHeight / 2; // vertical center

  const [songData, setSongData] = useState<SongData | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [songTimeLines, setSongTimeLines] = useState<TimeLineData[]>([]);

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
    fetch("/data/song2.json") // The path is relative to the public folder.
      .then((res) => res.json())
      .then((data) => setSongData(data))
      .catch((err) => console.error("Error loading song data", err));
  }, []);

  useEffect(() => {
    if (songData) {
      try {
        handleLoadSong(songData.track.url + songData.track.filename);
        console.log(
          "Song loaded",
          songData.track.url + songData.track.filename
        );
      } catch (error) {
        console.error("Error loading song", error);
      }
      setTitle(songData.track.title);
      setSongTimeLines(songData.timeline);
      setMarkers(songData.markers);
      setSkipBeats(songData.track.skipBeats);
      setTempo(songData.track.tempo);
      setTimeSignature("4/4");
      setSkipBeatsBy(songData.track.skipBeatsBy);
      setCountIn(songData.track.countIn);
    }
  }, [songData]);

  useEffect(() => {
    if (duration) {
      const newBeatData = generateBeatData(duration, tempo, timeSignature);
      setBeatData(newBeatData);
    }
  }, [duration, tempo, timeSignature]);

  // When tempo changes, update Tone.Transport BPM.
  useEffect(() => {
    const tObject = Tone.getTransport();
    tObject.bpm.value = tempo;
  }, [tempo]);

  useEffect(() => {
    // Schedule a repeat callback on every quarter note (assuming beat = quarter note)
    const tObject = Tone.getTransport();
    const pulseId = tObject.scheduleRepeat((time) => {
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

  useEffect(() => {
    const transport = Tone.getTransport();
    const clickId = transport.scheduleRepeat((time) => {
      if (transport.seconds >= duration) {
        transport.stop();
        setSongEnded(true);
        setIsPlaying(false);
        return;
      }
      for (let i = 0; i < beatData.length; i++) {
        if (approximatelyEqual(beatData[i].time, transport.seconds, 0.07)) {
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

  useEffect(() => {
    console.log("Loop settings changed", loopStart, loopEnd);
  }, [loopStart, loopEnd]);

  const handleLoadSong = (file: string) => {
    loadSongFromJson(
      file,
      setAudioSrc,
      setDuration,
      handleSongHasEnded,
      playerRef
    );
  };

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    handleFileChange(e, setAudioSrc, setDuration, playerRef);
  };

  const handleSongHasEnded = () => {
    const tObject = Tone.getTransport();
    tObject.stop();
    setSongEnded(true);
    setIsPlaying(false);
  };

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
    setTimeSignature(e.target.value);
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
  const beatsPerBar = parseInt(timeSignature.split("/")[0], 10) || 4;

  const currentBar = Math.floor(effectiveBeat / beatsPerBar) + 1;

  const beatCount = (Math.floor(effectiveBeat) % beatsPerBar) + 1;

  // Build ticks: an array where each tick is for one beat.
  const startTicks: { beatIndex: number; type: "bar" | "beat" | "skip" }[] =
    Array.from({ length: totalBeats + 1 }, (_, beatIndex) => ({
      beatIndex,
      type: beatIndex % beatsPerBar === 0 ? "bar" : "beat",
    }));

  const handleBeat = (beat: number) => {
    // Trigger a click sound at the appropriate time.
    if (clickSynthRef.current) {
      clickSynthRef.current.triggerAttackRelease("C5", "8n");
    }
    console.log("Beat:", beat);
  };

  // Add an extra item to the top of the ticks array for each skipBeats
  const ticks = [
    ...Array.from({ length: skipBeats }, (_, beatIndex) => ({
      beatIndex: -skipBeats + beatIndex,
      type: "skip",
    })),
    ...startTicks,
  ];

  // Render a tick as a div positioned from the top.
  const renderTick = (
    tick: { beatIndex: number; type: "bar" | "beat" | "skip" },
    index: number
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
          <div className="tick-message">
            {
              songTimeLines.find((timeline) => timeline.beat === tick.beatIndex)
                ?.message
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

  return (
    <div className="app-container">
      {/* Sidebar: Vertical timeline */}
      <div className="timeline-sidebar">
        <div className="timeline-container" style={{ height: containerHeight }}>
          <div className="timeline-header">
            <div className="time-display"></div>
            <div className="time-display" style={{ width: "100px" }}>
              <div>
                {`${Math.floor(currentBar)}`} : {`${Math.floor(beatCount)}`}
              </div>
            </div>
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
          <div
            className="timeline-inner"
            style={{
              height: timelineHeight,
              transform: `translateY(${timelineOffset}px)`,
            }}
          >
            {ticks.map((tick, index) => renderTick(tick, index))}
          </div>
          <div
            className={`center-indicator ${pulse ? "pulse" : ""}`}
            style={{ top: containerCenter }}
          />
        </div>
      </div>

      {/* Main content: controls and settings */}
      <div className="main-content">
        <div className="file-info">
          <h2>{title ? title : "Track Title"}</h2>

          <div className="file-loader">
            <input type="file" accept="audio/*" onChange={onFileChange} />
          </div>
        </div>
        {audioSrc && (
          <>
            <div className="transport-system">
              <div className="transport-controls">
                <button
                  // disabled={loopEnd === 0}
                  onClick={() => {
                    if (loop) {
                      const tObject = Tone.getTransport();
                      tObject.loop = true;
                      tObject.loopStart = beatData[loopStart].time;
                      tObject.loopEnd = beatData[loopEnd].time;
                      tObject.start();
                    } else {
                      const tObject = Tone.getTransport();
                      tObject.loop = false;
                      tObject.loopStart = 0;
                      tObject.loopEnd = 0;
                      tObject.stop();
                    }
                    setLoop(!loop);
                  }}
                  // onClick={() => setLoop(!loop)}
                  style={{ color: loop ? "green" : "white" }}
                >
                  <Repeat2 />
                </button>
                <button
                  onClick={() => {
                    setIsPlaying(!isPlaying);

                    if (loop) {
                      const tObject = Tone.getTransport();
                      tObject.start();
                    } else {
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
                  onClick={() => handleRestart(setCurrentTime, setIsPlaying)}
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
                  onClick={() => handleSkipForward(skipBeatsBy, setCurrentTime)}
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
                      tObject.seconds = beatData[goToBeat + 2].time;
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
                          : 0
                      );
                    }}
                  />
                </label>
              </div>
            </div>

            <div className="loop-settings">
              <label>
                Loop From:&nbsp;
                <select value={loopStart || 0} onChange={handleLoopStartChange}>
                  <option value="0">None</option>
                  {markers.map((marker, index) => (
                    <option key={index} value={marker.beat + 2}>
                      {marker.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Loop To:&nbsp;
                <select value={loopEnd || 0} onChange={handleLoopEndChange}>
                  <option value="0">None</option>
                  {markers.map((marker, index) => (
                    <option key={index} value={marker.beat + 2}>
                      {marker.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="volume-controls">
              <label>
                Song Volume:
                <input
                  type="range"
                  min="-20"
                  max="5"
                  step="1"
                  defaultValue="-6"
                  onChange={(e) => {
                    if (playerRef.current) {
                      playerRef.current.volume.value = parseInt(e.target.value);
                    }
                  }}
                />
              </label>
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
            <div className="settings">
              <label>
                Count-In:
                <input
                  type="number"
                  value={countIn}
                  onChange={(e) => setCountIn(parseInt(e.target.value, 10))}
                />
              </label>
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
                  value={timeSignature}
                  onChange={handleTimeSignatureChange}
                >
                  <option value="4/4">4/4</option>
                  <option value="3/4">3/4</option>
                  <option value="6/8">6/8</option>
                </select>
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
          </>
        )}
      </div>
    </div>
  );
};

export default App;
