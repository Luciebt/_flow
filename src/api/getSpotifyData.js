import axios from "axios";
import {
  buildGenresQuery,
  buildTempoQuery,
  buildKeyQuery,
} from "./spotifyQueryBuilder";

export const getTrackAnalysis = async (token, trackId) => {
  if (!trackId) return null;
  const getAudioAnalysis = async (trackId) => {
    try {
      const { data } = await axios.get(
        `https://api.spotify.com/v1/audio-analysis/${trackId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const audioAnalysisData = await getAudioAnalysis(trackId);
  const sections = audioAnalysisData?.sections;
  const beats = audioAnalysisData?.beats;
  const tempo = Math.round(audioAnalysisData?.track.tempo);
  const key = audioAnalysisData?.track.key;
  const mode = audioAnalysisData?.track.mode;

  return {
    sections,
    beats,
    key,
    tempo,
    mode,
  };
};

export const getPreviewUrl = async (token, trackId) => {
  if (!trackId) return null;

  try {
    const response = await axios.get(
      `https://api.spotify.com/v1/tracks/${trackId}?market=US`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );

    return response.data.preview_url;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getArtistGenres = async (token, artistId) => {
  if (!artistId) return null;
  try {
    const { data } = await axios.get(
      `https://api.spotify.com/v1/artists/${artistId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    return data.genres;
  } catch (error) {
    console.log(error);
  }
};

export const getAllAvailableGenres = async (token) => {
  const endpointUrl = `https://api.spotify.com/v1/recommendations/available-genre-seeds`;
  try {
    const { data } = await axios.get(endpointUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return data.genres;
  } catch (error) {
    console.log(error);
  }
};

export const getTracksForGenre = async (token, genre) => {
  if (!genre) return null;

  try {
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        q: `genre:${genre}`,
        type: "track",
        // type: "playlist,artist,track",
        limit: 2,
      },
    });
    const tracksForGenre = data.tracks.items;
    return tracksForGenre;
  } catch (error) {
    console.log(error);
  }
};

export const getFilteredSearchRecos = async (token, genre, tempo, key) => {
  // Take a random track from genre results.
  const tracks = await getTracksForGenre(token, genre);

  if (tracks) {
    const track = tracks[Math.floor(Math.random() * tracks.length)];
    const trackId = track.id;
    const artistId = track.artists[0].id;

    const genreQuery = genre && genre != "none" ? buildGenresQuery(genre) : "";
    const tempoQuery = tempo && tempo != "all" ? buildTempoQuery(tempo) : "";
    const keyQuery = key && key != "all" ? buildKeyQuery(key) : "";

    const queryParams = genreQuery + tempoQuery + keyQuery;

    console.log(queryParams);

    try {
      const { data } = await axios.get(
        `https://api.spotify.com/v1/recommendations?seed_artists=${artistId}&seed_tracks=${trackId}${queryParams}&limit=2`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      return data.tracks;
    } catch (error) {
      console.log(error);
    }
  }
};
