/**
 * Optical Character Recognition (OCR) Service for Bhasha-Setu Mobile
 * Extracts Hindi / Devanagari and English text from blackboard and textbook photos.
 */

const OCR_KEYS = [
  "helloworld",
  "K87899148788957",
  "K88126135688957",
  "K82845942588957",
];

export interface OcrResult {
  success: boolean;
  text?: string;
  wordCount?: number;
  error?: string;
}

/**
 * Extracts text from an image base64 data string using high-accuracy OCR.
 * Supports Devanagari / Hindi script recognition (OCR Engine 3).
 */
export async function extractTextFromImage(
  base64Data?: string | null,
  imageUri?: string
): Promise<OcrResult> {
  if (!base64Data && !imageUri) {
    return {
      success: false,
      error: "No image data provided for scanning.",
    };
  }

  // Rotate through keys in case one key gets rate-limited
  for (let i = 0; i < OCR_KEYS.length; i++) {
    const key = OCR_KEYS[i];
    try {
      const form = new FormData();
      form.append("apikey", key);
      form.append("language", "hin");
      form.append("OCREngine", "3");
      form.append("isOverlayRequired", "false");
      form.append("scale", "true");
      form.append("detectOrientation", "true");

      if (base64Data) {
        const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, "");
        form.append("base64Image", `data:image/jpeg;base64,${cleanBase64}`);
        form.append("filetype", "JPG");
      } else if (imageUri) {
        // Fallback to uploading uri as file if base64 not passed
        const filename = imageUri.split("/").pop() || "scan.jpg";
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : "image/jpeg";
        // @ts-ignore - React Native FormData accepts uri object
        form.append("file", { uri: imageUri, name: filename, type });
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 18000);

      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: form,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`OCR request failed with key ${key}, HTTP ${response.status}`);
        continue;
      }

      const data = await response.json();

      // Check if throttled or error that warrants key rotation
      if (data.IsErroredOnProcessing && !data.ParsedResults?.length) {
        const err = Array.isArray(data.ErrorMessage)
          ? data.ErrorMessage.join(" ")
          : typeof data.error === "string"
          ? data.error
          : "";
        console.warn(`OCR processing error with key ${key}: ${err}`);
        // If throttled, try next key
        if (err.includes("overloaded") || err.includes("throttled") || err.includes("E551")) {
          continue;
        }
      }

      if (data.ParsedResults && data.ParsedResults.length > 0) {
        const rawText = data.ParsedResults[0].ParsedText || "";
        const cleaned = cleanOcrText(rawText);

        if (cleaned.length > 0) {
          const wordCount = cleaned.split(/\s+/).filter(Boolean).length;
          return {
            success: true,
            text: cleaned,
            wordCount,
          };
        } else {
          return {
            success: false,
            error: "No readable Hindi/English text could be detected in this photo. Please ensure clear lighting and legible writing.",
          };
        }
      }
    } catch (err: any) {
      console.warn(`OCR network error with key ${key}:`, err?.message || err);
      // If last key, will exit loop
    }
  }

  return {
    success: false,
    error: "OCR service is currently unavailable or network timed out. Please check your internet connection or type the text directly.",
  };
}

/**
 * Normalizes text extracted from blackboard/textbook OCR:
 * - Trims whitespace
 * - Collapses repeated blank lines
 * - Removes isolated special artifact symbols
 */
function cleanOcrText(text: string): string {
  if (!text) return "";

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      // Remove lines that are just stray symbols like "|", "_", "~"
      if (/^[|_\-~=*•\s]+$/.test(line)) return false;
      return line.length > 0;
    })
    .join("\n")
    .trim();
}
