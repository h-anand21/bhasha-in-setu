/**
 * Lightweight roman -> native-script transliteration used to render the
 * expanded offline vocabulary in Ol Chiki (Santhali) and Devanagari
 * (Ho / Mundari, both commonly written in Devanagari in Jharkhand schools).
 */

const OL_CONS: [string, string][] = [
  ["chh", "ᱪ"], ["ch", "ᱪ"], ["kh", "ᱠᱷ"], ["gh", "ᱜᱷ"], ["th", "ᱛᱷ"],
  ["dh", "ᱫᱷ"], ["ph", "ᱯᱷ"], ["bh", "ᱵᱷ"], ["jh", "ᱡᱷ"], ["sh", "ᱥ"],
  ["ng", "ᱝ"], ["ny", "ᱧ"], ["rr", "ᱲ"], ["k", "ᱠ"], ["g", "ᱜ"], ["c", "ᱪ"],
  ["j", "ᱡ"], ["t", "ᱛ"], ["d", "ᱫ"], ["n", "ᱱ"], ["p", "ᱯ"], ["b", "ᱵ"],
  ["m", "ᱢ"], ["y", "ᱭ"], ["r", "ᱨ"], ["l", "ᱞ"], ["w", "ᱣ"], ["v", "ᱣ"],
  ["s", "ᱥ"], ["h", "ᱦ"],
];
const OL_VOW: [string, string][] = [
  ["aa", "ᱟ"], ["ai", "ᱟᱭ"], ["au", "ᱟᱣ"], ["ee", "ᱤ"], ["ii", "ᱤ"],
  ["oo", "ᱩ"], ["uu", "ᱩ"], ["a", "ᱟ"], ["e", "ᱮ"], ["i", "ᱤ"],
  ["o", "ᱚ"], ["u", "ᱩ"],
];

const DEV_CONS: [string, string][] = [
  ["chh", "छ"], ["ch", "च"], ["kh", "ख"], ["gh", "घ"], ["th", "थ"],
  ["dh", "ध"], ["ph", "फ"], ["bh", "भ"], ["jh", "झ"], ["sh", "श"],
  ["ng", "ं"], ["ny", "ञ"], ["rr", "ड़"], ["k", "क"], ["g", "ग"], ["c", "च"],
  ["j", "ज"], ["t", "त"], ["d", "द"], ["n", "न"], ["p", "प"], ["b", "ब"],
  ["m", "म"], ["y", "य"], ["r", "र"], ["l", "ल"], ["w", "व"], ["v", "व"],
  ["s", "स"], ["h", "ह"],
];
const DEV_VOW: [string, string, string][] = [
  ["aa", "आ", "ा"], ["ai", "ऐ", "ै"], ["au", "औ", "ौ"], ["ee", "ई", "ी"],
  ["ii", "ई", "ी"], ["oo", "ऊ", "ू"], ["uu", "ऊ", "ू"], ["a", "अ", ""],
  ["e", "ए", "े"], ["i", "इ", "ि"], ["o", "ओ", "ो"], ["u", "उ", "ु"],
];

const startsWith = (s: string, i: number, p: string) => s.startsWith(p, i);

export function toOlChiki(roman: string): string {
  const s = roman.toLowerCase();
  let out = "";
  let i = 0;
  while (i < s.length) {
    const ch = s[i]!;
    if (ch === " " || ch === "-") { out += " "; i += 1; continue; }
    const c = OL_CONS.find(([p]) => startsWith(s, i, p));
    if (c) { out += c[1]; i += c[0].length; continue; }
    const v = OL_VOW.find(([p]) => startsWith(s, i, p));
    if (v) { out += v[1]; i += v[0].length; continue; }
    i += 1;
  }
  return out.trim();
}

export function toDevanagari(roman: string): string {
  const s = roman.toLowerCase();
  let out = "";
  let i = 0;
  let afterCons = false;
  while (i < s.length) {
    const ch = s[i]!;
    if (ch === " " || ch === "-") { out += " "; afterCons = false; i += 1; continue; }
    const c = DEV_CONS.find(([p]) => startsWith(s, i, p));
    if (c) {
      if (afterCons) out += "्";
      out += c[1];
      afterCons = c[0] !== "ng";
      i += c[0].length;
      continue;
    }
    const v = DEV_VOW.find(([p]) => startsWith(s, i, p));
    if (v) {
      out += afterCons ? v[2] : v[1];
      afterCons = false;
      i += v[0].length;
      continue;
    }
    i += 1;
  }
  return out.trim();
}

const DEV_VOWELS: Record<string, string> = {
  अ: "a", आ: "aa", इ: "i", ई: "i", उ: "u", ऊ: "u",
  ए: "e", ऐ: "ai", ओ: "o", औ: "au", ऋ: "ri",
};

const DEV_MATRAS: Record<string, string> = {
  "ा": "a", "ि": "i", "ी": "i", "ु": "u", "ू": "u",
  "े": "e", "ै": "ai", "ो": "o", "ौ": "au", "ृ": "ri",
};

const DEV_CONSONANTS: Record<string, string> = {
  क: "k", ख: "kh", ग: "g", घ: "gh", ङ: "ng",
  च: "ch", छ: "chh", ज: "j", झ: "jh", ञ: "ny",
  ट: "t", ठ: "th", ड: "d", ढ: "dh", ण: "n",
  त: "t", थ: "th", द: "d", ध: "dh", न: "n",
  प: "p", फ: "ph", ब: "b", भ: "bh", म: "m",
  य: "y", र: "r", ल: "l", व: "v",
  श: "sh", ष: "sh", स: "s", ह: "h",
  क़: "q", ख़: "kh", ग़: "gh", ज़: "z", फ़: "f",
  ड़: "r", ढ़: "rh",
};

export function devanagariToRoman(dev: string): string {
  let res = "";
  let i = 0;
  while (i < dev.length) {
    const ch = dev[i]!;
    const next = dev[i + 1];

    if (DEV_VOWELS[ch]) {
      res += DEV_VOWELS[ch];
      i += 1;
    } else if (DEV_CONSONANTS[ch]) {
      const cons = DEV_CONSONANTS[ch];
      if (next === "्") {
        res += cons;
        i += 2;
      } else if (next && DEV_MATRAS[next]) {
        res += cons + DEV_MATRAS[next];
        i += 2;
      } else if (next === "ं" || next === "ँ") {
        res += cons + "ang";
        i += 2;
      } else {
        const isEnd = i === dev.length - 1 || dev[i + 1] === " ";
        res += isEnd ? cons : cons + "a";
        i += 1;
      }
    } else if (ch === "ं" || ch === "ँ") {
      res += "n";
      i += 1;
    } else if (DEV_MATRAS[ch]) {
      res += DEV_MATRAS[ch];
      i += 1;
    } else {
      res += ch;
      i += 1;
    }
  }
  return res.trim();
}

export function devanagariToOlChiki(dev: string): string {
  const roman = devanagariToRoman(dev);
  return toOlChiki(roman);
}
