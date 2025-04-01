import axios from "axios";
import { useEffect, useRef, useState, useCallback } from "react";
import SongTimeline from "./components/song/SongTimeline";
import StatusBar from "./components/search/StatusBar";
import "./App.css";
import {
  getArtistGenres,
  getTracksForGenre,
  getFilteredSearchRecos,
} from "./api/getSpotifyData";
import FilteredSearch from "./components/search/FilteredSearch";
import {
  buildGenresQuery,
  buildTempoQuery,
  buildKeyQuery,
} from "./api/spotifyQueryBuilder";
import {
  getSearchMessage,
  getMessageForGenreRecos,
  getMessageForKeyRecos,
  getMessageForTempoRecos,
} from "./utils/StatusBarMessage";

require("dotenv").config();

const CLIENT_ID = process.env.CLIENT_ID;
const REDIRECT_URI = "http://localhost:3000/auth/spotify/callback";
const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
const RESPONSE_TYPE = "token";

function App() {
  const formRef = useRef(null);
  const filteredSearchRef = useRef(null);
  const [token, setToken] = useState("");
  const [statusBarMessage, setStatusBarMessage] = useState("///");
  const [searchKey, setSearchKey] = useState("");
  const [recosFound, setRecosFound] = useState([]);
  const [trackFromFilteredSearch, setTracksFromFilteredSearch] = useState([]);
  const [artistInfo, setArtistInfo] = useState({ id: "", name: "" });
  const [trackInfo, setTrackInfo] = useState({
    id: "",
    name: "",
    previewUrl: "",
  });

  const initialTrackState = {
    id: "",
    name: "",
    trackDuration: 0,
    trackTempo: null,
    trackKey: null,
    trackMode: null,
    artistId: "",
    artistName: "",
    previewUrl: "",
    genres: "",
    spotifyLink: "",
  };

  const initialArtistState = {
    id: "",
    name: "",
  };

  const createRecosFromTracks = useCallback((tracks) => {
    return tracks.map((track) => {
      const { name: name, id: trackId } = track;
      const { name: artistName, id: artistId } = track.artists[0];
      const spotifyLink = track.external_urls.spotify;
      const previewUrl = track.preview_url;

      console.log(track);

      return {
        track: [name, trackId],
        artist: [artistName, artistId],
        previewUrl: previewUrl,
        spotifyLink: spotifyLink,
      };
    });
  }, []);

  const updateTrackInfo = useCallback((updatedTrackInfo) => {
    setTrackInfo(updatedTrackInfo);
  }, []);

  const getRecos = async (trackInfo, queryParams) => {
    if (!trackInfo || !queryParams) return null;

    resetState();

    // setTrackInfo({
    //   name: trackInfo.name,
    //   id: trackInfo.id,
    //   genres: [],
    //   previewUrl: "",
    // });

    // setArtistInfo({
    //   name: trackInfo.artistName,
    //   id: trackInfo.artistId,
    //   genre: [],
    // });

    setRecosFound([]);
    setTracksForGenre([]);
    setTracksFromFilteredSearch([]);

    try {
      const { data } = await axios.get(
        `https://api.spotify.com/v1/recommendations?seed_artists=${trackInfo.artistId}&seed_tracks=${trackInfo.id}${queryParams}&limit=2`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      const filteredTracks = data.tracks.filter(
        (track) => track.id !== trackInfo.id,
      );

      const recos = createRecosFromTracks(filteredTracks);
      setRecosFound(recos);

      window.scrollTo(0, 0);

      return data;
    } catch (error) {
      console.log(error);
    }
  };

  const getRecosInKey = useCallback(
    async (trackInfo) => {
      if (!trackInfo || !trackInfo.trackKey) return null;
      setStatusBarMessage(
        getMessageForKeyRecos(
          trackInfo.artistName,
          trackInfo.name,
          trackInfo.trackKey,
        ),
      );
      return getRecos(trackInfo, buildKeyQuery(trackInfo.trackKey));
    },
    [setStatusBarMessage, getMessageForKeyRecos, getRecos, buildKeyQuery],
  );

  const getRecosInTempo = useCallback(
    async (trackInfo) => {
      if (!trackInfo.trackTempo) return null;
      setStatusBarMessage(
        getMessageForTempoRecos(
          trackInfo.artistName,
          trackInfo.name,
          trackInfo.trackTempo,
        ),
      );
      return getRecos(trackInfo, buildTempoQuery(trackInfo.trackTempo));
    },
    [setStatusBarMessage, getMessageForTempoRecos, getRecos, buildTempoQuery],
  );

  const getRecosInGenre = useCallback(
    async (trackInfo, genre) => {
      if (!genre) return null;
      setStatusBarMessage(
        getMessageForGenreRecos(trackInfo.artistName, trackInfo.name, genre),
      );
      return getRecos(trackInfo, buildGenresQuery(genre));
    },
    [setStatusBarMessage, getMessageForGenreRecos, getRecos, buildGenresQuery],
  );

  const getRecosInGenreWithoutTrack = useCallback(
    async (genre) => {
      if (!genre) return null;
      const tracks = await getTracksForGenre(token, genre);
      setTracksForGenre(tracks);
    },
    [token, setTracksForGenre, getTracksForGenre],
  );

  const getRecosFromFilteredSearch = useCallback(
    async (genre, tempo, key) => {
      if (!genre && !tempo && !key) return null;
      const tracks = await getFilteredSearchRecos(token, genre, tempo, key);
      setTracksFromFilteredSearch(tracks);
    },
    [token, setTracksFromFilteredSearch, getFilteredSearchRecos],
  );

  // For use by filteredSearch component
  const updateStatusBar = (newStatus) => {
    setStatusBarMessage(newStatus);
  };

  const resetState = () => {
    setArtistInfo({ initialArtistState });
    setTrackInfo({ initialTrackState });
    setTopTracks(null);
    setRecosFound([]);
    setTracksForGenre([]);
    setTracksFromFilteredSearch([]);
    // setStatusBarMessage("///");
  };

  const searchArtists = async (e) => {
    e.preventDefault();
    if (!searchKey) return null;

    setStatusBarMessage(getSearchMessage(searchKey));

    if (filteredSearchRef.current) {
      filteredSearchRef.current.resetFilteredSearch();
    }

    resetState();

    try {
      const { data } = await axios.get("https://api.spotify.com/v1/search", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        params: {
          q: searchKey,
          type: "artist,track",
        },
      });

      const artist = data.artists.items[0];
      const tracks = data.tracks.items;

      if (tracks.length > 0) {
        const firstTrackFound = tracks[0];
        const firstArtistFound = firstTrackFound.artists[0];
        const artistId = firstArtistFound.id;
        const artistName = firstArtistFound.name;

        const genres = await getArtistGenres(token, artistId);

        setTrackInfo((prevState) => ({
          ...prevState,
          id: firstTrackFound.id,
          name: firstTrackFound.name,
          previewUrl: firstTrackFound.preview_url,
          spotifyLink: firstArtistFound.external_urls.spotify,
        }));

        setArtistInfo((prevState) => ({
          ...prevState,
          id: artistId,
          name: artistName,
          genres: genres,
        }));
      }
      if (artist && !artistInfo.id) {
        setArtistInfo((prevArtistInfo) => ({
          ...prevArtistInfo,
          id: artist.id,
          name: artist.name,
          genres: artist.genres,
        }));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const logout = () => {
    setToken("");
    window.localStorage.removeItem("token");
  };

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem("token");

    if (!token && hash) {
      token = hash
        .substring(1)
        .split("&")
        .find((elem) => elem.startsWith("access_token"))
        .split("=")[1];

      window.location.hash = "";
      window.localStorage.setItem("token", token);
    }

    setToken(token);
    if (formRef.current) formRef.current.focus();
  }, []);

  const resetSearch = useCallback(() => {
    setSearchKey(""); // Clear the search key
    resetState(); // Reset the state to initial values
    setStatusBarMessage("///");
  }, []);

  return (
    <div className="App">
      <header className="app-header">
        <div className="left-nav">
          <a href="#">
            <h1 onClick={resetSearch}>_flow</h1>
          </a>

          {token && (
            <form onSubmit={searchArtists} id="search-form">
              <input
                ref={formRef}
                autoFocus
                type="text"
                placeholder="Search for artists or tracks"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
              />
              <button className="search-button" type={"submit"}>
                Search
              </button>
            </form>
          )}
        </div>

        {token && <span>OR</span>}

        {token && (
          <FilteredSearch
            ref={filteredSearchRef}
            token={token}
            getRecosFromFilteredSearch={getRecosFromFilteredSearch}
            resetSearch={resetSearch}
            updateStatusBar={updateStatusBar}
          />
        )}
      </header>

      {token && trackInfo.id && (
        <SongTimeline
          token={token}
          referenceTrack={true}
          artistId={artistInfo.id}
          artistName={artistInfo.name}
          genres={artistInfo.genres}
          trackId={trackInfo.id}
          name={trackInfo.name}
          previewUrl={trackInfo.previewUrl}
          spotifyLink={trackInfo.spotifyLink}
          updateTrackInfo={updateTrackInfo}
          getRecosInKey={getRecosInKey}
          getRecosInTempo={getRecosInTempo}
          getRecosInGenre={getRecosInGenre}
        />
      )}

      {token && <StatusBar statusBarMessage={statusBarMessage} />}

      {token &&
        recosFound &&
        Object.entries(recosFound).map(([k, v]) => {
          const { track, artist, previewUrl, spotifyLink } = v;
          const [name, trackId] = track;
          const [artistName, artistId] = artist;

          return (
            <SongTimeline
              key={trackId}
              token={token}
              referenceTrack={false}
              artistId={artistId}
              artistName={artistName}
              genres={null}
              trackId={trackId}
              name={name}
              previewUrl={previewUrl}
              spotifyLink={spotifyLink}
              updateTrackInfo={updateTrackInfo}
              getRecosInKey={getRecosInKey}
              getRecosInTempo={getRecosInTempo}
              getRecosInGenre={getRecosInGenre}
            />
          );
        })}

      {token &&
        trackFromFilteredSearch &&
        trackFromFilteredSearch.map((track, index) => {
          const trackId = track.id;
          const artistId = track.artists[0].id;
          const trackName = track.name;
          const artistName = track.artists[0].name;
          const previewUrl = track.preview_url;
          const spotifyLink = track.external_urls.spotify;

          return (
            <SongTimeline
              key={trackId}
              token={token}
              referenceTrack={false}
              artistId={artistId}
              artistName={artistName}
              genres={null}
              trackId={trackId}
              name={trackName}
              previewUrl={previewUrl}
              spotifyLink={spotifyLink}
              updateTrackInfo={updateTrackInfo}
              getRecosInKey={getRecosInKey}
              getRecosInTempo={getRecosInTempo}
              getRecosInGenre={getRecosInGenre}
            />
          );
        })}

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "1em" }}
      >
        {!token ? (
          <button
            className="search-button"
            onClick={() =>
              (window.location.href = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`)
            }
          >
            Login to Spotify
          </button>
        ) : (
          <button id="logout-button" onClick={logout}>
            Logout
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
