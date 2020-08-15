import React, { useState } from "react";
import "./App.css";
import Camera from "./components/Camera";

function App() {
  const [image, setImage] = useState();
  return (
    <>
      <Camera
        onCapture={(blob) => setImage(blob)}
        onClear={() => setImage(undefined)}
      />
    </>
  );
}

export default App;

/* <img src={image && URL.createObjectURL(image)} /> */
