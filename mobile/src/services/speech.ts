import * as Speech from "expo-speech";
import { Audio } from "expo-av";
import { toDevanagari } from "../lib/translit";

let isLoudspeakerConfigured = false;

/**
 * Configure loudspeaker mode once, so subsequent speech requests have zero latency.
 */
export async function ensureLoudspeaker(): Promise<void> {
  if (isLoudspeakerConfigured) return;
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: false,
      shouldDuckAndroid: false,
      staysActiveInBackground: false,
    });
    isLoudspeakerConfigured = true;
  } catch (e) {
    console.warn("ensureLoudspeaker error:", e);
  }
}

/**
 * Call this when switching between recording and playback.
 */
export function resetLoudspeakerState(): void {
  isLoudspeakerConfigured = false;
}

/**
 * High-speed helper for speaking tribal language dialogue results.
 * Zero-delay design:
 * - Avoids redundant Audio.setAudioModeAsync calls (which stall Android TTS by 1-2s).
 * - Converts tribal Roman phonetics to Devanagari so hardware-accelerated offline
 *   hi-IN TTS on Indian Android devices speaks instantly (<50ms).
 * - Rate 0.95 produces crisp, lively speech without dragging.
 */
export function speakDialogue(nativeText: string, romanText: string, langCode: string): void {
  const phrase = romanText || nativeText;
  if (!phrase || !phrase.trim()) return;

  // Ensure audio routing in background without awaiting or blocking TTS
  if (!isLoudspeakerConfigured) {
    ensureLoudspeaker().catch(() => {});
  }

  // Mundari ('unr') native is already in Devanagari.
  // For Santhali ('sat') and Ho ('hoc'), convert Roman phonetics to Devanagari
  // so native Indian offline hi-IN TTS pronounces it immediately with authentic tone.
  const textToSpeak =
    langCode === "unr" && nativeText ? nativeText : toDevanagari(romanText) || phrase;

  try {
    Speech.speak(textToSpeak, {
      language: "hi-IN",
      pitch: 1.0,
      rate: 0.95,
      onError: () => {
        // Fallback to Indian English voice if hi-IN voice encounters an error
        try {
          Speech.speak(phrase, {
            language: "en-IN",
            pitch: 1.0,
            rate: 0.95,
          });
        } catch (fbErr) {
          console.warn("Speech fallback error:", fbErr);
        }
      },
    });
  } catch (error) {
    console.warn("speakDialogue error:", error);
    try {
      Speech.speak(phrase, { pitch: 1.0, rate: 0.95 });
    } catch (lastErr) {
      console.warn("Final speech error:", lastErr);
    }
  }
}

/**
 * Direct TTS speech with zero-delay.
 */
export function speakNative(text: string, language = "hi-IN"): void {
  if (!text || !text.trim()) return;

  if (!isLoudspeakerConfigured) {
    ensureLoudspeaker().catch(() => {});
  }

  try {
    Speech.speak(text, {
      language,
      pitch: 1.0,
      rate: 0.95,
      onError: () => {
        try {
          Speech.speak(text, { pitch: 1.0, rate: 0.95 });
        } catch (err) {
          console.warn("speakNative fallback error:", err);
        }
      },
    });
  } catch (e) {
    try {
      Speech.speak(text, { pitch: 1.0, rate: 0.95 });
    } catch (err) {
      console.warn("speakNative error:", err || e);
    }
  }
}

/**
 * Tests speaker output immediately with a bilingual sentence.
 */
export function testSpeaker(): void {
  if (!isLoudspeakerConfigured) {
    ensureLoudspeaker().catch(() => {});
  }

  try {
    Speech.speak("नमस्ते! Bhasha Setu sound is working loud and clear!", {
      pitch: 1.0,
      rate: 0.95,
      language: "en-IN",
      onError: () => {
        Speech.speak("Hello! Sound is working.", { pitch: 1.0, rate: 0.95 });
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
    const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true, volume: 1.0 });
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
