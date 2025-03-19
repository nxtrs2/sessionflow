import React, { useState } from "react";
import * as Tone from "tone";
import { Instrument, CustomPlayer, SongData, EventData } from "../types";
import { Trash, Plus, X } from "lucide-react";
import VerticalSlider from "./VerticalSlider";
import AddInstrumentDialog from "./AddInstrumentDialog";
import { useSession } from "../hooks/useSession";
import { useProjects } from "../hooks/useProjects";
import { useInstruments } from "../hooks/useInstruments";
import useConfirm from "../hooks/useConfirm";

interface InstrumentsProps {
  masterMute: boolean;
  setMasterMute: React.Dispatch<React.SetStateAction<boolean>>;
  masterSolo: boolean;
  setMasterSolo: React.Dispatch<React.SetStateAction<boolean>>;
  setSongTimeLines: React.Dispatch<React.SetStateAction<EventData[]>>;
  playersRef: React.MutableRefObject<Tone.Players | null>;
  handleUpdateProjectSongData: () => void;
  handleLoadSongJSON: (data: SongData) => void;
}

const Instruments: React.FC<InstrumentsProps> = ({
  masterMute,
  setMasterMute,
  masterSolo,
  setSongTimeLines,
  setMasterSolo,
  playersRef,
  handleUpdateProjectSongData,
}) => {
  const { session } = useSession();
  const { setProjectNeedSave } = useProjects();
  const {
    instruments,
    selectedInstrument,
    setSelectedInstrument,
    updateInstrument,
    deleteInstrument,
  } = useInstruments();
  const { confirm, Prompt } = useConfirm();
  // const [selectedInstrument, setSelectedInstrument] =
  //   useState<Instrument | null>(null);
  const [showAddInstrument, setShowAddInstrument] = useState<boolean>(false);

  const handleUpdateInstrument = (updatedInstrument: Instrument) => {
    updateInstrument(updatedInstrument);
    setProjectNeedSave(true);
  };

  const handleDeleteInstrument = async () => {
    if (
      await confirm(
        `This will erase all events for "${selectedInstrument?.name}". Proceed? ?`
      )
    ) {
      const instrumentToDelete = instruments.find(
        (inst) => inst.name === selectedInstrument?.name
      );
      if (instrumentToDelete) {
        deleteInstrument(instrumentToDelete);
      }
      setSongTimeLines((prevTimeLines) =>
        prevTimeLines.filter(
          (line) => line.instrumentId !== selectedInstrument?.id
        )
      );
    }
  };

  return (
    <div className="settings">
      <Prompt />
      <h2>Instruments</h2>
      {showAddInstrument && (
        <AddInstrumentDialog
          user_id={session?.user.id}
          instCount={instruments.length}
          handleUpdateInstrument={handleUpdateInstrument}
          setShowAddInstrument={setShowAddInstrument}
          handleUpdateProjectSongData={handleUpdateProjectSongData}
        />
      )}
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
                    setMasterSolo(!masterSolo);
                    if (playersRef.current) {
                      if (masterSolo)
                        playersRef.current.player("master").mute = false;

                      instruments.forEach((inst) => {
                        if (playersRef.current) {
                          playersRef.current.player(inst.id.toString()).mute =
                            !masterSolo;
                        }
                      });
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
                {inst.filename && (
                  <VerticalSlider
                    min={-30}
                    max={0}
                    value={
                      playersRef.current?.has(inst.id.toString())
                        ? playersRef.current?.player(inst.id.toString()).volume
                            .value
                        : 0
                    }
                    onChange={(value) => {
                      if (playersRef.current) {
                        if (playersRef.current.has(inst.id.toString())) {
                          playersRef.current.player(
                            inst.id.toString()
                          ).volume.value = value;
                        }
                      }
                    }}
                    muted={
                      playersRef.current?.has(inst.id.toString())
                        ? playersRef.current?.player(inst.id.toString()).mute
                          ? true
                          : false
                        : false
                    }
                  />
                )}
                {!inst.filename && (
                  <div style={{ width: "100px", height: "150px" }}></div>
                )}
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
                      setSelectedInstrument(inst);
                    }}
                  >
                    {inst.name}
                  </div>
                  {!inst.filename && (
                    <div className="instrument-buttons">
                      <button
                        type="button"
                        onClick={() => {
                          document.getElementById("track-upload")?.click();
                        }}
                      >
                        Add Track
                      </button>
                    </div>
                  )}
                  {inst.filename && (
                    <div className="instrument-buttons">
                      <button
                        type="button"
                        style={{
                          color:
                            playersRef.current?.has(inst.id.toString()) &&
                            (
                              playersRef.current?.player(
                                inst.id.toString()
                              ) as CustomPlayer
                            ).solo
                              ? "limegreen"
                              : "gray",
                        }}
                        onClick={() => {
                          if (playersRef.current) {
                            const player = playersRef.current.player(
                              inst.id.toString()
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
                                  otherInst.id !== inst.id
                                ) {
                                  const otherPlayer = playersRef.current.player(
                                    otherInst.id.toString()
                                  ) as CustomPlayer;
                                  otherPlayer.mute = true;
                                  otherPlayer.solo = false;
                                }
                              });
                            } else {
                              // playersRef.current.player("master").mute = false;
                              setMasterSolo(false);
                              setMasterMute(false);

                              instruments.forEach((otherInst) => {
                                if (
                                  playersRef.current &&
                                  otherInst.name !== inst.name
                                ) {
                                  const otherPlayer = playersRef.current.player(
                                    otherInst.id.toString()
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
                            playersRef.current?.has(inst.id.toString()) &&
                            playersRef.current?.player(inst.id.toString())
                              .mute === false
                              ? "gray"
                              : "limegreen",
                        }}
                        onClick={() => {
                          if (playersRef.current) {
                            if (playersRef.current.has(inst.id.toString())) {
                              const player = playersRef.current.player(
                                inst.id.toString()
                              );
                              player.mute = !player.mute;
                            }
                          }
                        }}
                      >
                        M
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}{" "}
          <div className="instrument-master">
            <div style={{ width: "50px" }}>
              <button
                style={{
                  borderRadius: "50%",
                  padding: "10px",
                }}
                type="button"
                onClick={() => {
                  setShowAddInstrument(!showAddInstrument);
                  // document.getElementById("track-upload")?.click();
                }}
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
      {instruments.length > 0 && selectedInstrument && (
        <div className="settings-section">
          <div>
            <input
              type="text"
              value={selectedInstrument.name}
              onChange={(e) => {
                const newName = e.target.value;
                handleUpdateInstrument({
                  ...selectedInstrument,
                  name: newName,
                });
              }}
            />
          </div>
          <div>
            <label>Text: </label>
            <input
              type="color"
              value={selectedInstrument.color}
              onChange={(e) => {
                const newColor = e.target.value;
                handleUpdateInstrument({
                  ...selectedInstrument,
                  color: newColor,
                });
              }}
            />
          </div>
          <div>
            <label>Bg: </label>
            <input
              type="color"
              value={selectedInstrument.bgcolor}
              onChange={(e) => {
                const newColor = e.target.value;
                handleUpdateInstrument({
                  ...selectedInstrument,
                  bgcolor: newColor,
                });
              }}
            />
          </div>
          <div>
            <button
              style={{ border: "none" }}
              disabled={!selectedInstrument}
              type="button"
              onClick={() => {
                handleDeleteInstrument();
                setSelectedInstrument(null);
              }}
            >
              <Trash size={18} style={{ color: "red" }} />
            </button>
            <button
              style={{ border: "none" }}
              disabled={!selectedInstrument}
              type="button"
              onClick={() => {
                setSelectedInstrument(null);
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Instruments;
