import { Audio } from "expo-av";

export interface AudioRecordingState {
  isRecording: boolean;
  durationMillis: number;
  uri?: string;
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
      shouldDuckAndroid: true,
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

    // Reset audio mode to playback
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
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
