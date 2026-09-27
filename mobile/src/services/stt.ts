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
  provider?: "groq" | "huggingface" | "none";
}

let activeRecording: Audio.Recording | null = null;

// ─── Groq API Key ───────────────────────────────────────────────
// Free tier: https://console.groq.com — get your key there
// whisper-large-v3-turbo: Hindi-optimized, ultra fast (~1-2s)
const GROQ_API_KEY = "gsk_FreeKeyPlaceholder";

/**
 * Requests microphone permission and starts audio recording.
 * Uses HIGH_QUALITY preset for better speech recognition accuracy.
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
        console.warn("Dangling recording cleanup:", err);
      }
      activeRecording = null;
    }

    // Use HIGH_QUALITY preset: better audio for speech recognition
    const { recording } = await Audio.Recording.createAsync(
      Audio.RecordingOptionsPresets.HIGH_QUALITY,
    );

    activeRecording = recording;
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Could not initialize device microphone.";
    console.warn("Failed to start audio recording:", errorMsg);
    return { success: false, error: errorMsg };
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

    // Restore audio mode for loudspeaker playback immediately
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      playThroughEarpieceAndroid: false,
      shouldDuckAndroid: false,
      staysActiveInBackground: false,
    });
    // Also restore the cached loudspeaker state for speech.ts
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
    return { success: false, error: errorMsg };
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

// ─────────────────────────────────────────────────────────────────
// PRIMARY: Groq Whisper API (whisper-large-v3-turbo)
// Free tier, blazing fast (~1-2s), excellent Hindi support
// ─────────────────────────────────────────────────────────────────
async function transcribeWithGroq(fileUri: string): Promise<STTResult> {
  const filename = fileUri.split("/").pop() || "recording.m4a";
  const ext = filename.split(".").pop()?.toLowerCase() || "m4a";

  // Map file extension to proper MIME type
  const mimeMap: Record<string, string> = {
    m4a: "audio/m4a",
    mp4: "audio/mp4",
    wav: "audio/wav",
    webm: "audio/webm",
    mp3: "audio/mpeg",
    ogg: "audio/ogg",
    flac: "audio/flac",
  };
  const mimeType = mimeMap[ext] || "audio/m4a";

  const formData = new FormData();
  // @ts-expect-error - React Native FormData accepts uri object
  formData.append("file", {
    uri: fileUri,
    name: filename,
    type: mimeType,
  });
  formData.append("model", "whisper-large-v3-turbo");
  formData.append("language", "hi"); // Hindi hint for better accuracy
  formData.append("response_format", "json");
  // Prompt hint helps Whisper understand context (classroom Hindi)
  formData.append("prompt", "कक्षा में हिंदी बोल रहे हैं। शिक्षक छात्रों से बात कर रहे हैं।");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    console.log("[STT] Trying Groq Whisper...");
    const res = await fetch("https://api.groq.com/openai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: formData,
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "");
      console.warn(`[STT] Groq failed (${res.status}):`, errBody);
      throw new Error(`Groq API error (${res.status})`);
    }

    const data = await res.json();
    const text = (data.text || "").trim();

    if (!text) {
      throw new Error("Groq returned empty transcription");
    }

    console.log("[STT] Groq success:", text);
    return { success: true, text, provider: "groq" };
  } catch (err) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : "Groq STT failed";
    console.warn("[STT] Groq error:", msg);
    return { success: false, error: msg, provider: "groq" };
  }
}

// ─────────────────────────────────────────────────────────────────
// FALLBACK: HuggingFace Whisper Gradio Space
// Free, no API key needed, but slower (3 network calls)
// ─────────────────────────────────────────────────────────────────
async function transcribeWithHuggingFace(fileUri: string): Promise<STTResult> {
  const filename = fileUri.split("/").pop() || "recording.m4a";
  const formData = new FormData();
  // @ts-expect-error - React Native FormData accepts uri object
  formData.append("files", {
    uri: fileUri,
    name: filename,
    type: "audio/m4a",
  });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    console.log("[STT] Trying HuggingFace Whisper fallback...");

    // 1. Upload audio to Gradio space
    const uploadRes = await fetch("https://openai-whisper.hf.space/gradio_api/upload", {
      method: "POST",
      body: formData,
      signal: controller.signal,
    });

    if (!uploadRes.ok) {
      throw new Error(`HF upload failed (${uploadRes.status})`);
    }

    const uploadedFiles = await uploadRes.json();
    if (!Array.isArray(uploadedFiles) || uploadedFiles.length === 0) {
      throw new Error("Invalid response from HF audio server");
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
      throw new Error(`HF predict failed (${callRes.status})`);
    }

    const { event_id } = await callRes.json();
    if (!event_id) {
      throw new Error("No HF transcription session created");
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
              console.log("[STT] HuggingFace success:", cleanText);
              return { success: true, text: cleanText, provider: "huggingface" };
            }
          }
        } catch (jsonErr) {
          console.warn("[STT] HF JSON parse error:", jsonErr);
        }
      }
    }

    throw new Error("HF could not detect speech in audio");
  } catch (err) {
    clearTimeout(timeout);
    const msg = err instanceof Error ? err.message : "HuggingFace STT failed";
    console.warn("[STT] HuggingFace error:", msg);
    return { success: false, error: msg, provider: "huggingface" };
  }
}

// ─────────────────────────────────────────────────────────────────
// MAIN ENTRY: Try Groq first, fallback to HuggingFace
// ─────────────────────────────────────────────────────────────────
/**
 * Transcribes captured audio to Hindi text.
 *
 * Strategy: Groq Whisper (primary, fast ~1-2s) → HuggingFace Whisper (fallback)
 * Both support Hindi natively.
 */
export async function transcribeAudioFile(fileUri: string): Promise<STTResult> {
  if (!fileUri) {
    return { success: false, error: "No audio file provided.", provider: "none" };
  }

  const hasGroqKey = GROQ_API_KEY && !GROQ_API_KEY.includes("Placeholder") && GROQ_API_KEY.startsWith("gsk_");

  // 1. Try Groq Whisper first (fast, accurate Hindi) — only if key is configured
  if (hasGroqKey) {
    const groqResult = await transcribeWithGroq(fileUri);
    if (groqResult.success && groqResult.text) {
      return groqResult;
    }
    console.log("[STT] Groq failed, trying HuggingFace fallback...");
  } else {
    console.log("[STT] No Groq API key configured, using HuggingFace directly...");
  }

  // 2. Fallback to HuggingFace Whisper
  const hfResult = await transcribeWithHuggingFace(fileUri);
  if (hfResult.success && hfResult.text) {
    return hfResult;
  }

  // Both failed
  return {
    success: false,
    error:
      "आवाज़ पहचान नहीं हो पाई। कृपया साफ़ आवाज़ में बोलें या नीचे phrase चुनें।",
    provider: "none",
  };
}
