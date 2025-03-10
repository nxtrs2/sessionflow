import React, { ChangeEvent } from "react";
import * as Tone from "tone";
import { supabase } from "../supabase/supabaseClient";

import {
  SetAudioSrc,
  SetDuration,
  Instrument,
  CustomPlayer,
  projectsURL,
  UploadResponse,
} from "../types";

export const convertTitleToFilename = (title: string): string => {
  return title.replace(/[^a-zA-Z0-9]/g, "_").toLowerCase();
};

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

  newPlayers.player("master").mute = true;

  Tone.loaded().then(() => {
    const masterPlayer = newPlayers.player("master") as CustomPlayer;
    masterPlayer.solo = false;
    if (masterPlayer.buffer) {
      setDuration(masterPlayer.buffer.duration);
    }
  });
  newPlayers.player("master").sync().start(0);
  playersRef.current = newPlayers;
};

export const loadTracksFromInstruments = (
  instruments: Instrument[],
  playersRef: React.MutableRefObject<Tone.Players | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loadingMsg: React.Dispatch<React.SetStateAction<string>>
) => {
  if (!playersRef.current) {
    console.error("No master track loaded.");
    return;
  }

  setLoading(true);
  loadingMsg("Loading instruments");
  if (playersRef.current) {
    instruments.forEach((inst) => {
      if (inst.url && inst.filename) {
        const trackUrl = projectsURL + inst.url + inst.filename;
        if (!playersRef.current?.has(inst.id.toString())) {
          playersRef.current?.add(inst.id.toString(), trackUrl, () => {
            const player = playersRef.current!.player(
              inst.id.toString()
            ) as CustomPlayer;
            player.volume.value = inst.volume;
            player.solo = false;
            player.sync().start(0);
          });
        }
      }
    });
  }
  Tone.loaded().then(() => {
    setLoading(false);
    loadingMsg("");
  });
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

export async function uploadMP3File(
  file: File,
  projectTitle: string
): Promise<UploadResponse> {
  // const file = e.target.files && e.target.files[0];
  const sanitisedProjectTitle = convertTitleToFilename(projectTitle);

  try {
    if (!file) {
      throw new Error("No file provided.");
    }
    if (file.type !== "audio/mpeg") {
      throw new Error("Only MP3 files are allowed.");
    }

    // Ensure the user is authenticated by checking the current session.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User is not authenticated.");
    }

    // Generate a unique file name.
    const fileExt: string = file.name.split(".").pop()!;
    const fileName: string = `${Math.random()
      .toString(36)
      .substr(2)}.${fileExt}`;
    const filePath: string = fileName;

    // Upload the file to the "project_files" bucket.
    const { data, error } = await supabase.storage
      .from("project_files")
      .upload(
        session.user.id + "/" + sanitisedProjectTitle + "/" + filePath,
        file
      );

    if (error) {
      throw error;
    }
    // console.log("File uploaded:", data);
    return { success: true, filename: fileName, url: data.id };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, error: "Error uploading file." };
  }
}

export async function deleteMP3File(url: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from("project_files")
      .remove([url]);
    if (error) {
      throw error;
    }
    return true;
  } catch (error) {
    console.error("Error deleting file:", error);
    return false;
  }
}

export async function uploadCoverArt(
  file: File,
  projectTitle: string
): Promise<UploadResponse> {
  const sanitisedProjectTitle = convertTitleToFilename(projectTitle);

  try {
    if (!file) {
      throw new Error("No file provided.");
    }
    if (!file.type.startsWith("image/")) {
      throw new Error("Only image files are allowed.");
    }

    // Ensure the user is authenticated by checking the current session.
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User is not authenticated.");
    }

    // Generate a unique file name.
    const fileExt: string = file.name.split(".").pop()!;
    const fileName: string = `${Math.random()
      .toString(36)
      .substring(2)}.${fileExt}`;
    const filePath: string = fileName;

    // Upload the file to the "project_files" bucket.
    const { data, error } = await supabase.storage
      .from("project_files")
      .upload(
        session.user.id + "/" + sanitisedProjectTitle + "/" + filePath,
        file
      );

    if (error) {
      throw error;
    }
    // console.log("File uploaded:", data);
    return { success: true, filename: fileName, url: data.id };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, error: "Error uploading file." };
  }
}
