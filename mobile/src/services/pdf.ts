import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { type LangMeta } from "../lib/lexicon";

export type PrintableWorksheetData = {
  topicLabel: string;
  topicLabelEn: string;
  langMeta: LangMeta;
  lessonTitle: string;
  lessonOutcome: string;
  matchWords: { hindi: string; native: string; roman: string; emoji: string }[];
  fillBlanks: string[];
  lessonSentences: { hindi: string; native: string; roman: string }[];
};

export async function generateAndShareWorksheetPDF(data: PrintableWorksheetData): Promise<void> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Bilingual Worksheet — ${data.topicLabelEn}</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      padding: 30px;
      color: #1F2937;
      background: #FFFFFF;
    }
    .header {
      border-bottom: 2px solid #C85A32;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    .badge {
      display: inline-block;
      background: #FCEEEA;
      color: #C85A32;
      font-size: 11px;
      font-weight: bold;
      padding: 4px 10px;
      border-radius: 6px;
      margin-bottom: 8px;
    }
    h1 {
      font-size: 24px;
      margin: 0;
      color: #111827;
    }
    .meta-row {
      display: flex;
      justify-content: space-between;
      font-size: 12px;
      color: #4B5563;
      margin-top: 6px;
    }
    .student-fields {
      display: flex;
      justify-content: space-between;
      margin-top: 15px;
      padding: 10px;
      background: #F9F6F0;
      border-radius: 8px;
      font-size: 12px;
      font-weight: bold;
    }
    .block {
      margin-top: 24px;
      padding-top: 14px;
      border-top: 1px dashed #E5DFD5;
    }
    .block-title {
      font-size: 14px;
      font-weight: bold;
      color: #C85A32;
      margin-bottom: 12px;
    }
    .match-table {
      width: 100%;
      border-collapse: collapse;
    }
    .match-table td {
      padding: 8px 12px;
      font-size: 15px;
    }
    .tribal-word {
      font-size: 18px;
      color: #2E3A59;
      font-weight: bold;
    }
    .blank-line {
      display: inline-block;
      width: 180px;
      border-bottom: 1px dashed #4B5563;
      margin-left: 10px;
    }
    .drawing-box {
      border: 2px dashed #C85A32;
      border-radius: 12px;
      height: 120px;
      margin-top: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #9CA3AF;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="badge">NIPUN BHARAT FOUNDATIONAL LITERACY & NUMERACY</div>
    <h1>Bilingual Practice Worksheet — ${data.topicLabelEn} (${data.topicLabel})</h1>
    <div class="meta-row">
      <span>Language: <strong>Hindi + ${data.langMeta.name} (${data.langMeta.script})</strong></span>
      <span>${data.lessonTitle}</span>
    </div>
    <div class="student-fields">
      <span>Student Name: __________________________</span>
      <span>Class: _________</span>
      <span>Date: ____________</span>
    </div>
  </div>

  <div class="block">
    <div class="block-title">अभ्यास 1: सही जोड़ी मिलाओ (Match the Hindi word with ${data.langMeta.name})</div>
    <table class="match-table">
      ${data.matchWords
        .map(
          (w) => `
        <tr>
          <td style="width: 45%;"><strong>${w.emoji} ${w.hindi}</strong> ○</td>
          <td style="width: 10%; text-align: center;"></td>
          <td style="width: 45%;">○ <span class="tribal-word">${w.native}</span> <em>(${w.roman})</em></td>
        </tr>
      `
        )
        .join("")}
    </table>
  </div>

  <div class="block">
    <div class="block-title">अभ्यास 2: रिक्त स्थान भरो (Write the mother-tongue translation)</div>
    <ol style="font-size: 14px; line-height: 2;">
      ${data.fillBlanks
        .map(
          (w, i) => `
        <li>${w} = <span class="blank-line"></span></li>
      `
        )
        .join("")}
    </ol>
  </div>

  <div class="block">
    <div class="block-title">अभ्यास 3: पाठ के वाक्य पढ़ो और बोलो (Read and Practice Aloud)</div>
    <ol style="font-size: 14px; line-height: 1.8;">
      ${data.lessonSentences
        .map(
          (s) => `
        <li>
          <div><strong>${s.hindi}</strong></div>
          <div class="tribal-word">${s.native}</div>
          <div style="font-size: 11px; color: #6B7280; font-style: italic;">${s.roman}</div>
        </li>
      `
        )
        .join("")}
    </ol>
  </div>

  <div class="block">
    <div class="block-title">अभ्यास 4: चित्र बनाओ (Draw a picture of ${data.matchWords[0]?.hindi || "प्रकृति"})</div>
    <div class="drawing-box">
      Draw here • Draw the picture and color it
    </div>
  </div>
</body>
</html>
  `;

  try {
    const { uri } = await Print.printToFileAsync({ html });
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
        dialogTitle: `Worksheet — ${data.topicLabelEn}`,
      });
    } else {
      await Print.printAsync({ html });
    }
  } catch (err) {
    console.warn("PDF generation error:", err);
  }
}
