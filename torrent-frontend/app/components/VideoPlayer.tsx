"use client";
import { useRef } from "react";

export default function VideoPlayer({ source }: { source: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  //Function to move 10s forward or backward
  const skipTime = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <video ref={videoRef} controls src={source} />
    </div>
  );
}
