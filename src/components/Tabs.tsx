import React from "react";

interface TabsProps {
  fileLoaded: boolean;
  activeTab: string;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
}

const Tabs: React.FC<TabsProps> = ({ fileLoaded, activeTab, setActiveTab }) => {
  return (
    <div className="tab-links">
      <button
        onClick={() => setActiveTab("projects")}
        style={{ color: activeTab === "projects" ? "yellow" : "lightgray" }}
      >
        Projects
      </button>
      <button
        disabled={!fileLoaded}
        onClick={() => setActiveTab("playback")}
        style={{
          color: fileLoaded
            ? activeTab === "playback"
              ? "yellow"
              : "lightgray"
            : "gray",
        }}
      >
        Playback
      </button>
      <button
        disabled={!fileLoaded}
        onClick={() => setActiveTab("instruments")}
        style={{
          color: fileLoaded
            ? activeTab === "instruments"
              ? "yellow"
              : "lightgray"
            : "gray",
        }}
      >
        Instruments
      </button>
      <button
        disabled={!fileLoaded}
        onClick={() => setActiveTab("settings")}
        style={{
          color: fileLoaded
            ? activeTab === "settings"
              ? "yellow"
              : "lightgray"
            : "gray",
        }}
      >
        Settings
      </button>
      {/* <button
        disabled={!fileLoaded}
        onClick={() => setActiveTab("notes")}
        style={{
          color: fileLoaded
            ? activeTab === "notes"
              ? "yellow"
              : "lightgray"
            : "gray",
        }}
      >
        Notes
      </button> */}

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
