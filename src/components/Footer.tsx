import React from "react";

const Footer: React.FC = () => {
  return (
    <div className="app-footer">
      <p>
        &copy; {new Date().getFullYear()}{" "}
        <a
          href="https://www.instagram.com/nxtrs.music"
          target="_blank"
          rel="noopener noreferrer"
        >
          nxtrs.music
        </a>
      </p>
    </div>
  );
};

export default Footer;
