import React, { useEffect } from 'react';
import './App.css';
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import "@tensorflow/tfjs";

const App = () => {
  const videoRef = React.createRef();
  const canvasRef = React.createRef();


useEffect(() => {
  const detectFrame = (video, model) => {
    model.detect(video).then(predictions => {
      renderPredictions(predictions);
      requestAnimationFrame(() => {
        detectFrame(video, model);
      });
    });
  };
  const renderPredictions = predictions => {
    const ctx = canvasRef.current.getContext("2d");
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // Font options.
    const font = "16px sans-serif";
    ctx.font = font;
    ctx.textBaseline = "top";
    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      const width = prediction.bbox[2];
      const height = prediction.bbox[3];
      // Draw the bounding box.
      ctx.strokeStyle = "#00FFFF";
      ctx.lineWidth = 4;
      ctx.strokeRect(x, y, width, height);
      // Draw the label background.
      ctx.fillStyle = "#00FFFF";
      const textWidth = ctx.measureText(prediction.class).width;
      const textHeight = parseInt(font, 10); // base 10
      ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
    });

    predictions.forEach(prediction => {
      const x = prediction.bbox[0];
      const y = prediction.bbox[1];
      // Draw the text last to ensure it's on top.
      ctx.fillStyle = "#000000";
      ctx.fillText(prediction.class, x, y);
    });
  };
  if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
    const webCamPromise = navigator.mediaDevices
      .getUserMedia({
        audio: false,
        video: {
          facingMode: "user"
        }
      })
      .then(stream => {
        window.stream = stream;
        videoRef.current.srcObject = stream;
        return new Promise((resolve, reject) => {
          videoRef.current.onloadedmetadata = () => {
            resolve();
          };
        });
      });
    const modelPromise = cocoSsd.load();
    Promise.all([modelPromise, webCamPromise])
      .then(values => {
        detectFrame(videoRef.current, values[0]);
      })
      .catch(error => {
        console.error(error);
      });
  }
}, [canvasRef, videoRef])



    return (
      <div>
        <video
          className="size"
          autoPlay
          playsInline
          muted
          ref={videoRef}
          width="600"
          height="500"
        />
        <canvas
          className="size"
          ref={canvasRef}
          width="600"
          height="500"
        />
      </div>
    );
}

export default App;