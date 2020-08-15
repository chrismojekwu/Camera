import React, { useState, useEffect, useRef, useCallback } from "react";

function useUserMedia(media) {
  const width = 320;
  const [height, setHeight] = useState(0);
  const [streaming, setStreaming] = useState(false);

  const [video, setVideo] = useState(null);

  const [canvas, setCanvas] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [start, setStart] = useState(null);

  useEffect(() => {
    async function enableStream() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(media);
        setVideo(stream);
      } catch (err) {
        //huh?
      }
    }

    if (!video) {
      enableStream();
    } else {
      return function cleanup() {
        video.getTracks().forEach((track) => {
          track.stop();
        });
      };
    }
  }, [video, media]);

  return video;
}

function useOffsets(vWidth, vHeight, cWidth, cHeight) {
  const [offsets, setOffsets] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (vWidth && vHeight && cWidth && cHeight) {
      const x = vWidth > cWidth ? Math.round((vWidth - cWidth) / 2) : 0;

      const y = vHeight > cHeight ? Math.round((vHeight - cHeight) / 2) : 0;

      setOffsets({ x, y });
    }
  }, [vWidth, vHeight, cWidth, cHeight]);

  return offsets;
}

function useCardRatio(params) {
  const [aspectRatio, setAspectRatio] = useState(params);

  const calculateRatio = useCallback((height, width) => {
    if (height && width) {
      const isLandscape = height <= width;
      const ratio = isLandscape ? width / height : height / width;

      setAspectRatio(ratio);
    }
  }, []);

  return [aspectRatio, calculateRatio];
}

function Camera({ onCapture, onClear }) {
  const CAPTURE_OPTIONS = {
    audio: false,
    video: { facingMode: "environment" },
  };

  const videoRef = useRef();
  const canvasRef = useRef();
  const mediaStream = useUserMedia(CAPTURE_OPTIONS);
  const [container, setContainer] = useState({
    height: 480,
    width: 640,
  });
  const [aspectRatio, calculateRatio] = useCardRatio(1.586);
  const [isCanvasEmpty, setIsCanvasEmpty] = useState(true);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [mirror, setMirror] = useState("none");
  const offsets = useOffsets(
    videoRef.current && videoRef.current.videoWidth,
    videoRef.current && videoRef.current.videoHeight,
    container.width,
    container.height
  );

  if (mediaStream && videoRef.current && !videoRef.current.srcObject) {
    videoRef.current.srcObject = mediaStream;
  }

  function canPlay() {
    // calculateRatio(videoRef.current.videoHeight, videoRef.current.videoWidth);
    // setIsVideoPlaying(false);
    videoRef.current.play();
  }

  function handleCapture() {
    const context = canvasRef.current.getContext("2d");

    context.drawImage(
      videoRef.current,
      offsets.x,
      offsets.y,
      container.width,
      container.height,
      0,
      0,
      container.width,
      container.height
    );

    canvasRef.current.toBlob(
      (blob) => {
        console.log(blob);
        onCapture(blob);
      },
      "image/jpeg",
      1
    );
    setIsCanvasEmpty(false);
  }

  function handleClear() {
    window.location.reload();
    /*const context = canvasRef.current.getContext("2d");
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    setIsCanvasEmpty(true);
    onClear();*/
  }

  function handleMirror() {
    console.log("click");
    if (mirror == "none") {
      setMirror("scaleX(-1)");
    } else {
      setMirror("none");
    }
  }

  return (
    <div className="cameraAndBtns">
      <div className="camera">
        <video
          ref={videoRef}
          id="video"
          onCanPlay={canPlay}
          style={{
            top: `-${offsets.y}px`,
            left: `-${offsets.x}px`,
            tranform: mirror,
          }}
          autoPlay
          playsInline
          muted
        />

        <button onClick={() => handleMirror()}>Mirror</button>

        <button
          onClick={isCanvasEmpty ? handleCapture : handleClear}
          id="startbutton"
        >
          {isCanvasEmpty ? "Click" : "Refresh"}
        </button>

        <canvas
          ref={canvasRef}
          width={container.width}
          height={container.height}
          className="photo-render"
        />
      </div>
    </div>
  );
}

export default Camera;
