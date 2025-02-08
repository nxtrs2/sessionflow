import React, { useState, useRef, useEffect, ChangeEvent } from "react";
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
import CountIn from "./components/CountIn";
import CountOut from "./components/CountOut";
import { renderTick2 } from "./components/TimeLineRenderer";
import {
  SongData,
  TimeLineData,
  MarkerData,
  BeatData,
  TickData,
  TimeSignature,
  Structure,
} from "./types";
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
  const [songTimeLines, setSongTimeLines] = useState<TimeLineData[]>([]);
  const [selectedInstrument, setSelectedInstrument] = useState<string>("ALL");

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

  // useEffect(() => {
  //   if (timeSignatureString && timeSignatureString.length > 0) {
  //     setTimeSignature({
  //       numerator: parseInt(timeSignatureString?.split("/")[0], 10),
  //       denominator: parseInt(timeSignatureString?.split("/")[1], 10),
  //     });
  //   }
  //   console.log("Time Signature changed", timeSignature, timeSignatureString);
  // }, [timeSignatureString]);

  // useEffect(() => {
  //   // console.log("Updated Time SSS Signature", songData?.track.timeSignature);
  // }, [songData?.track.timeSignature]);

  // {
  //   "fromBeat": 8,
  //   "toBeat": 32,
  //   "numerator": 3,
  //   "denominator": 4,
  //   "tempo": 130
  // },
  // {
  //   "fromBeat": 32,
  //   "toBeat": 64,
  //   "numerator": 4,
  //   "denominator": 4,
  //   "tempo": 144
  // }

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
    }
  }, [songData]);

  useEffect(() => {
    if (duration && tempo && timeSignature) {
      // console.log("Time Signature changed ----> -----?", timeSignature);
      const newBeatData = generateBeatData(
        duration,
        tempo,
        timeSignature,
        skipBeats,
        structure,
        songTimeLines
      );
      setLoopEnd(duration);
      setBeatData(newBeatData);
    }
  }, [duration, tempo, timeSignature]);

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
                    selectedInstrument
                    // renderTick(tick, index)
                  )
                )}
              {!fileLoaded && <h3>To load a song, select from above</h3>}
            </div>
            <div
              className={`center-indicator ${pulse ? "pulse" : ""}`}
              style={{ top: containerCenter }}
            />
            <div className="timeline-footer">
              <button onClick={() => setSelectedInstrument("ALL")}>ALL</button>
              {songTimeLines.length > 0 &&
                Array.from(
                  new Set(songTimeLines.map((line) => line.instrument))
                ).map((instrument, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      console.log(selectedInstrument);
                      setSelectedInstrument(instrument);
                    }}
                  >
                    {instrument}
                  </button>
                ))}{" "}
            </div>
          </div>
        </div>

        {/* Main content: controls and settings */}
        <div className="main-content">
          {fileLoaded && (
            <div className="file-info">
              <h2>{title ? title : "Track Title"}</h2>

              <div className="file-loader">
                <input type="file" accept="audio/*" onChange={onFileChange} />
              </div>
            </div>
          )}
          {audioSrc && (
            <>
              <div className="transport-system">
                <div className="transport-controls">
                  <button
                    onClick={() => {
                      setIsPlaying(!isPlaying);

                      if (loop) {
                        console.log("Looping");
                        togglePlayPauseWithLoop(
                          isPlaying,
                          beatData[loopStart].time,
                          beatData[loopEnd].time,
                          timeSignature,
                          skipBeats,
                          setIsPlaying
                        );
                      } else {
                        console.log("Not Looping");
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
                  <select value={loopEnd || 0} onChange={handleLoopEndChange}>
                    {markers.map((marker, index) => (
                      <option key={index} value={marker.beat}>
                        {marker.label}
                      </option>
                    ))}
                    <option value={duration}>End</option>
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
                        playerRef.current.volume.value = parseInt(
                          e.target.value
                        );
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
                    value={timeSignatureString}
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
    </div>
  );
};

export default App;
