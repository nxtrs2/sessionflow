import * as Tone from "tone";
import { ChangeEvent } from "react";
import { SetAudioSrc, SetDuration, Instrument } from "../types";

export const loadMasterTrackFromJson = (
  file: string,
  setAudioSrc: SetAudioSrc,
  setDuration: SetDuration,
  playersRef: React.MutableRefObject<Tone.Players | null>
) => {
  const songUrl = file;
  setAudioSrc(songUrl);

  // Dispose of any previous players instance
  if (playersRef.current) {
    playersRef.current.dispose();
  }

  // Create a new Tone.Players with a single "master" track.
  const newPlayers = new Tone.Players({
    master: songUrl,
  }).toDestination();

  Tone.loaded().then(() => {
    const masterPlayer = newPlayers.player("master");
    if (masterPlayer.buffer) {
      setDuration(masterPlayer.buffer.duration);
    }
  });
  newPlayers.player("master").sync().start(0);
  playersRef.current = newPlayers;
};

export const loadTracksFromInstruments = (
  instruments: Instrument[],
  playersRef: React.MutableRefObject<Tone.Players | null>
) => {
  // if (playersRef.current) {
  //   playersRef.current.dispose();
  // }

  const newPlayers = new Tone.Players(
    instruments.reduce((acc, inst) => {
      if (inst.url) {
        acc[inst.name] = inst.url;
      }
      return acc;
    }, {} as Record<string, string>)
  ).toDestination();

  Tone.loaded().then(() => {
    instruments.forEach((inst) => {
      const player = newPlayers.player(inst.name);
      if (player.buffer) {
        player.sync().start(0);
      }
    });
  });
  playersRef.current = newPlayers;
};

export const handleMasterTrackFileChange = (
  e: ChangeEvent<HTMLInputElement>,
  setAudioSrc: SetAudioSrc,
  setDuration: SetDuration,
  playersRef: React.MutableRefObject<Tone.Players | null>
) => {
  const file = e.target.files && e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    setAudioSrc(url);

    // Dispose of any previous Tone.Players instance
    if (playersRef.current) {
      playersRef.current.dispose();
    }

    // Create a new Tone.Players with a single "master" track
    const newPlayers = new Tone.Players({ master: url }).toDestination();

    Tone.loaded().then(() => {
      const masterPlayer = newPlayers.player("master");
      if (masterPlayer.buffer) {
        setDuration(masterPlayer.buffer.duration);
      }
    });

    // Synchronize the master track and start it at time 0
    newPlayers.player("master").sync().start(0);
    playersRef.current = newPlayers;
    return true;
  }
};
