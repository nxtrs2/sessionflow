import * as Tone from "tone";
import { ChangeEvent } from "react";
import { SetAudioSrc, SetDuration } from "../types";

// export const loadMasterTrackFromJson = (
//   file: string,
//   setAudioSrc: SetAudioSrc,
//   setDuration: SetDuration,
//   playersRef: React.MutableRefObject<Tone.Players | undefined>
// ) => {
//   const songUrl = file;
//   setAudioSrc(songUrl);

//   // Dispose of any previous player instance
//   if (playerRef.current) {
//     playerRef.current.dispose();
//   }
//   //   console.log("Loading song from JSON", songUrl);

//   // Create a new Tone.Player with the constructed URL
//   const newPlayer = new Tone.Player({
//     url: songUrl,
//     autostart: false,
//     onload: () => {
//       if (newPlayer.buffer) {
//         setDuration(newPlayer.buffer.duration);
//       }
//     },
//   }).toDestination();

//   newPlayer.sync().start(0);
//   playerRef.current = newPlayer;
// };

export const loadMasterTrackFromJson = (
  file: string,
  setAudioSrc: SetAudioSrc,
  setDuration: SetDuration,
  playersRef: React.MutableRefObject<Tone.Players | undefined>
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

export const handleMasterTrackFileChange = (
  e: ChangeEvent<HTMLInputElement>,
  setAudioSrc: SetAudioSrc,
  setDuration: SetDuration,
  playersRef: React.MutableRefObject<Tone.Players | undefined>
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
    const newPlayers = new Tone.Players({ master: url }, () => {
      // Once the master track is loaded, update the duration
      const masterPlayer = newPlayers.player("master");
      if (masterPlayer.buffer) {
        setDuration(masterPlayer.buffer.duration);
      }
    }).toDestination();

    // Synchronize the master track and start it at time 0
    newPlayers.player("master").sync().start(0);
    playersRef.current = newPlayers;
    return true;
  }
};

// export const handleMasterTrackFileChange = (
//   e: ChangeEvent<HTMLInputElement>,
//   setAudioSrc: SetAudioSrc,
//   setDuration: SetDuration,
//   playerRef: React.MutableRefObject<Tone.Player | undefined>
// ) => {
//   const file = e.target.files && e.target.files[0];
//   if (file) {
//     const url = URL.createObjectURL(file);
//     setAudioSrc(url);

//     // Dispose of any previous player instance
//     if (playerRef.current) {
//       playerRef.current.dispose();
//     }

//     // Create a new Tone.Player with the selected file URL
//     const newPlayer = new Tone.Player({
//       url,
//       autostart: false,
//       onload: () => {
//         if (newPlayer.buffer) {
//           setDuration(newPlayer.buffer.duration);
//         }
//       },
//     }).toDestination();

//     // Synchronize the player with Tone.Transport and start it at time 0
//     newPlayer.sync().start(0);
//     playerRef.current = newPlayer;
//     return true;
//   }
// };
