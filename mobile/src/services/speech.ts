import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { toDevanagari } from "../lib/translit";

let isConfigured = false;

/**
 * Configures device audio mode to guarantee playback through the main LOUDSPEAKER
 * instead of the call earpiece, and disables ducking.
 */
export async function ensureLoudspeaker(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: false,
      shouldDuckAndroid: false,
      staysActiveInBackground: false,
    });
    isConfigured = true;
  } catch (e) {
    console.warn("Could not configure audio mode:", e);
  }
}

/**
 * Speaks text using the device's Text-To-Speech engine.
 * Automatically handles routing to loudspeaker and fallback voices.
 */
export async function speakNative(text: string, language = "hi-IN"): Promise<void> {
  if (!text || !text.trim()) return;

  try {
    await ensureLoudspeaker();

    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    // Convert Latin text to Devanagari phonetics if speaking in hi-IN
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
      rate: 0.85,
      onError: (err) => {
        console.warn("TTS primary speech failed, falling back to en-IN:", err);
        Speech.speak(text, {
          language: "en-IN",
          pitch: 1.0,
          rate: 0.85,
        });
      },
    });
  } catch (error) {
    console.warn("Speech error:", error);
    try {
      Speech.speak(text, { language: "en-IN", rate: 0.85 });
    } catch {}
  }
}

/**
 * High-level helper for speaking tribal language dialogue results.
 * Respects script characteristics and guarantees loudspeaker output:
 * - Mundari ('unr'): Native script is Devanagari, speaks native text directly.
 * - Santhali ('sat') & Ho ('hoc'): Native scripts are Ol Chiki and Warang Citi.
 *   Transliterates Roman phonetics to Devanagari for authentic Hindi TTS pronunciation,
 *   with automatic fallback to English voice so silence is NEVER produced.
 */
export async function speakDialogue(
  nativeText: string,
  romanText: string,
  langCode: string
): Promise<void> {
  if (!nativeText && !romanText) return;

  try {
    await ensureLoudspeaker();

    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    let textToSpeak = "";
    if (langCode === "unr" && nativeText) {
      textToSpeak = nativeText;
    } else {
      textToSpeak = toDevanagari(romanText) || romanText;
    }

    // First attempt: Hindi voice with Devanagari phonetics
    Speech.speak(textToSpeak, {
      language: "hi-IN",
      pitch: 1.0,
      rate: 0.82,
      onError: () => {
        // Fallback: English voice with Roman phonetics
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

/**
 * Tests speaker output with a clear greeting.
 */
export async function testSpeaker(): Promise<void> {
  try {
    await ensureLoudspeaker();
    await Speech.stop();
    Speech.speak("नमस्ते! भाषा सेतु ऑडियो चालू है।", {
      language: "hi-IN",
      pitch: 1.0,
      rate: 0.88,
      onError: () => {
        Speech.speak("Hello! Bhasha Setu audio is working.", {
          language: "en-IN",
          rate: 0.88,
        });
      },
    });
  } catch (err) {
    console.warn("Test speaker error:", err);
  }
}

/**
 * Plays a recorded local audio URI through loudspeaker.
 */
export async function playRecordedAudio(uri: string): Promise<void> {
  try {
    await ensureLoudspeaker();
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, volume: 1.0 }
    );
    await sound.playAsync();
  } catch (err) {
    console.warn("Failed to play audio URI:", err);
  }
}

export async function stopSpeech(): Promise<void> {
  try {
    await Speech.stop();
  } catch (error) {
    console.warn("Stop speech error:", error);
  }
}
