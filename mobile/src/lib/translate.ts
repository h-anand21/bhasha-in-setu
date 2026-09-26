import {
  EN_PHRASE_TO_HI,
  EN_TO_HI,
  LEXICON,
  PHRASES,
  type Entry,
  type LangCode,
} from "./lexicon";
import {
  devanagariToOlChiki,
  devanagariToRoman,
  toDevanagari,
  toOlChiki,
} from "./translit";

export type TokenResult = {
  source: string;
  roman: string | null;
  native: string | null;
  known: boolean;
};

export type TranslationResult = {
  roman: string;
  native: string;
  tokens: TokenResult[];
  coverage: number;
  matchedPhrase: boolean;
  ms: number;
};

const PUNCT = /[।?!.,;:"'()\-–—_/\\]/g;

const normalise = (s: string) => {
  let clean = s.replace(PUNCT, " ").replace(/\s+/g, " ").trim().toLowerCase();
  clean = clean.replace(/^(हे|हाय|हेलो|हलो|हेल्लो)\s+आई\s+एम\s+(.+)$/iu, (_, _g, name) => `नमस्ते मैं ${name} हूं`);
  clean = clean.replace(/^आई\s+एम\s+(.+)$/iu, (_, name) => `मैं ${name} हूं`);
  clean = clean.replace(/^(माय|माई)\s+नेम\s+इज\s+(.+)$/iu, (_, name) => `मेरा नाम ${name} है`);
  return clean;
};

const PRONOUN_MAP: Record<string, string> = {
  तुमने: "तुम",
  मैंने: "मैं",
  उसने: "वह",
  हमने: "हम",
  आपने: "आप",
  तुम्हारी: "तुम्हारा",
  तुम्हारे: "तुम्हारा",
  मेरी: "मेरा",
  मेरे: "मेरा",
  हमारा: "हमारा",
  हमारी: "हमारा",
  हमारे: "हमारा",
  उसकी: "उसका",
  उसके: "उसका",
  मुझे: "मैं",
  मुझको: "मैं",
  तुम्हें: "तुम",
  तुझको: "तुम",
  उसे: "वह",
  उसको: "वह",
  हमें: "हम",
  हमको: "हम",
  आपको: "आप",
  हूँ: "हूं",
  "क्या-क्या": "क्या क्या",
};

function lookup(word: string): Entry | undefined {
  if (LEXICON[word]) return LEXICON[word];
  if (PRONOUN_MAP[word] && LEXICON[PRONOUN_MAP[word]]) return LEXICON[PRONOUN_MAP[word]];

  const hi = EN_TO_HI[word] ?? EN_TO_HI[word.replace(/(s|es)$/i, "")];
  if (hi && LEXICON[hi]) return LEXICON[hi];

  const stems = [
    word.replace(/(ूंगा|ूंगी|ेगा|एगी|ेंगे|ेंगी)$/u, ""),
    word.replace(/(ता|ती|ते|ना)$/u, ""),
    word.replace(/(ाया|ाये|ाई)$/u, ""),
    word.replace(/(ों|ें|ाँ|ां)$/u, ""),
    word.replace(/(ो|े|ा|ी)$/u, ""),
    word.replace(/(ने|को|से|का|की|के|में|पे|पर)$/u, ""),
  ];

  for (const s of stems) {
    if (s && s !== word) {
      if (LEXICON[s]) return LEXICON[s];
      if (PRONOUN_MAP[s] && LEXICON[PRONOUN_MAP[s]]) return LEXICON[PRONOUN_MAP[s]];
      const sHi = EN_TO_HI[s];
      if (sHi && LEXICON[sHi]) return LEXICON[sHi];
    }
  }

  return undefined;
}

export function translate(input: string, lang: LangCode): TranslationResult {
  const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
  const clean = normalise(input);
  if (!clean) {
    return { roman: "", native: "", tokens: [], coverage: 0, matchedPhrase: false, ms: 0 };
  }

  const phrase = PHRASES[clean] ?? PHRASES[EN_PHRASE_TO_HI[clean] ?? ""];
  if (phrase) {
    const g = phrase[lang];
    const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
    return {
      roman: g.roman,
      native: g.native,
      tokens: [{ source: input.trim(), roman: g.roman, native: g.native, known: true }],
      coverage: 1,
      matchedPhrase: true,
      ms: Math.max(1, Math.round(t1 - t0)),
    };
  }

  const words = clean.split(" ");
  const tokens: TokenResult[] = [];
  let i = 0;
  while (i < words.length) {
    let matched = false;
    for (let n = Math.min(5, words.length - i); n >= 2; n--) {
      const chunk = words.slice(i, i + n).join(" ");
      const p = PHRASES[chunk] ?? PHRASES[EN_PHRASE_TO_HI[chunk] ?? ""];
      if (p) {
        const g = p[lang];
        tokens.push({ source: chunk, roman: g.roman, native: g.native, known: true });
        i += n;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const w = words[i] ?? "";
    const entry = lookup(w);
    if (entry) {
      const g = entry[lang];
      tokens.push({ source: w, roman: g.roman, native: g.native, known: true });
    } else {
      const isDev = /[\u0900-\u097F]/.test(w);
      const roman = isDev ? devanagariToRoman(w) : w;
      let native = w;
      if (lang === "sat") {
        native = isDev ? devanagariToOlChiki(w) : toOlChiki(w);
      } else if (lang === "hoc") {
        native = isDev ? w : toDevanagari(w);
      } else {
        native = isDev ? w : toDevanagari(w);
      }
      tokens.push({ source: w, roman, native, known: false });
    }
    i += 1;
  }

  const known = tokens.filter((t) => t.known).length;
  const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
  return {
    roman: tokens.map((t) => t.roman).join(" "),
    native: tokens.map((t) => t.native).join(" "),
    tokens,
    coverage: tokens.length ? known / tokens.length : 0,
    matchedPhrase: false,
    ms: Math.max(1, Math.round(t1 - t0)),
  };
}

export function translateWord(word: string, lang: LangCode) {
  const entry = lookup(word);
  return entry ? entry[lang] : { roman: word, native: word };
}
