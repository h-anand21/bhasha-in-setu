import * as Speech from "expo-speech";

export async function speakNative(text: string, language = "hi-IN"): Promise<void> {
  if (!text || !text.trim()) return;

  try {
    const isSpeaking = await Speech.isSpeakingAsync();
    if (isSpeaking) {
      await Speech.stop();
    }

    Speech.speak(text, {
      language,
      pitch: 1.0,
      rate: 0.85, // slightly slower for foundational primary learners
    });
  } catch (error) {
    console.warn("Speech error:", error);
  }
}

export async function stopSpeech(): Promise<void> {
  try {
    await Speech.stop();
  } catch (error) {
    console.warn("Stop speech error:", error);
  }
}
