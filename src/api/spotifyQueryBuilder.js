export const buildGenresQuery = (genres) => {
  let query = "&seed_genres=";
  if (Array.isArray(genres)) {
    return (
      query + genres.map((genre) => genre.replace(/['\s]+/g, "-")).join(",")
    );
  } else {
    return query + genres.replace(/\s+/g, "-");
  }
};
export const buildTempoQuery = (tempo) => {
  return `&min_tempo=${tempo}&max_tempo=${tempo + 1}`;
};

export const buildKeyQuery = (key) => {
  return `&target_key=${key}`;
};
