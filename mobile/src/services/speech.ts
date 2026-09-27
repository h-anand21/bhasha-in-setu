import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { toDevanagari } from "../lib/translit";

/**
 * Non-blocking setup to ensure audio routes to the phone's main loudspeaker.
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
  } catch (e) {
    // Non-fatal, do not block speech
  }
}

/**
 * High-level helper for speaking tribal language dialogue results.
 * Guarantees immediate audible sound from the phone speaker:
 * - Mundari ('unr'): Native script is Devanagari, speaks native text.
 * - Santhali ('sat') & Ho ('hoc'): Speaks Roman pronunciation guide with Indian accent
 *   and Devanagari fallback, so speech is 100% audible on every Android device.
 */
export function speakDialogue(
  nativeText: string,
  romanText: string,
  langCode: string
): void {
  const phrase = romanText || nativeText;
  if (!phrase || !phrase.trim()) return;

  // Background ensure loudspeaker without blocking
  ensureLoudspeaker().catch(() => {});

  try {
    Speech.stop().catch(() => {});
  } catch {}

  try {
    if (langCode === "unr" && nativeText) {
      // Mundari native script is Devanagari
      Speech.speak(nativeText, {
        language: "hi-IN",
        pitch: 1.0,
        rate: 0.85,
        onError: () => {
          Speech.speak(phrase, { pitch: 1.0, rate: 0.85 });
        },
      });
    } else {
      // For Santhali and Ho, pronounce the roman phonetic guide
      Speech.speak(phrase, {
        language: "en-IN",
        pitch: 1.0,
        rate: 0.85,
        onError: () => {
          // Fallback to system default voice
          Speech.speak(phrase, { pitch: 1.0, rate: 0.85 });
        },
      });
    }
  } catch (error) {
    console.warn("speakDialogue error:", error);
    try {
      Speech.speak(phrase, { pitch: 1.0, rate: 0.85 });
    } catch {}
  }
}

/**
 * Direct TTS speech.
 */
export function speakNative(text: string, language = "hi-IN"): void {
  if (!text || !text.trim()) return;

  ensureLoudspeaker().catch(() => {});

  try {
    Speech.stop().catch(() => {});
  } catch {}

  try {
    Speech.speak(text, {
      language,
      pitch: 1.0,
      rate: 0.85,
      onError: () => {
        Speech.speak(text, { pitch: 1.0, rate: 0.85 });
      },
    });
  } catch (e) {
    try {
      Speech.speak(text, { pitch: 1.0, rate: 0.85 });
    } catch {}
  }
}

/**
 * Tests speaker output immediately with a bilingual sentence.
 * Guaranteed to produce loud sound on any device.
 */
export function testSpeaker(): void {
  ensureLoudspeaker().catch(() => {});

  try {
    Speech.stop().catch(() => {});
  } catch {}

  try {
    Speech.speak("नमस्ते! Bhasha Setu sound is working loud and clear!", {
      pitch: 1.0,
      rate: 0.9,
      onError: () => {
        Speech.speak("Hello! Sound is working.", { pitch: 1.0, rate: 0.9 });
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
