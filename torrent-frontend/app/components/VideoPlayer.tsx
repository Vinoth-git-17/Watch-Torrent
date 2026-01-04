"use client";
import React, { useRef, useEffect } from "react";
import videojs from "video.js";
import Player from "video.js/dist/types/player";
import "video.js/dist/video-js.css";

interface VideoPlayerProps {
  source: string;
  cssClass?: string;
}
const VideoPlayer: React.FC<VideoPlayerProps> = ({ source, cssClass }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<Player | null>(null);

  useEffect(() => {
    if (videoRef.current) {
      playerRef.current = videojs(videoRef.current, {
        controls: true,
        preload: "metadata",
        controlBar: {
          skipButtons: {
            backward: 10, // Skip backward 10 seconds
            forward: 10, // Skip forward 10 seconds
          },
        },
      });
    }
  }, [videoRef]);

  return (
    <video
      ref={videoRef}
      className={`video-js vjs-fluid vjs-16-9 ${cssClass}`}
      src={source}
      controls
    ></video>
  );
};

export default VideoPlayer;
