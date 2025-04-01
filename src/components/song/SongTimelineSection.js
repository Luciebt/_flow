import React from "react";
import { getKeyFromPitchClass, getPitchColors } from "../../utils/Pitch";
import { formatDuration } from "../../utils/Time";
import "./SongTimeline.css";

function SongTimelineSection(props) {
  const key = getKeyFromPitchClass(props.sectiondata.key);

  const sectionStart = Math.round(props.sectiondata.start);
  const sectionEnd = Math.round(props.sectiondata.end);
  const trackDuration = Math.round(props.trackduration);
  const sectionDuration = Math.round(props.sectiondata.duration);

  // between -60 and 0db. Convert to percentage.
  const sectionLoudness = props.sectiondata.loudness;
  const loudnessPercent = Math.round((sectionLoudness / 60 + 1) * 100);

  const startPercent = (sectionStart / trackDuration) * 100;
  const endPercent = ((sectionStart + sectionDuration) / trackDuration) * 100;

  const styles = {
    backgroundColor: "transparent",
    width: `${endPercent - startPercent}%`,
    height: 40,
    fontSize: "14px",
  };

  const buttonStyles = {
    backgroundColor: getPitchColors(key, loudnessPercent),
    width: "100%",
    height: "100%",
    fontSize: "14px",
  };

  const onClickSection = () => {
    props.playvideoattime(sectionStart);
  };

  return (
    <div style={styles}>
      <button
        key={props.sectionIndex}
        className="section-list-button"
        style={buttonStyles}
        onClick={onClickSection}
      >
        {key}
      </button>
      <br></br>
      <span style={{ fontSize: "12px", marginLeft: "0.2em" }}>
        {formatDuration(sectionStart)}
      </span>
    </div>
  );
}

export default SongTimelineSection;
