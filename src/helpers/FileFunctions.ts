import * as Tone from "tone";
import { ChangeEvent } from "react";
import { SetAudioSrc, SetDuration, SetSongHasEnded } from "../types";

export const loadSongFromJson = (
  file: string,
  setAudioSrc: SetAudioSrc,
  setDuration: SetDuration,
  SetSongHasEnded: SetSongHasEnded,
  playerRef: React.MutableRefObject<Tone.Player | undefined>
) => {
  const songUrl = file;
  setAudioSrc(songUrl);

  // Dispose of any previous player instance
  if (playerRef.current) {
    playerRef.current.dispose();
  }
  //   console.log("Loading song from JSON", songUrl);

  // Create a new Tone.Player with the constructed URL
  const newPlayer = new Tone.Player({
    url: songUrl,
    autostart: false,
    onload: () => {
      if (newPlayer.buffer) {
        setDuration(newPlayer.buffer.duration);
      }
    },
  }).toDestination();

  //   newPlayer.buffer.on = (event) => {
  //     const progress = event.loaded / event.total;
  //     console.log(`Player loading progress: ${(progress * 100).toFixed(2)}%`);
  // };

  //   newPlayer.onstop = () => {
  //     SetSongHasEnded();
  //   };
  // Synchronize the player with Tone.Transport and start it at time 0
  newPlayer.sync().start(0);
  playerRef.current = newPlayer;
};

export const handleFileChange = (
  e: ChangeEvent<HTMLInputElement>,
  setAudioSrc: SetAudioSrc,
  setDuration: SetDuration,
  playerRef: React.MutableRefObject<Tone.Player | undefined>
) => {
  const file = e.target.files && e.target.files[0];
  if (file) {
    const url = URL.createObjectURL(file);
    setAudioSrc(url);

    // Dispose of any previous player instance
    if (playerRef.current) {
      playerRef.current.dispose();
    }

    // Create a new Tone.Player with the selected file URL
    const newPlayer = new Tone.Player({
      url,
      autostart: false,
      onload: () => {
        if (newPlayer.buffer) {
          setDuration(newPlayer.buffer.duration);
        }
      },
    }).toDestination();

    // Synchronize the player with Tone.Transport and start it at time 0
    newPlayer.sync().start(0);
    playerRef.current = newPlayer;
  }
};
