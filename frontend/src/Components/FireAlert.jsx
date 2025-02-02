import React from "react";

const FireAlert = ({ fire, index, onClick }) => (
  <div
    style={{
      backgroundColor: "red",
      color: "white",
      padding: "5px",
      margin: "5px",
      borderRadius: "5px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      height: "40px",
    }}
    onClick={onClick}
  >
    <span style={{ marginRight: "8px" }}>⚠️</span>
    New Fire Alert #{index + 1} ({fire.severity})
  </div>
);

export default FireAlert;
