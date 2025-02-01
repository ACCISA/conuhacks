import React from "react";

const getStatusLabel = (available, total) => {
  if (available === 0) return { text: "Unavailable", color: "red" };
  const usageRate = available / total;
  if (usageRate <= 0.3) return { text: "High Usage", color: "orange" };
  if (usageRate > 0.3 && usageRate < 1) return { text: "Moderate Usage", color: "yellow" };
  if (usageRate === 1) return { text: "Ready", color: "green" };
};

const ResourceCard = ({ resource }) => {
  const status = getStatusLabel(resource.total - resource.inUse, resource.total);

  return (
    <div
      style={{
        backgroundColor: "#333",
        color: "white",
        padding: "10px",
        marginBottom: "5px",
        borderRadius: "5px",
        width: "400px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        height: "40px",
      }}
    >
      <strong>{resource.name}</strong>
      <div style={{ display: "flex", gap: "10px" }}>
        <span>Total: {resource.total}</span>
        <span>In Use: {resource.inUse}</span>
      </div>
      <span style={{ color: status.color, fontWeight: "bold" }}>
        {status.text}
      </span>
    </div>
  );
};

export default ResourceCard;
