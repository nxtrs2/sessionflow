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

  // newPlayers.player("master").mute = true;

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
  loadingMsg: React.Dispatch<React.SetStateAction<string>>,
  user_id: string | undefined,
  projectId: string | undefined
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
        const trackUrl =
          user_id && projectId
            ? projectsURL +
              "/" +
              user_id +
              "/" +
              projectId +
              "/" +
              inst.filename
            : projectsURL + inst.url + inst.filename;
        if (!playersRef.current?.has(inst.id.toString())) {
          // console.log("Adding player:", inst.id, trackUrl);
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

export const loadInstrumentFromLocalFile = (
  file: File,
  trackId: string,
  playersRef: React.MutableRefObject<Tone.Players | null>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  loadingMsg: React.Dispatch<React.SetStateAction<string>>
) => {
  if (!playersRef.current) {
    console.error("No master track loaded.");
    return;
  }

  setLoading(true);
  loadingMsg("Loading local track");

  // Create an object URL for the selected file
  const fileUrl = URL.createObjectURL(file);

  // Add the track if it hasn't been added already
  if (!playersRef.current.has(trackId)) {
    playersRef.current.add(trackId, fileUrl, () => {
      const player = playersRef.current!.player(trackId) as CustomPlayer;
      // Optionally adjust volume or other settings as needed
      player.volume.value = 0; // default or preset volume
      player.solo = false;
      // Sync with Tone.js Transport and schedule to start at time 0
      player.sync().start(0);
    });
  }

  // Once all players are loaded, update the loading state
  Tone.loaded().then(() => {
    setLoading(false);
    loadingMsg("");
    // Optionally, you can revoke the object URL here if it's no longer needed:
    // URL.revokeObjectURL(fileUrl);
  });
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

export async function uploadMP3File(
  file: File,
  projectId: string
): Promise<UploadResponse> {
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
      .substring(2)}.${fileExt}`;
    const filePath: string = fileName;

    // Upload the file to the "project_files" bucket.
    const { data, error } = await supabase.storage
      .from("project_files")
      .upload(session.user.id + "/" + projectId + "/" + filePath, file);

    if (error) {
      throw error;
    }
    // console.log("File uploaded:", data, fileName);
    return { success: true, filename: fileName, url: data.id };
  } catch (error) {
    console.error("Error uploading file:", error);
    return { success: false, error: "Error uploading file." };
  }
}

export async function uploadCoverArt(
  file: File,
  projectId: string
): Promise<UploadResponse> {
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
      .upload(session.user.id + "/" + projectId + "/" + filePath, file);

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
