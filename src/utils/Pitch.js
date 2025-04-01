export const getKeyFromPitchClass = (pitchClass) => {
  if (pitchClass === -1) return "";

  const pitchClasses = {
    0: "C",
    1: "C#",
    2: "D",
    3: "D#",
    4: "E",
    5: "F",
    6: "F#",
    7: "G",
    8: "G#",
    9: "A",
    10: "A#",
    11: "B",
  };

  return pitchClasses[pitchClass] || "";
};

export const getPitchClassFromKey = (key) => {
  const keys = {
    C: 0,
    "C#": 1,
    D: 2,
    "D#": 3,
    E: 4,
    F: 5,
    "F#": 6,
    G: 7,
    "G#": 8,
    A: 9,
    "A#": 10,
    B: 11,
  };

  return keys[key] || null;
};

export const getPitchColors = (pitch, loudness) => {
  let key = pitch;
  if (typeof pitch === "string") {
    key = getPitchClassFromKey(pitch);
  }

  return `hsl(${key * 30}, ${loudness - 22}%, 70%)`;
};
