import * as Tone from "tone";
import { ChangeEvent } from "react";
import { SetAudioSrc, SetDuration, Instrument } from "../types";

// export const loadMasterTrackFromJson = (
//   file: string,
//   setAudioSrc: SetAudioSrc,
//   setDuration: SetDuration,
//   playersRef: React.MutableRefObject<Tone.Players | null>
// ) => {
//   const songUrl = file;
//   setAudioSrc(songUrl);
//   if (playersRef.current) {
//     playersRef.current.dispose();
//   }

//   if (!playersRef.current) {
//     playersRef.current = new Tone.Players().toDestination();
//   } else {
//     if (playersRef.current.has("master")) {
//       console.warn(
//         "Master track already exists. Overwriting is not implemented."
//       );
//       return;
//     }
//   }

//   playersRef.current.add("master", songUrl, () => {
//     const masterPlayer = playersRef.current!.player("master");
//     masterPlayer.volume.value = -20; // Set master volume
//     if (masterPlayer.buffer) {
//       setDuration(masterPlayer.buffer.duration);
//     }
//     masterPlayer.sync().start(0);
//   });
// };

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

  newPlayers.player("master").volume.value = -20;

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
  if (!playersRef.current) {
    console.error("No master track loaded.");
    return;
  }

  if (playersRef.current) {
    instruments.forEach((inst) => {
      if (inst.url && inst.filename) {
        const trackUrl = inst.url + inst.filename;
        // Only add if it hasn't been added yet.
        if (!playersRef.current?.has(inst.name)) {
          playersRef.current?.add(inst.name, trackUrl, () => {
            const player = playersRef.current!.player(inst.name);
            player.volume.value = inst.volume; // use the instrument volume
            player.sync().start(0);
          });
        }
      }
    });
  }
};

// export const loadTracksFromInstruments = (
//   instruments: Instrument[],
//   playersRef: React.MutableRefObject<Tone.Players | null>
// ) => {
//   // if (playersRef.current) {
//   //   playersRef.current.dispose();
//   // }

//   const newPlayers = new Tone.Players(
//     instruments.reduce((acc, inst) => {
//       if (inst.url && inst.filename) {
//         acc[inst.name] = inst.url + inst.filename;
//       }
//       return acc;
//     }, {} as Record<string, string>)
//   ).toDestination();

//   Tone.loaded().then(() => {
//     instruments.forEach((inst) => {
//       const player = newPlayers.player(inst.name);
//       // console.log("Player:", player.name);
//       // player.volume.value = inst.volume;
//       // player.mute = true;
//       //player.sync().start(0);
//       if (player.buffer) {
//         // player.sync().start(0);
//         playersRef.current?.add(inst.name, player.buffer);
//         player.sync().start(0);
//       }
//     });
//   });
// };

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
