import React from "react";
import "./Loader.css";

interface LoaderProps {
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ message = "Loading..." }) => {
  return (
    <div className="loader">
      <div className="loader-box">
        <div className="spinner"></div>
        <span className="loader-message">{message}</span>
      </div>
    </div>
  );
};

export default Loader;

// import React from "react";
// import "./Loader.css";

// const Loader: React.FC = () => {
//   return (
//     <div className="loader">
//       <div className="spinner"></div>
//     </div>
//   );
// };

// export default Loader;
