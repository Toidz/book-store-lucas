const BAD_WORDS = [
  "dm","dmm","dcm","dkm","dmk",
  "dit","ditme","dit me","djt","djtme","d1t",
  "vl","vcl","vkl","vloz","vlozz",
  "cl","cc","cak","c4c","cac","c*c",
  "lon","loz","lz","l0n","l0z","l*n",
  "buoi",
  "ngu","nguu","nguuu","ngu lol","ngu vl","ngu vcl","do ngu",
  "oc cho","occho","ockcho",
  "khon nan","kh0n nan","khon@nan",
  "vo hoc","mat day",
  "cho chet","suc vat",
  "thang cho","con cho",
  "deo","dech",
  "ao lol",
  "chan vl","cay vl","uc vl",
  "me may","me m","me mày",
  "bo may","bố mày",
  "vai lon","vai loz",
  "an cut","an shit",
  "cut","shit",
  "fuck","fuk","fck",
  "bitch","b1tch",
  "dog","cho ngu",
  "thang ngu","con ngu",
];
const CONFUSION_MAP = {
  "cac": ["các"],
  "lon": ["lớn"],
  "buoi": ["buổi"],
};
const SAFE_WORDS = [
  "các",
  "các bạn",
  "các bạn nhé",
  "lớn",
  "buổi",
];
function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") 
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
module.exports.containsProfanity = (text) => {
  if (!text) return false;
  const original = text.toLowerCase();
  const normalized = normalizeText(text);
  const words = normalized.split(" ");
  const originalWords = original.split(/\s+/);
  return BAD_WORDS.some((badWord) => {
    const normalizedBad = normalizeText(badWord);
    return words.some((word, index) => {
      if (word !== normalizedBad) return false;
      const originalWord = originalWords[index] || "";
      if (SAFE_WORDS.includes(originalWord)) return false;
      if (CONFUSION_MAP[normalizedBad]) {
        if (CONFUSION_MAP[normalizedBad].includes(originalWord)) {
          return false;
        }
      }
      return true; 
    });
  });
};