import React, { useState, useEffect } from "react";
import "./SongTimeline.css";
import { getKeyFromPitchClass } from "../../utils/Pitch";
import {
  getTrackAnalysis,
  getPreviewUrl,
  getArtistGenres,
} from "../../api/getSpotifyData";
import AudioPlayer from "../audio/AudioPlayer";

function SongTimeline(props) {
  const [sections, setSections] = useState([]);
  const [beats, setBeats] = useState([]);
  const [trackInfo, setTrackInfo] = useState({
    id: props.trackId,
    name: props.name,
    trackDuration: 0,
    trackTempo: null,
    trackKey: null,
    trackMode: null,
    artistId: props.artistId,
    artistName: props.artistName,
    previewUrl: props.previewUrl,
    videoId: props.videoId,
    genres: props.genres,
    spotifyLink: props.spotifyLink,
  });

  useEffect(() => {
    const fetchPreviewUrl = async () => {
      if (!trackInfo.previewUrl) {
        const fetchedPreviewUrl = await getPreviewUrl(
          props.token,
          trackInfo.id,
        );
        setTrackInfo((prevTrackInfo) => ({
          ...prevTrackInfo,
          previewUrl: fetchedPreviewUrl || prevTrackInfo.previewUrl,
        }));
      }
    };

    const fetchGenres = async () => {
      if (!trackInfo.genres) {
        const fetchedGenres = await getArtistGenres(
          props.token,
          props.artistId,
        );
        setTrackInfo((prevTrackInfo) => ({
          ...prevTrackInfo,
          genres: fetchedGenres || prevTrackInfo.genres,
        }));
      }
    };

    const fetchTrackAnalysis = async () => {
      const { sections, beats, key, tempo, mode } = await getTrackAnalysis(
        props.token,
        trackInfo.id,
      );

      setTrackInfo((prevTrackInfo) => ({
        ...prevTrackInfo,
        trackKey: key,
        trackTempo: tempo,
        trackMode: mode,
      }));

      if (sections) {
        // Filter only sections with high confidence
        const filteredSections = sections.filter(
          (section) => section.confidence >= 0.5,
        );
        setSections(filteredSections);

        const duration = Math.round(
          filteredSections.reduce(
            (totalDuration, section) => totalDuration + section.duration,
            0,
          ),
        );

        setTrackInfo((prevTrackInfo) => ({
          ...prevTrackInfo,
          trackDuration: duration,
        }));
      }

      if (beats) {
        setBeats(beats);
      }
    };

    fetchPreviewUrl();
    fetchGenres();
    fetchTrackAnalysis();
  }, [props.token, props.trackId]);

  const inKeyRecos = () => {
    // props.updateTrackInfo(trackInfo);
    props.getRecosInKey(trackInfo);
  };

  const inTempoRecos = () => {
    // props.updateTrackInfo(trackInfo);
    props.getRecosInTempo(trackInfo);
  };

  const inGenreRecos = (trackInfo, genre) => {
    // props.updateTrackInfo(trackInfo);
    props.getRecosInGenre(trackInfo, genre);
  };

  const RenderSongInfos = () => {
    const RenderGenres = () => {
      return (
        trackInfo.genres &&
        trackInfo.genres.map((genre, index) => (
          <button
            key={index}
            className="tag genres-tag"
            onClick={() => inGenreRecos(trackInfo, genre)}
          >
            {genre + " "}
          </button>
        ))
      );
    };

    return (
      <div className="song-info">
        <div className="left-song-info">
          <AudioPlayer previewUrl={trackInfo.previewUrl} />
        </div>

        <div className="tag-box">
          <h2 style={{ textDecoration: "underline" }}>
            <a href={props.spotifyLink}>
              <span style={{ fontWeight: "800", color: "#424346" }}>
                {props.artistName}
              </span>
              <span style={{ fontWeight: "400", color: "#424346" }}>
                {" "}
                - {props.name}
              </span>
            </a>
          </h2>
          <button className="tag key-tag" onClick={inKeyRecos}>
            {getKeyFromPitchClass(trackInfo.trackKey) &&
              getKeyFromPitchClass(trackInfo.trackKey)}{" "}
            {trackInfo.trackMode ? "Major" : "Minor"}{" "}
          </button>
          <button className="tag key-tag" onClick={inTempoRecos}>
            {trackInfo.trackTempo && trackInfo.trackTempo} bpm
          </button>{" "}
          {RenderGenres()}
        </div>
      </div>
    );
  };

  return (
    <div
      className="timeline-card"
      id={props.trackId}
      style={{
        border: props.referenceTrack
          ? "1px solid #283618"
          : "1px solid #f2e9e4",
        boxShadow: props.referenceTrack
          ? "1px 1px 1px 1px #283618"
          : "1px 1px 1px 1px #f2e9e4",
      }}
    >
      <div className="song-box">
        {RenderSongInfos()}
        {/* {showVideo && RenderYoutubeVideo()} */}
      </div>

      {/* <div className="timeline-container">
        {sections &&
          sections.map((sectionData, index) => {
            return (
              <SongTimelineSection
                key={index}
                sectiondata={sectionData}
                sectionindex={index}
                trackduration={trackInfo.trackDuration}
                playvideoattime={playVideoAtTime}
              />
            );
          })}
      </div> */}
    </div>
  );
}

export default SongTimeline;
