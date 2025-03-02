import React, { useState } from "react";
import * as Tone from "tone";
import { Instrument, CustomPlayer } from "../types";
import { Trash, Save, Music } from "lucide-react";
import VerticalSlider from "./VerticalSlider";

interface InstrumentsProps {
  masterMute: boolean;
  setMasterMute: React.Dispatch<React.SetStateAction<boolean>>;
  masterSolo: boolean;
  setMasterSolo: React.Dispatch<React.SetStateAction<boolean>>;
  instruments: Instrument[];
  handleInstrumentsUpdate: (
    instrument: Instrument,
    deleteInstrument: boolean
  ) => void;
  playersRef: React.MutableRefObject<Tone.Players | null>;
}

const Instruments: React.FC<InstrumentsProps> = ({
  masterMute,
  setMasterMute,
  masterSolo,
  setMasterSolo,
  instruments,
  handleInstrumentsUpdate,
  playersRef,
}) => {
  // Set initial form values (for new or edit modes)
  const [instrument, setInstrument] = useState<string>("");
  const [instId, setInstId] = useState<number | null>(null);
  const [newColor, setNewColor] = useState<string>("#000000");
  const [newBgColor, setNewBgColor] = useState<string>("#FFFFFF");
  const [color, setColor] = useState<string>(
    instruments.length > 0 ? instruments[0].color || "#000000" : "#000000"
  );
  const [bgcolor, setBgColor] = useState<string>(
    instruments.length > 0 ? instruments[0].bgcolor || "#FFFFFF" : "#FFFFFF"
  );

  const handleSetInstrument = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedInstrument = instruments.find(
      (inst) => inst.name === e.target.value
    );
    if (selectedInstrument) {
      setInstrument(selectedInstrument.name);
      setInstId(selectedInstrument.id);
      setColor(selectedInstrument.color);
      setBgColor(selectedInstrument.bgcolor);
    }
  };

  const handleUpdateInstrument = (newInstrument: Instrument) => {
    handleInstrumentsUpdate(newInstrument, false);
    setInstrument(newInstrument.name);
    setColor(newInstrument.color);
    setBgColor(newInstrument.bgcolor);
  };

  const handleAddNewInstrument = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const newInstrument = e.currentTarget.value.trim();
      if (newInstrument !== "") {
        const newInst: Instrument = {
          id: instruments.length,
          name: newInstrument,
          color: newColor || "#000000",
          bgcolor: newBgColor || "#FFFFFF",
          volume: 0,
          pan: 0,
          mute: false,
          solo: false,
        };
        handleInstrumentsUpdate(newInst, false);
        setInstrument(newInstrument);
        setColor(newColor);
        setBgColor(newBgColor);
        e.currentTarget.value = "";
      }
    }
  };

  const handleDeleteInstrument = () => {
    if (
      window.confirm(
        `This will erase all events for this instrument. \n"Are you sure you want to delete the instrument "${instrument}"?`
      )
    ) {
      const instrumentToDelete = instruments.find(
        (inst) => inst.name === instrument
      );
      if (instrumentToDelete) {
        handleInstrumentsUpdate(instrumentToDelete, true);
      }
    }
  };

  return (
    <div className="settings">
      <h2>Instruments</h2>
      <form>
        <div className="settings-section">
          <div>
            <input
              type="text"
              placeholder="Add new instrument"
              onKeyDown={(e) => {
                handleAddNewInstrument(e);
              }}
            />
          </div>
          <div>
            <label>Text: </label>
            <input
              type="color"
              value={newColor}
              onChange={(e) => {
                const newColor = e.target.value;
                setNewColor(newColor);
              }}
            />
          </div>
          <div>
            <label>Bg: </label>
            <input
              type="color"
              value={newBgColor}
              onChange={(e) => {
                const newColor = e.target.value;
                setNewBgColor(newColor);
              }}
            />
          </div>

          <div>
            <input
              type="file"
              accept=".mp3"
              style={{ display: "none" }}
              id="track-upload"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  // Handle file upload logic here
                  console.log(file);
                }
              }}
            />
            <button
              type="button"
              onClick={() => {
                document.getElementById("track-upload")?.click();
              }}
            >
              <Music size={20} />
            </button>
            <button type="submit">
              <Save size={20} />
            </button>
          </div>
        </div>
      </form>
      {playersRef.current && playersRef.current.player("master") && (
        <div className="instrument-list">
          <div className="instrument-master">
            <VerticalSlider
              min={-30}
              max={0}
              value={playersRef.current?.player("master").volume.value}
              onChange={(value) => {
                if (playersRef.current) {
                  playersRef.current.player("master").volume.value = value;
                }
              }}
              muted={masterMute}
            />
            <div className="instrument-details">
              <div
                style={{
                  fontFamily: "Roboto",
                  textAlign: "center",
                  fontWeight: "bold",
                  fontSize: "0.8em",
                  margin: "0",
                }}
              >
                MASTER
              </div>

              <div className="instrument-buttons">
                <button
                  type="button"
                  style={{
                    color: masterSolo ? "limegreen" : "gray",
                  }}
                  onClick={() => {
                    if (playersRef.current) {
                      if (masterSolo)
                        playersRef.current.player("master").mute = false;

                      instruments.forEach((inst) => {
                        if (playersRef.current) {
                          playersRef.current.player(inst.name).mute =
                            masterSolo;
                        }
                      });
                      setMasterSolo(!masterSolo);
                    }
                  }}
                >
                  S
                </button>
                <button
                  type="button"
                  style={{
                    color:
                      playersRef.current?.player("master").mute === false
                        ? "gray"
                        : "limegreen",
                  }}
                  onClick={() => {
                    setMasterMute(!masterMute);
                    // Handle mute functionality here
                    if (playersRef.current) {
                      playersRef.current.player("master").mute = !masterMute;
                    }
                  }}
                >
                  M
                </button>
              </div>
            </div>
          </div>
          {instruments.length > 0 &&
            instruments.map((inst, idx) => (
              <div className="instrument" key={idx}>
                <VerticalSlider
                  min={-30}
                  max={0}
                  value={
                    playersRef.current?.has(inst.name)
                      ? playersRef.current?.player(inst.name).volume.value
                      : 0
                  }
                  onChange={(value) => {
                    if (playersRef.current) {
                      if (playersRef.current.has(inst.name)) {
                        playersRef.current.player(inst.name).volume.value =
                          value;
                      }
                    }
                  }}
                  muted={
                    playersRef.current?.has(inst.name)
                      ? playersRef.current?.player(inst.name).mute
                      : false
                  }
                />
                <div className="instrument-details">
                  <div
                    style={{
                      fontFamily: "Roboto",
                      textAlign: "center",
                      fontWeight: "bold",
                      fontSize: "0.8em",
                      margin: "0",
                      color: inst.color,
                      paddingLeft: "0.5em",
                      paddingRight: "0.5em",
                      backgroundColor: inst.bgcolor,
                      cursor: "pointer",
                    }}
                    onClick={() => {
                      setInstrument(inst.name);
                      setInstId(inst.id);
                      setColor(inst.color);
                      setBgColor(inst.bgcolor);
                    }}
                  >
                    {inst.name}
                  </div>
                  <div className="instrument-buttons">
                    <button
                      type="button"
                      style={{
                        color:
                          playersRef.current?.has(inst.name) &&
                          (
                            playersRef.current?.player(
                              inst.name
                            ) as CustomPlayer
                          ).solo
                            ? "limegreen"
                            : "gray",
                      }}
                      onClick={() => {
                        if (playersRef.current) {
                          const player = playersRef.current.player(
                            inst.name
                          ) as CustomPlayer;
                          player.solo = !player.solo;
                          player.mute = false;
                          if (player.solo) {
                            playersRef.current.player("master").mute = true;
                            setMasterSolo(false);
                            setMasterMute(true);

                            instruments.forEach((otherInst) => {
                              if (
                                playersRef.current &&
                                otherInst.name !== inst.name
                              ) {
                                const otherPlayer = playersRef.current.player(
                                  otherInst.name
                                ) as CustomPlayer;
                                otherPlayer.mute = true;
                                otherPlayer.solo = false;
                              }
                            });
                          } else {
                            playersRef.current.player("master").mute = false;
                            setMasterSolo(false);
                            setMasterMute(false);

                            instruments.forEach((otherInst) => {
                              if (
                                playersRef.current &&
                                otherInst.name !== inst.name
                              ) {
                                const otherPlayer = playersRef.current.player(
                                  otherInst.name
                                ) as CustomPlayer;
                                otherPlayer.mute = false;
                                otherPlayer.solo = false;
                              }
                            });
                          }
                        }
                      }}
                    >
                      S
                    </button>
                    <button
                      type="button"
                      style={{
                        color:
                          playersRef.current?.has(inst.name) &&
                          playersRef.current?.player(inst.name).mute === false
                            ? "gray"
                            : "limegreen",
                      }}
                      onClick={() => {
                        if (playersRef.current) {
                          if (playersRef.current.has(inst.name)) {
                            const player = playersRef.current.player(inst.name);
                            player.mute = !player.mute;
                          }
                        }
                      }}
                    >
                      M
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
      {instruments.length > 0 && (
        <div className="settings-section">
          <label>
            Instrument:
            <select value={instrument} onChange={(e) => handleSetInstrument(e)}>
              {instruments.map((inst, idx) => (
                <option key={idx} value={inst.name}>
                  {inst.name}
                </option>
              ))}
            </select>
          </label>
          <div>
            <input
              type="text"
              value={instrument}
              onChange={(e) => {
                const newName = e.target.value;
                setInstrument(newName);
                handleUpdateInstrument({
                  id: instId || 0,
                  name: newName,
                  color,
                  bgcolor,
                  volume: 0,
                  pan: 0,
                  mute: false,
                  solo: false,
                });
              }}
            />
          </div>
          <div>
            <button
              style={{ border: "none" }}
              disabled={instrument === ""}
              type="button"
              onClick={() => {
                handleDeleteInstrument();
              }}
            >
              <Trash size={18} style={{ color: "orange" }} />
            </button>
          </div>
          <div>
            <label>Text: </label>
            <input
              type="color"
              value={color}
              onChange={(e) => {
                const newColor = e.target.value;
                handleUpdateInstrument({
                  id: instId || 0,
                  name: instrument,
                  color: newColor,
                  bgcolor,
                  volume: 0,
                  pan: 0,
                  mute: false,
                  solo: false,
                });
              }}
            />
          </div>
          <div>
            <label>Bg: </label>
            <input
              type="color"
              value={bgcolor}
              onChange={(e) => {
                const newColor = e.target.value;
                handleUpdateInstrument({
                  id: instId || 0,
                  name: instrument,
                  color,
                  bgcolor: newColor,
                  volume: 0,
                  pan: 0,
                  mute: false,
                  solo: false,
                });
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Instruments;
