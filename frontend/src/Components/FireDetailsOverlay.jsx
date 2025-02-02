import React from "react";
import { OverlayView } from "@react-google-maps/api";

const FireDetailsOverlay = ({ fire, onClose, centroid }) => (
  <OverlayView position={centroid} mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}>
    <div
      style={{
        backgroundColor: "red",
        padding: "5px",
        borderRadius: "8px",
        boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
        minWidth: "180px",
        maxWidth: "220px",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "red",
          padding: "5px",
          borderRadius: "5px",
        }}
      >
        <strong style={{ color: "white" }}>Fire Details</strong>
        <button
          style={{
            background: "transparent",
            color: "white",
            border: "none",
            fontWeight: "bold",
            cursor: "pointer",
          }}
          onClick={onClose}
        >
          X
        </button>
      </div>
      <div style={{ padding: "5px" }}>
        <p>Location: {fire.location}</p>
        <p>Severity: {fire.severity}</p>
      </div>
    </div>
  </OverlayView>
);

export default FireDetailsOverlay;
