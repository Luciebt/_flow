import React from "react";
import { getKeyFromPitchClass } from "./Pitch";

export const getSearchMessage = (search) => (
  <span>
    Search for <strong>{search}</strong>
  </span>
);

export const getFilteredSearchMessage = (genre, tempo, key) => {
  const renderGenre = genre ? genre : "all";
  const renderTempo = tempo ? `- ${tempo} bpm` : "- all bpm";
  const renderKey = getKeyFromPitchClass(key)
    ? `- key ${getKeyFromPitchClass(key)}`
    : "- all keys";

  return (
    <span>
      Results for{" "}
      <strong>
        {renderGenre} {renderTempo} {renderKey}
      </strong>
    </span>
  );
};

export const getMessageForKeyRecos = (artistName, trackName, key) => (
  <span>
    Recommendations for{" "}
    <strong>
      {artistName} - {trackName}
    </strong>
    , in key <strong>{getKeyFromPitchClass(key)}</strong>
  </span>
);

export const getMessageForTempoRecos = (artistName, trackName, tempo) => (
  <span>
    Recommendations for{" "}
    <strong>
      {artistName} - {trackName}
    </strong>
    , for <strong>{tempo} bpm</strong>
  </span>
);

export const getMessageForGenreRecos = (artistName, trackName, genre) => (
  <span>
    Recommendations for{" "}
    <strong>
      {artistName} - {trackName}
    </strong>
    , for the genre <strong>{genre}</strong>
  </span>
);
