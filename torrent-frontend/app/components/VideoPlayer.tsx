"use client";
import { useRef } from "react";

export default function VideoPlayer({ source, cssClass }: { source: string , cssClass?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  //Function to move 10s forward or backward
  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  return (
    <>
      <video ref={videoRef} className={cssClass} preload="metadata" controls src={source} />
    </>
  );
}
