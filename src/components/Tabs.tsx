import React from "react";

interface TabsProps {
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const Tabs: React.FC<TabsProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="tab-links">
      <button
        onClick={() => setActiveTab("track")}
        style={{ color: activeTab === "track" ? "yellow" : "lightgray" }}
      >
        Playback
      </button>
      <button
        onClick={() => setActiveTab("settings")}
        style={{ color: activeTab === "settings" ? "yellow" : "lightgray" }}
      >
        Settings
      </button>
      <button
        onClick={() => setActiveTab("notes")}
        style={{ color: activeTab === "notes" ? "yellow" : "lightgray" }}
      >
        Notes
      </button>

      <button
        onClick={() => setActiveTab("tracks")}
        style={{ color: activeTab === "tracks" ? "yellow" : "lightgray" }}
      >
        Tracks
      </button>
      {/* <button
                onClick={() => setActiveTab('events')}
                style={{ color: activeTab === 'events' ? 'yellow' : 'lightgray' }}
            >
                Events
            </button> */}
    </div>
  );
};

export default Tabs;
