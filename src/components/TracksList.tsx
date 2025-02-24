import React from "react";

interface TracksListProps {
  isPlaying: boolean;
  handleLoadSongJSON: (path: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const TracksList: React.FC<TracksListProps> = ({
  isPlaying,
  handleLoadSongJSON,
  onFileChange,
}) => {
  return (
    <div>
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
        Untitled2
      </button>
      <input
        type="file"
        accept="audio/*"
        onChange={onFileChange}
        style={{ display: "none" }}
        id="fileInput"
      />
      <button onClick={() => document.getElementById("fileInput")?.click()}>
        Load Audio File
      </button>
    </div>
  );
};

export default TracksList;
