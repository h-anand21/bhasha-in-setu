import { Audio } from "expo-av";
import { resetLoudspeakerState, ensureLoudspeaker } from "./speech";

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

// Lightweight speech recording options: 16kHz mono AAC (10x smaller file size for instant upload)
const fastSpeechRecordingOptions: Audio.RecordingOptions = {
  isMeteringEnabled: false,
  android: {
    extension: ".m4a",
    outputFormat: Audio.AndroidOutputFormat.MPEG_4,
    audioEncoder: Audio.AndroidAudioEncoder.AAC,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 32000,
  },
  ios: {
    extension: ".m4a",
    outputFormat: Audio.IOSOutputFormat.MPEG4AAC,
    audioQuality: Audio.IOSAudioQuality.LOW,
    sampleRate: 16000,
    numberOfChannels: 1,
    bitRate: 32000,
    linearPCMBitDepth: 16,
    linearPCMIsBigEndian: false,
    linearPCMIsFloat: false,
  },
  web: {
    mimeType: "audio/webm",
    bitsPerSecond: 32000,
  },
};

/**
 * Requests microphone permission and starts fast speech-optimized audio recording.
 */
export async function startAudioRecording(): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    resetLoudspeakerState();

    const perm = await Audio.requestPermissionsAsync();
    if (!perm.granted) {
      return {
        success: false,
        error:
          "Microphone permission was denied. Please allow microphone access in device settings.",
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
      } catch (err) {
        console.warn("Dangling recording cleanup error:", err);
      }
      activeRecording = null;
    }

    const { recording } = await Audio.Recording.createAsync(fastSpeechRecordingOptions);

    activeRecording = recording;
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Could not initialize device microphone.";
    console.warn("Failed to start audio recording:", errorMsg);
    return {
      success: false,
      error: errorMsg,
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

    // Immediately restore audio mode to playback through LOUDSPEAKER so speech starts with zero delay
    await ensureLoudspeaker();

    return {
      success: true,
      uri,
      durationMillis: status.durationMillis,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to finalize audio recording.";
    console.warn("Failed to stop recording:", errorMsg);
    activeRecording = null;
    return {
      success: false,
      error: errorMsg,
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
    } catch (err) {
      console.warn("Cancel recording error:", err);
    }
    activeRecording = null;
  }
}

/**
 * Transcribes captured audio using Whisper AI with fast timeout.
 */
export async function transcribeAudioFile(fileUri: string): Promise<STTResult> {
  if (!fileUri) {
    return { success: false, error: "No audio file provided." };
  }

  try {
    const filename = fileUri.split("/").pop() || "recording.m4a";
    const formData = new FormData();
    // @ts-expect-error - React Native FormData accepts uri object
    formData.append("files", {
      uri: fileUri,
      name: filename,
      type: "audio/m4a",
    });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4500);

    // 1. Upload audio to Gradio space
    const uploadRes = await fetch("https://openai-whisper.hf.space/gradio_api/upload", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!uploadRes.ok) {
      clearTimeout(timeout);
      throw new Error(`Audio upload failed (${uploadRes.status})`);
    }

    const uploadedFiles = await uploadRes.json();
    if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
      clearTimeout(timeout);
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
      signal: controller.signal,
    });

    if (!callRes.ok) {
      clearTimeout(timeout);
      throw new Error(`Speech model failed (${callRes.status})`);
    }

    const { event_id } = await callRes.json();
    if (!event_id) {
      clearTimeout(timeout);
      throw new Error("No transcription session created");
    }

    // 3. Retrieve transcription result
    const resultRes = await fetch(
      `https://openai-whisper.hf.space/gradio_api/call/predict/${event_id}`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);
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
        } catch (jsonErr) {
          console.warn("STT JSON parse line error:", jsonErr);
        }
      }
    }

    return {
      success: false,
      error: "Could not detect clear speech in the audio.",
    };
  } catch (err: unknown) {
    const errorMsg =
      err instanceof Error ? err.message : "Speech-to-text service is currently unavailable.";
    console.warn("STT transcription error:", errorMsg);
    return {
      success: false,
      error: errorMsg,
    };
  }
}
