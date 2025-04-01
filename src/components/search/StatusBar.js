import React, { useState, useEffect } from "react";
import "./StatusBar.css";

function StatusBar({ statusBarMessage }) {
  return (
    <div style={{ display: "flex", justifyContent: "center" }}>
      <div
        style={{
          textAlign: "center",
          padding: "0.6em",
          backgroundColor: "#f2e9e4",
          display: "inline-block",
        }}
      >
        {statusBarMessage}
      </div>
    </div>
  );
}

export default StatusBar;
