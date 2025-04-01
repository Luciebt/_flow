import React, { useState, useEffect } from "react";
import "./AudioPlayer.css";

const AudioPlayer = ({ previewUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = document.getElementById("audio");
    if (!audio) return;

    // Pause the audio when the component unmounts
    return () => {
      if (!audio.paused) {
        audio.pause();
      }
    };
  }, []);

  useEffect(() => {
    const audio = document.getElementById("audio");

    if (!audio) return;

    // Update the audio source whenever the previewUrl prop changes
    audio.src = previewUrl;

    // Play or pause the audio depending on the current state
    if (isPlaying) {
      audio.play();
    } else {
      audio.pause();
    }
  }, [previewUrl, isPlaying]);

  const playingStyle = {
    backgroundColor: "#faedcd",
    border: "1px solid #faedcd",
    boxShadow: "1px 1px 1px 1px #faedcd",
  };

  const notPlayingStyle = {
    backgroundColor: "#e9e9e9",
    border: "1px solid #d9d9d9",
    boxShadow: "1px 1px 1px 1px #283618bb",
  };

  const togglePlay = () => {
    const playButtons = document.getElementsByClassName("play-button");
    if (playButtons) {
      Array.from(playButtons).forEach((element) => {
        element.textContent = "⏵︎";
        element.style = notPlayingStyle;
      });
    }
    setIsPlaying(!isPlaying);
  };

  const handleAudioEnded = (e) => {
    if (e.target && e.target.src) {
      const button = document.getElementById(e.target.src);
      button.style = notPlayingStyle;
      button.textContent = "⏵︎";
    }
  };

  return (
    <span>
      <button
        id={previewUrl}
        style={isPlaying ? playingStyle : notPlayingStyle}
        className="play-button play-button-not-playing"
        onClick={togglePlay}
      >
        {isPlaying ? "⏸︎" : "⏵︎"}
      </button>
      {previewUrl && (
        <audio
          id="audio"
          onEnded={(e) => {
            handleAudioEnded(e);
          }}
        />
      )}
    </span>
  );
};

export default AudioPlayer;
