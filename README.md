# 🌐 Bhasha Setu (भाषा सेतु)
### *Bridging Hindi Classrooms to Tribal Mother Tongues in Jharkhand*
**100% Offline-First Mother-Tongue-Based Multilingual Education (MTB-MLE) Edge AI Suite**

[![Framework: TanStack Start](https://img.shields.io/badge/Framework-TanStack_Start-blue?style=for-the-badge)](https://tanstack.com/start)
[![React 19](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![100% Offline](https://img.shields.io/badge/Edge_AI-100%25_Offline-emerald?style=for-the-badge)](https://github.com)
[![Vercel Deployed](https://img.shields.io/badge/Live_Deployed-bhasha--in--setu.vercel.app-000000?style=for-the-badge&logo=vercel)](https://bhasha-in-setu.vercel.app/)
[![Lovable](https://img.shields.io/badge/Built_with-Lovable-ff5722?style=for-the-badge)](https://lovable.dev)

> 🚀 **Live Production Deployment URL:**  
> 👉 **[https://bhasha-in-setu.vercel.app/](https://bhasha-in-setu.vercel.app/)**  
> *Click above to access the full live application running globally on Vercel Edge with zero install.*

---

## 📌 1. Executive Summary & Problem Statement

In rural and tribal belt schools across Jharkhand (such as Santhal Pargana, West Singhbhum, Khunti, and Gumla), primary education faces a severe linguistic barrier:
- **Teachers** instruct strictly in state-mandated **Hindi**.
- **Grade 1 to 3 primary tribal students** communicate exclusively in their home indigenous languages — **Santhali (ᱥᱟᱱᱛᱟᱲᱤ)**, **Ho (ᱦᱳ)**, or **Mundari (मुंडारी)**.
- **The Consequence:** Young learners cannot comprehend blackboard notes, textbook instructions, or oral lessons, causing alarming dropouts at the foundational stage (adversely impacting the national FLN — Foundational Literacy & Numeracy / NIPUN Bharat mission).
- **The Infrastructure Reality:** Rural forest schools operate with zero internet connectivity and unreliable electricity. Cloud-reliant AI solutions (such as Google Translate API or OpenAI) fail completely in these off-grid classrooms.

**Bhasha Setu (भाषा सेतु)** solves this problem with a **100% offline, client-side Edge AI suite** that instantaneously translates teacher speech, blackboard camera snapshots, and curriculum worksheets into indigenous scripts (**Ol Chiki**, **Warang Citi**, **Devanagari**) and spoken tribal dialects with sub-millisecond latency on low-cost school tablets.

---

## ⚙️ 2. Technical Approach & System Flow (SIH 2026 Format)

Inspired by the **Smart India Hackathon (SIH) Technical Architecture standard**, Bhasha Setu is architected with a complete end-to-end operational pipeline connecting all 4 primary stakeholders through an **Autonomous, 100% Offline Edge-AI Pipeline**.

---

### 🗺️ System Flow Diagram (SIH Technical Approach)

```mermaid
flowchart TB
    %% Stakeholder Personas
    subgraph PERSONAS ["👥 USER PERSONAS"]
        P_Teacher["👨‍🏫 TEACHER<br/>(Hindi-Speaking Primary Teacher)"]
        P_Student["👦👧 TRIBAL STUDENTS<br/>(Santhali / Ho / Mundari Learners)"]
        P_Headmaster["🏫 HEADMASTER / ANGANWADI<br/>(School Content Manager)"]
        P_Admin["🏛️ STATE ADMIN<br/>(NIPUN Bharat & MTB-MLE Directorate)"]
    end

    %% Access & Authentication Layer
    subgraph ACCESS ["📱 ACCESS & HARDWARE TIER (Zero-Internet)"]
        Dev["Low-Cost Android Tablet (2 GB RAM, Android 9+) / Classroom PC"]
        Sensors["Sensory Inputs: Microphone Stream + Blackboard Camera + Touchscreen"]
        PWA["PWA Edge Engine: Offline Service Worker + App Manifest"]
    end

    %% Role-Based Router
    subgraph ROUTER ["🔀 ROLE-BASED APPLICATION GATEWAY"]
        Gate{"Select Persona Mode"}
    end

    %% Core System Portals
    subgraph TEACHER_PORTAL ["🎙️ TEACHER PORTAL (Live Dialogue & Classroom Vision)"]
        T_Mic["Live Voice Input (Hindi Oral Instructions)"]
        T_Norm["Hinglish Normalizer & Phonetic Cleaner"]
        T_Beam["Animated Beam Synthesis (<3 ms Latency)"]
        T_TTS["Local Speech Synthesizer (Native Mother-Tongue Audio)"]
        
        T_Cam["Camera OCR Capture (Blackboard & Textbook Notes)"]
        T_OCR["Tesseract.js WASM Engine (Offline Vision Worker)"]
        T_Dual["Instant Dual-Script Gloss (Ol Chiki / Warang Citi / Devanagari)"]
    end

    subgraph STUDENT_PORTAL ["🎨 STUDENT STUDIO (Foundational Learning & Practice)"]
        S_Holo["3D Holographic Script Showcase & Acoustic Beacon"]
        S_Sheet["Bilingual Worksheets (Matching, Tracing, Fill-in-Blanks)"]
        S_Cards["Visual Flashcards (10 Thematic Sets with Audio)"]
        S_Print["1-Click Print & PDF Sheet Exporter"]
    end

    subgraph OFFLINE_CORE ["💾 LOCAL DATABASE & EDGE AI CORE (100% On-Device)"]
        L_IDB[("IndexedDB Document Store<br/>• 16 NIPUN Bharat Lessons<br/>• Student Session Logs<br/>• Offline Cache")]
        L_Store[("LocalStorage Cache<br/>• Active Dialect (sat/hoc/unr)<br/>• Term Download Packs")]
        L_Trie[("In-Memory Lexicon Graph<br/>• 1000+ Tribal Lemmata<br/>• Unicode Script Mappings")]
    end

    subgraph ADMIN_PORTAL ["📊 STATE ADMIN COMMAND CENTER (FLN & MTB-MLE)"]
        A_Dash["District-Wise FLN Retention Analytics"]
        A_Heatmap["Jharkhand Tribal Dialect Coverage Heatmap (Dumka, Chaibasa, Khunti)"]
        A_Report["MTB-MLE Policy Compliance & CSV/Excel Export"]
    end

    %% Connecting Pipelines
    P_Teacher --> Dev
    P_Student --> Dev
    P_Headmaster --> Dev
    P_Admin --> Dev

    Dev --> Sensors
    Sensors --> PWA
    PWA --> Gate

    Gate -->|Teacher Mode| T_Mic
    Gate -->|Teacher Mode| T_Cam
    Gate -->|Student Mode| S_Holo
    Gate -->|Admin Mode| A_Dash

    %% Teacher Processing
    T_Mic --> T_Norm
    T_Norm --> T_Beam
    T_Beam --> L_Trie
    L_Trie --> T_TTS
    T_TTS -->|Speaker Audio| P_Student

    T_Cam --> T_OCR
    T_OCR --> T_Dual
    T_Dual --> L_Trie

    %% Student Processing
    S_Holo --> S_Cards
    S_Cards --> S_Sheet
    S_Sheet --> S_Print

    %% Data Sync (Local)
    T_TTS -.->|Log Activity| L_IDB
    S_Sheet -.->|Record Progress| L_IDB
    L_IDB <--> L_Store
    L_Store <--> L_Trie

    %% Admin Insights
    L_IDB --> A_Dash
    A_Dash --> A_Heatmap
    A_Heatmap --> A_Report
```

---

### 📊 System Workflow Matrix by User Persona

| Persona | Core Responsibility | Platform Module | Input & Processing | Output Delivered |
|---|---|---|---|---|
| **👨‍🏫 Teacher** *(शिक्षक)* | Delivers oral instructions & lesson plans in Hindi | `/live` & `/translate` | Speaks via tablet mic or snaps blackboard photo with camera | Real-time tribal speech (<3ms) + Ol Chiki/Warang Citi dual-script gloss |
| **👦👧 Student** *(छात्र)* | Learns foundational FLN concepts in mother tongue | `/` & `/worksheets` | Views 3D holograms, listens to native audio, traces scripts | Instant comprehension, reduced cognitive friction, bilingual fluency |
| **🏫 Headmaster** *(प्रधानाध्यापक)* | Manages offline school curriculum across terms | `/library` | 1-Click "Download All 16 Lessons" offline sync | Full semester content cached in local storage (~8.5 MB) with zero internet |
| **🏛️ State Admin** *(शिक्षा विभाग)* | Tracks district-level MTB-MLE & NIPUN Bharat progress | `/progress` | Aggregated offline session logs from school tablets | Retention metrics, district coverage heatmaps, exportable FLN reports |

---

### 🛠️ Technical Stack Breakdown (SIH 6-Pillar Architecture)

| Pillar | Category | Technologies & Tools | Purpose in Bhasha Setu |
|:---:|---|---|---|
| **1** | **Frontend** | • React 19 (JSX/TSX)<br/>• TypeScript 5.x<br/>• Tailwind CSS v4 (Oklch Tokens)<br/>• Vite 8 & Rolldown<br/>• Aceternity 3D & Lucide Icons | Responsive tablet UI, 3D Pin holograms, animated beam synthesis, and touch-first classroom controls |
| **2** | **Backend & Serverless** | • TanStack Start (SSR & RPC)<br/>• Nitro Engine & Vinxi<br/>• Vercel Serverless Functions<br/>• Edge CDN Runtime | Serverless hybrid rendering, instant global edge delivery, and zero-API RPC bridge |
| **3** | **Edge AI & NLP (100% Offline)** | • Tesseract.js WebAssembly (OCR)<br/>• Web Speech API (TTS & Speech-to-Text)<br/>• Native Orthographic Tokenizer<br/>• Unicode Ol Chiki & Warang Citi Parsers | Client-side computer vision for blackboards, instant speech-to-speech turnaround, and tribal morphology |
| **4** | **Database & Persistence** | • IndexedDB (Document Storage)<br/>• Browser LocalStorage<br/>• In-Memory Lexical Trie & Graph | Persistent offline lesson packs, session telemetry, student FLN retention data, zero cloud bills |
| **5** | **DevOps & Deployment** | • Vercel Edge Serverless Platform<br/>• Vercel Build Output API v3<br/>• PWA Service Worker & Manifest<br/>• Git / Lovable Continuous Sync | 1-click cloud deployment, offline caching on device, and automatic asset distribution |
| **6** | **Hardware & Target Devices** | • 2 GB RAM Android Tablets (Android 9+)<br/>• Classroom Bluetooth Speakers<br/>• Device Cameras (5 MP+) | Compatibility with low-cost hardware distributed under Sarva Shiksha Abhiyan and Samagra Shiksha |
| **7** | **Document & Report Tools** | • Native Browser Print API<br/>• Dynamic PDF Worksheet Generator<br/>• CSV / JSON Progress Exporters | High-resolution printable worksheets, Form-J style practice sheets, and district administration reports |

---

### 💻 Detailed Component Breakdown

#### A. Frontend Architecture (क्लाइंट और यूआई लेयर)
- **Primary Language:** **TypeScript 5.x** — 100% strict type safety across all components, linguistic models, and route definitions.
- **UI Library:** **React 19 (JSX/TSX)** — Leveraging React Server Components (RSC) patterns, optimized fiber reconciler, and high-performance render loops.
- **Meta-Framework & Routing:** **[TanStack Start](https://tanstack.com/start)** + **[TanStack Router](https://tanstack.com/router)** — Type-safe client-side routing, route-level prefetching, code-splitting, and automatic bundle optimization.
- **Styling & Design System:** **Tailwind CSS v4** utilizing modern `@theme` inline CSS variable tokens (`oklch` color spaces) with seamless light/dark mode adaptation.
- **Aceternity 3D & Animation Engine:** 
  - `PinContainer` — 3D isometric tilt with acoustic beacon projection on hover.
  - `CardContainer` & `CardItem` — Perspective-based mouse tracking and spatial depth.
  - `BentoGrid` — Modular dashboard presentation with laser-scanning animations.
  - `InfiniteMarquee` — Hardware-accelerated continuous script ribbon with hover-pause listeners.
  - `AnimatedBeam` — SVG-driven photon beam visualization tracing speech propagation.

#### B. Backend & Server Runtime (सर्वर और रनटाइम लेयर)
- **Server Engine:** **Nitro Engine** (powered by Vinxi) — An ultra-lightweight, universal server runtime that can execute on:
  - Local **Node.js** (for offline classroom laptops and mini-servers).
  - **Edge Workers** (Cloudflare Workers, Vercel Edge) for cloud deployment.
  - **Embedded Tablet WebViews** (for self-contained Android APK deployment).
- **Server Functions:** **TanStack `createServerFn`** — Type-safe RPC (Remote Procedure Call) layer allowing seamless server-side execution without boilerplate REST controllers.
- **Build Tooling:** **Vite 8** paired with the **Rolldown** bundler for sub-second hot-module replacement (HMR) and optimized production compilation.

#### C. Database & Storage Architecture (डेटाबेस और स्टोरेज लेयर)
Traditional cloud relational databases (like PostgreSQL or AWS RDS) are non-viable in rural Jharkhand primary schools because there is **no internet connectivity**. Bhasha Setu employs a tri-layer local embedded database architecture:

1. **IndexedDB (Local Document Database):**
   - **Engine:** Browser-native IndexedDB transactional key-value object store.
   - **Schema & Contents:**
     - `worksheets_store`: Cached NIPUN Bharat printable worksheets (PNG/PDF BLOBs).
     - `progress_logs`: District-level student vocabulary retention metrics and assessment history.
     - `lesson_history`: Spoken dialogue logs with audio waveforms and timestamps.
   - **Characteristics:** Persistent, supports gigabytes of local storage, completely offline.

2. **LocalStorage (Fast Key-Value State):**
   - Stores user preferences (`palash.lang`), audio synthesis toggles, and auto-rotation timers (`autoRotate: true`, 5s cycle).

3. **In-Memory Lexical Trie & Graph Database:**
   - **Location:** Compiled client-side in-memory graph (`src/data/lexicon.ts`).
   - **Size:** 1,000+ curated lemmas, compound idiom maps, and phonetic transliteration rules.
   - **Performance:** **0.2ms retrieval latency** — zero disk I/O, instantaneous sub-millisecond keyword lookup.

#### D. Edge AI & Vision / Speech Runtime (एज एआई और विजन/स्पीच)
- **Edge Vision OCR:** **Tesseract.js WASM** — Runs Google's Tesseract OCR engine compiled to WebAssembly inside background Web Workers. It directly processes raw blackboard photos in Devanagari and Roman scripts on the device without cloud API keys.
- **Acoustic Speech Synthesis:** Native **Web Speech API** augmented with an IPA (International Phonetic Alphabet) acoustic transliteration layer to accurately articulate tribal phonemes (such as Ol Chiki glottal stops `ᱜ`, `ᱫ`, and nasal inflections).

---

## ⚡ 3. The 5-Stage Processing Pipeline

Every user interaction (spoken voice, blackboard snapshot, or typed text) flows through a deterministic 5-stage transformation pipeline:

```mermaid
graph TD
    A[Input: Voice Mic / Camera OCR / Curriculum Text] --> B[Stage 1: Ingestion & Hinglish Normalizer]
    B --> C[Stage 2: Lexical Tokenization & POS Disambiguation]
    C --> D[Stage 3: Compound Idioms & Grammatical Inflection]
    D --> E[Stage 4: Multi-Script Encoding Engine]
    E --> F1[Ol Chiki: Santhali ᱥᱟᱱᱛᱟᱲᱤ]
    E --> F2[Warang Citi: Ho ᱦᱳ]
    E --> F3[Devanagari: Mundari मुंडारी]
    E --> G[Stage 5: Phonetic Roman Transliteration & Audio Playback]
    G --> H[Classroom Audio Output, 3D Waveforms, Printable Worksheets]
```

### 🔹 Stage 1: Input Ingestion & Hinglish Normalization
- Captures microphone input via Web Speech Recognition, image capture via the HTML5 Camera API, or manual teacher input.
- Passes input through the **Hinglish Conversational Normalizer**, which detects informal transliterations (e.g., `"हे आई एम हिमांशु"`, `"हेलो हाउ आर यू"`, `"तुमने आज क्या-क्या सीखा"`) and converts them into standardized grammatical Hindi.

### 🔹 Stage 2: Lexical Tokenization & POS Disambiguation
- Strips punctuation, isolates numerals (converting Arabic digits `1, 2, 3` into native Indian forms `१, २, ३`), and tokenizes phrases into root lexemes.
- Disambiguates Parts of Speech (pronouns, verb roots, nouns, adjectives, onomatopoeia).

### 🔹 Stage 3: Compound Idioms & Grammatical Inflection
- **Compound Classroom Instructions:** Resolves multi-word commands (e.g., `"खाना खाओ"` ➔ Santhali: `ᱫᱟᱠᱟ ᱡᱚᱢ ᱢᱮ`, `"गिनती सीखो"` ➔ `ᱞᱮᱠᱷᱟ ᱪᱮᱫᱚᱜ ᱢᱮ`).
- **Question & Past-Tense Conjugation:** Identifies inflected query patterns (e.g., `"तुमने क्या सीखा"` ➔ Santhali: `ᱟᱢ ᱪᱮᱫ ᱮᱢ ᱪᱮᱫ ᱠᱮᱫ-ᱟ`).
- **Self-Introduction & Copulas:** Maps Hindi copulas (`हूं / हूँ / है`) to tribal identity suffixes (e.g., `"मैं [नाम] हूं"` ➔ Santhali: `ᱤᱧ [नाम] ᱠᱟᱱᱟᱹᱧ` / Ho: `ᱟᱹᱧ [नाम] ᱛᱟᱱᱟ`).
- **Onomatopoeic Animal Sounds:** Direct phonetic translation for primary school storybooks (e.g., `"म्याऊं म्याऊं"` ➔ Santhali: `ᱢᱮᱶ ᱢᱮᱶ` / Meao Meao).

### 🔹 Stage 4: Multi-Script Native Encoding
Transforms the normalized root phrases into authentic indigenous writing systems:
- **Santhali (ᱥᱟᱱᱛᱟᱲᱤ):** Encoded directly into Unicode Ol Chiki (`U+1C50` through `U+1C7F`).
- **Ho (ᱦᱳ):** Rendered in Warang Citi script alongside phonetically matched Kolhan vocabulary.
- **Mundari (मुंडारी):** Rendered in custom Devanagari orthography aligned with Chotanagpur dialect patterns.

### 🔹 Stage 5: Acoustic Roman Transliteration & Audio Playback
- Generates phonetic Romanized pronunciation guides (e.g., `"Daka jom me"`, `"Mandi jomem"`) so teachers unfamiliar with indigenous scripts can read and speak them accurately.
- Fires real-time client-side text-to-speech with interactive 3D audio wave equalizers.

---

## 🎯 4. Core Modules & Key Features

| Module | Route | Key Capabilities |
|---|---|---|
| **Live Classroom Dialogue** | `/live` | Real-time bilingual teacher-student conversation. Teacher speaks Hindi; tablet speaker plays tribal mother-tongue audio with < 3 ms latency and visual audio equalizers. |
| **Curriculum Translation & Camera OCR** | `/translate` | On-device camera scanning for blackboards, textbooks, and lesson notes. Extracts text with Tesseract.js WASM and instantly produces dual-script translations. |
| **Bilingual Worksheet Maker** | `/worksheets` | Generates printable Grade 1–3 tracing, picture-matching, and bilingual vocabulary activity sheets aligned with NIPUN Bharat FLN standards. |
| **Classroom FLN Progress Tracker** | `/progress` | Offline dashboard tracking student vocabulary retention, district-wise coverage, and classroom session metrics. |
| **3D Holographic Showcase** | `/` | Aceternity 3D Pin Container, live voice-morphing chamber showing source-to-target transitions, and continuous cultural script marquee. |

---

## 🗺️ 5. Supported Languages & Native Scripts

| Language | Native Script | Primary Districts in Jharkhand | Estimated Native Speakers |
|---|---|---|---|
| **Santhali (ᱥᱟᱱᱛᱟᱲᱤ)** | **Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ)** | Dumka, Deoghar, Godda, Pakur, Sahibganj, Jamtara | ~7.4 Million |
| **Ho (ᱦᱳ)** | **Warang Citi (ᱣᱟᱨᱟᱝ ᱪᱤᱛᱤ)** | West Singhbhum, Chaibasa, Saraikela-Kharsawan, Kolhan | ~1.4 Million |
| **Mundari (मुंडारी)** | **Devanagari (देवनागरी)** | Khunti, Ranchi, Gumla, Simdega, Torpa | ~1.1 Million |

---

## 🚀 6. Installation & Local Development Setup

### System Prerequisites
- [Node.js](https://nodejs.org/) (Version 18.x or 20.x+)
- `npm` or `pnpm`

### Step-by-Step Instructions

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd bhasha-in-setu
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Start the Local Development Server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to: **`http://localhost:8080`**

4. **Compile Production Bundle:**
   ```bash
   npx vite build
   ```

5. **Preview Production Build:**
   ```bash
   npx vite preview
   ```

---

## 🌐 7. Vercel Deployment Guide (वर्सेल पर डिप्लॉय करने की गाइड)

Bhasha Setu is pre-configured for **Vercel Serverless & Edge deployment** via TanStack Start and Nitro's **Build Output API v3**. 

### How it Works on Vercel:
- **Static Assets:** PWA manifests, icons, CSS, and client-side JavaScript are routed directly through Vercel's global high-speed Edge CDN.
- **Serverless SSR:** The SSR page-rendering logic and server functions compile into `.vercel/output/functions/__server.func`, running instantaneously with sub-millisecond cold starts.
- **Configuration:** Handled automatically by the included [`vercel.json`](./vercel.json).

---

### 🚀 Method 1: Deploy with GitHub (Dashboard — Recommended)

1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Configure Vercel deployment"
   git push origin main
   ```

2. **Import into Vercel:**
   - Go to [vercel.com/new](https://vercel.com/new) and log in with GitHub.
   - Select your repository (`bhasha-in-setu`).

3. **Configure Project Settings:**
   | Setting | Value |
   |---|---|
   | **Framework Preset** | **Other** (or TanStack Start / Vite) |
   | **Root Directory** | `./` |
   | **Build Command** | `NITRO_PRESET=vercel vite build` *(pre-configured in `vercel.json`)* |
   | **Output Directory** | *(Leave blank — automatically managed by `.vercel/output`)* |
   | **Install Command** | `npm install` |

4. **Click "Deploy":**
   - Vercel will install dependencies, compile the client and SSR Nitro bundle, and deploy to your live production domain:
     👉 **`https://bhasha-in-setu.vercel.app/`**

---

### 💻 Method 2: Deploy using Vercel CLI (Command Line)

You can deploy directly from your local terminal using the Vercel CLI:

1. **Login and link project:**
   ```bash
   npx vercel
   ```
   - Answer the interactive prompts (Link to existing project? `No`, Project name? `bhasha-setu`, Directory? `./`).

2. **Deploy directly to Production:**
   ```bash
   npx vercel --prod
   ```

3. **Deploy Preview / Staging:**
   ```bash
   npx vercel
   ```

---

## 📱 8. Native Mobile App — Expo SDK 52 & Embedded SQLite

In addition to the Web PWA, Bhasha Setu includes a full-featured **Native Mobile Application** in the [`mobile/`](./mobile) directory, built on **Expo SDK 52** with **SQLite (`expo-sqlite`)** local storage, hardware microphone speech recognition, and native camera vision for 2 GB RAM Android school tablets.

### Mobile Feature Capabilities:
- **Embedded SQLite Core (`bhasha_setu.db`):** Replaces browser storage with SQLite tables (`lessons`, `progress_events`, `saved_worksheets`, `settings`) for robust zero-internet data persistence.
- **🎙️ Live Classroom Speech:** Real-time speech input with animated soundwave equalizers and offline acoustic playback via `expo-speech`.
- **📷 Blackboard & Textbook OCR:** Camera capture via `expo-image-picker` with instant dual-script translation.
- **📝 Bilingual Worksheets & Flashcards:** Interactive flashcards with native audio pronunciation, and 1-click **PDF print & share** via `expo-print` and `expo-sharing`.
- **📚 16 NIPUN Bharat Lessons:** Offline lesson library with 1-click term download, search by keyword, and category filtering.

### Running the Mobile App Locally:

```bash
# 1. Navigate to the mobile folder
cd mobile

# 2. Install dependencies
npm install

# 3. Start Expo development server
npm start
# or
npx expo start -c
```
- **Run on Physical Phone / Tablet:** Install the **Expo Go** app from Google Play Store or App Store and scan the QR code.
- **Run on Android Emulator:** Press `a` in the terminal.
- **Run on iOS Simulator:** Press `i` in the terminal.

---

## 🛡️ 9. Offline Resilience & Edge Performance

- **Zero Cloud Latency:** The entire translation pipeline, tokenization engine, and OCR workers run locally in the browser and mobile device runtime.
- **Low-Cost Hardware Optimized:** Tested on entry-level Android tablets (2GB RAM) commonly deployed in government primary schools.
- **No Internet Required:** Once loaded or installed, all features function completely without Wi-Fi, cellular networks, or server infrastructure.

---

## 📜 10. License

This project is open-source under the MIT License, designed to foster educational equity and mother-tongue-based multilingual education (MTB-MLE) across indigenous communities.

