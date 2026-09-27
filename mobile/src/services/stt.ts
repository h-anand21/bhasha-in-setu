import { Audio } from "expo-av";

export interface AudioRecordingState {
  isRecording: boolean;
  durationMillis: number;
  uri?: string;
}

export interface STTResult {
  success: boolean;
  text?: string;
  error?: string;
}

let activeRecording: Audio.Recording | null = null;

/**
 * Requests microphone permission and starts high-quality audio recording.
 */
export async function startAudioRecording(): Promise<{ success: boolean; error?: string }> {
  try {
    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      return {
        success: false,
        error: "Microphone permission was denied. Please allow microphone access in device settings.",
      };
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });

    // If previous recording was dangling, stop it
    if (activeRecording) {
      try {
        await activeRecording.stopAndUnloadAsync();
      } catch {}
      activeRecording = null;
    }

    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY
    );

    activeRecording = recording;
    return { success: true };
  } catch (err: any) {
    console.warn("Failed to start audio recording:", err);
    return {
      success: false,
      error: err?.message || "Could not initialize device microphone.",
    };
  }
}

/**
 * Stops audio recording and returns the local file URI of the captured audio.
 */
export async function stopAudioRecording(): Promise<{
  success: boolean;
  uri?: string;
  durationMillis?: number;
  error?: string;
}> {
  if (!activeRecording) {
    return { success: false, error: "No active recording found." };
  }

  try {
    const status = await activeRecording.getStatusAsync();
    await activeRecording.stopAndUnloadAsync();
    const uri = activeRecording.getURI() || undefined;
    activeRecording = null;

    // Reset audio mode to playback through LOUDSPEAKER
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: false,
      shouldDuckAndroid: false,
      staysActiveInBackground: false,
    });

    return {
      success: true,
      uri,
      durationMillis: status.durationMillis,
    };
  } catch (err: any) {
    console.warn("Failed to stop recording:", err);
    activeRecording = null;
    return {
      success: false,
      error: err?.message || "Failed to finalize audio recording.",
    };
  }
}

/**
 * Cancels active recording without saving.
 */
export async function cancelAudioRecording(): Promise<void> {
  if (activeRecording) {
    try {
      await activeRecording.stopAndUnloadAsync();
    } catch {}
    activeRecording = null;
  }
}

/**
 * Transcribes captured audio using Whisper AI.
 * Uploads audio file, runs transcription, and extracts recognized Hindi text.
 */
export async function transcribeAudioFile(fileUri: string): Promise<STTResult> {
  if (!fileUri) {
    return { success: false, error: "No audio file provided." };
  }

  try {
    const filename = fileUri.split("/").pop() || "recording.m4a";
    const formData = new FormData();
    // @ts-ignore - React Native FormData accepts uri object
    formData.append("files", {
      uri: fileUri,
      name: filename,
      type: "audio/m4a",
    });

    // 1. Upload audio to Gradio space
    const uploadRes = await fetch("https://openai-whisper.hf.space/gradio_api/upload", {
      method: "POST",
      body: formData,
    });

    if (!uploadRes.ok) {
      throw new Error(`Audio upload failed (${uploadRes.status})`);
    }

    const uploadedFiles = await uploadRes.json();
    if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
      throw new Error("Invalid response from audio server");
    }

    const serverPath = uploadedFiles[0];

    // 2. Call whisper predict
    const callRes = await fetch("https://openai-whisper.hf.space/gradio_api/call/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            path: serverPath,
            meta: { _type: "gradio.FileData" },
          },
          "transcribe",
        ],
      }),
    });

    if (!callRes.ok) {
      throw new Error(`Speech model failed (${callRes.status})`);
    }

    const { event_id } = await callRes.json();
    if (!event_id) {
      throw new Error("No transcription session created");
    }

    // 3. Retrieve transcription result
    const resultRes = await fetch(
      `https://openai-whisper.hf.space/gradio_api/call/predict/${event_id}`
    );
    const sseText = await resultRes.text();

    const lines = sseText.split("\n");
    for (const line of lines) {
      if (line.startsWith("data:")) {
        try {
          const raw = line.replace(/^data:\s*/, "").trim();
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && typeof parsed[0] === "string") {
            const cleanText = parsed[0].trim();
            if (cleanText) {
              return { success: true, text: cleanText };
            }
          }
        } catch {}
      }
    }

    return {
      success: false,
      error: "Could not detect clear speech in the audio. Please try speaking closer to the mic.",
    };
  } catch (err: any) {
    console.warn("STT transcription error:", err);
    return {
      success: false,
      error: err?.message || "Speech-to-text service is currently unavailable.",
    };
  }
}
