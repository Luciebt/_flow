import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";

const YouTubeVideo = forwardRef(({ videoId, width, height }, ref) => {
  const playerRef = useRef(null);
  const player = useRef(null); // Separate reference for the player object

  const videoUrl = `https://www.youtube.com/embed/${videoId}`;

  useEffect(() => {
    if (!videoId) {
      console.log("not ready");
      // Video ID is not available yet, do something (e.g., show loading spinner)
      return;
    }

    player.current = new window.YT.Player(playerRef.current, {
      videoId: videoId,
      events: {
        onReady: onPlayerReady,
      },
    });

    return () => {
      player.current.destroy();
    };
  }, [videoId]);

  const onPlayerReady = () => {
    console.log("YouTube player is ready.");
  };

  useImperativeHandle(ref, () => ({
    playVideoAtTime: (time) => {
      if (player.current && player.current.seekTo && player.current.playVideo) {
        player.current.pauseVideo();
        player.current.seekTo(time, true); // Seek to the specified time in seconds
        player.current.playVideo();
      }
    },
  }));

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        margin: "1em",
      }}
    >
      <div
        ref={playerRef}
        style={{
          width: `${width}px`,
          height: `${height}px`,
          marginRight: "1em",
          marginTop: "1em",
        }}
      ></div>
    </div>
  );
});

export default YouTubeVideo;
