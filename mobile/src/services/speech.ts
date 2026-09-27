import * as Speech from "expo-speech";
import { toDevanagari } from "../lib/translit";

/**
 * Speaks text using the device's Text-To-Speech engine.
 * Automatically handles roman-to-Devanagari phonetic transliteration
 * so Android TTS can speak tribal phrases using native Indian voices.
 */
export async function speakNative(text: string, language = "hi-IN"): Promise<void> {
  if (!text || !text.trim()) return;

  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    // If language is hi-IN and text is in Latin/English characters,
    // convert to Devanagari phonetics so Android's Hindi TTS can pronounce it.
    let textToSpeak = text;
    if (language === "hi-IN" && /^[a-zA-Z0-9\s.,!?'"-]+$/.test(text.trim())) {
      const dev = toDevanagari(text);
      if (dev && dev.length > 0) {
        textToSpeak = dev;
      }
    }

    Speech.speak(textToSpeak, {
      language,
      pitch: 1.0,
      rate: 0.85, // slightly slower for foundational primary learners
      onError: (err) => {
        console.warn("TTS primary speech failed, falling back to en-IN:", err);
        // Fallback to Indian English voice if hi-IN voice is missing or failed
        Speech.speak(text, {
          language: "en-IN",
          pitch: 1.0,
          rate: 0.85,
        });
      },
    });
  } catch (error) {
    console.warn("Speech error:", error);
    // Last ditch fallback
    try {
      Speech.speak(text, { language: "en-IN", rate: 0.85 });
    } catch {}
  }
}

/**
 * High-level helper for speaking dialogue translation results.
 * Respects script characteristics:
 * - Mundari ('unr'): Native script is Devanagari, so speak native directly.
 * - Santhali ('sat') & Ho ('hoc'): Native scripts are Ol Chiki and Warang Citi,
 *   which TTS engines cannot parse. We transliterate the roman phonetic guide
 *   into Devanagari, yielding clear and natural pronunciation in hi-IN voice.
 */
export async function speakDialogue(
  nativeText: string,
  romanText: string,
  langCode: string
): Promise<void> {
  if (!nativeText && !romanText) return;

  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    let textToSpeak = "";
    if (langCode === "unr" && nativeText) {
      // Mundari is Devanagari
      textToSpeak = nativeText;
    } else {
      // Convert Roman to Devanagari phonetics for natural Hindi TTS
      textToSpeak = toDevanagari(romanText) || romanText;
    }

    Speech.speak(textToSpeak, {
      language: "hi-IN",
      pitch: 1.0,
      rate: 0.82,
      onError: () => {
        // Fallback to en-IN with roman text
        Speech.speak(romanText, {
          language: "en-IN",
          pitch: 1.0,
          rate: 0.85,
        });
      },
    });
  } catch (error) {
    console.warn("speakDialogue error:", error);
    try {
      Speech.speak(romanText || nativeText, { language: "en-IN", rate: 0.85 });
    } catch {}
  }
}

export async function stopSpeech(): Promise<void> {
  try {
    await Speech.stop();
  } catch (error) {
    console.warn("Stop speech error:", error);
  }
}
