const BAD_WORDS = [
  "dm", "dmm", "dcm", "dkm",
  "dit", "ditme", "dit me",
  "vl", "vcl", "vkl", "vloz", "vlozz",
  "cl", "cc", "cac", "cac",
  "lon", "loz", "lz",
  "buoi","ngu", "ngu lol", "ngu vl", "ngu vcl",
  "oc cho",
  "khon nan",
  "vo hoc",
  "mat day",
  "cho chet",
  "suc vat",
  "do ngu",
  "thang cho",
  "con cho","d1t", "djt", "djtme",
  "l0n", "l0z", "l*n",
  "c*c", "c4c",
  "nguu", "nguuu",
  "occho", "ockcho",
  "kh0n nan", "khon@nan","deo", "dech",
  "ao lol",
  "chan vl",
  "cay vl",
  "uc vl"
];

const normalizeText = (text = "") => {
  return text
    .toLowerCase()
    .replace(/đ/g, "d")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const findBadWord = (text = "") => {
  const normalized = normalizeText(text);
  for (const badWord of BAD_WORDS) {
    if (normalized.includes(badWord)) {
      return badWord;
    }
  }
  return "";
};

const containsProfanity = (text = "") => {
  return !!findBadWord(text);
};

module.exports = {
  BAD_WORDS,
  normalizeText,
  findBadWord,
  containsProfanity,
};
