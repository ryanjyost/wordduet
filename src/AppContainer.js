import React from "react";
import App from "./App";

export default function AppContainer() {
  return (
    <div
      className="App"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: 50,
      }}
    >
      <App />
    </div>
  );
}
