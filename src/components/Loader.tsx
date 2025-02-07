import React from "react";
import "./Loader.css"; // Make sure to create this CSS file for styling

const Loader: React.FC = () => {
  return (
    <div className="loader">
      <div className="spinner"></div>
    </div>
  );
};

export default Loader;
