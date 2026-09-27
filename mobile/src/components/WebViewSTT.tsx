import React, { useRef, useCallback, forwardRef, useImperativeHandle } from "react";
import { View, StyleSheet } from "react-native";
import { WebView, WebViewMessageEvent } from "react-native-webview";

/**
 * WebView-based Speech-to-Text using browser's native SpeechRecognition API.
 * Exactly the same approach as the web version — no API key, no upload, instant.
 *
 * The WebView loads a minimal HTML page that runs SpeechRecognition (Chrome/Android)
 * and communicates results back to React Native via postMessage.
 */

export interface WebViewSTTRef {
  startListening: (lang?: string) => void;
  stopListening: () => void;
}

interface WebViewSTTProps {
  onResult: (text: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onListeningChange: (listening: boolean) => void;
}

// The HTML page that runs inside the hidden WebView
// Uses the EXACT same SpeechRecognition API as the web version
const STT_HTML = `
<!DOCTYPE html>
<html>
<head><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body>
<script>
  var recognition = null;
  var isListening = false;

  function send(type, data) {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: type, data: data }));
  }

  function startListening(lang) {
    if (isListening) {
      try { recognition.stop(); } catch(e) {}
    }

    var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      send('error', 'SpeechRecognition not supported in this WebView');
      return;
    }

    recognition = new SpeechRecognition();
    recognition.lang = lang || 'hi-IN';
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onstart = function() {
      isListening = true;
      send('listening', true);
    };

    recognition.onresult = function(event) {
      var finalText = '';
      var interimText = '';
      for (var i = event.resultIndex; i < event.results.length; i++) {
        var result = event.results[i];
        if (result.isFinal) {
          finalText += result[0].transcript;
        } else {
          interimText += result[0].transcript;
        }
      }
      if (finalText.trim()) {
        send('final', finalText.trim());
      }
      if (interimText.trim()) {
        send('interim', interimText.trim());
      }
    };

    recognition.onerror = function(event) {
      isListening = false;
      send('listening', false);
      if (event.error === 'no-speech') {
        send('error', 'no-speech');
      } else if (event.error === 'not-allowed') {
        send('error', 'Microphone permission denied');
      } else {
        send('error', event.error || 'Speech recognition error');
      }
    };

    recognition.onend = function() {
      isListening = false;
      send('listening', false);
      send('end', '');
    };

    try {
      recognition.start();
    } catch (e) {
      send('error', e.message || 'Failed to start recognition');
    }
  }

  function stopListening() {
    if (recognition && isListening) {
      try { recognition.stop(); } catch(e) {}
    }
  }

  // Listen for commands from React Native
  document.addEventListener('message', function(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.action === 'start') startListening(msg.lang);
      if (msg.action === 'stop') stopListening();
    } catch(err) {}
  });

  // Also handle window.onmessage (for Android WebView)
  window.addEventListener('message', function(e) {
    try {
      var msg = JSON.parse(e.data);
      if (msg.action === 'start') startListening(msg.lang);
      if (msg.action === 'stop') stopListening();
    } catch(err) {}
  });

  // Signal ready
  send('ready', '');
</script>
</body>
</html>
`;

export const WebViewSTT = forwardRef<WebViewSTTRef, WebViewSTTProps>(
  ({ onResult, onError, onListeningChange }, ref) => {
    const webViewRef = useRef<WebView>(null);

    const startListening = useCallback((lang = "hi-IN") => {
      webViewRef.current?.postMessage(JSON.stringify({ action: "start", lang }));
    }, []);

    const stopListening = useCallback(() => {
      webViewRef.current?.postMessage(JSON.stringify({ action: "stop" }));
    }, []);

    useImperativeHandle(ref, () => ({
      startListening,
      stopListening,
    }));

    const handleMessage = useCallback(
      (event: WebViewMessageEvent) => {
        try {
          const msg = JSON.parse(event.nativeEvent.data);
          switch (msg.type) {
            case "final":
              onResult(msg.data, true);
              break;
            case "interim":
              onResult(msg.data, false);
              break;
            case "error":
              onError(msg.data);
              break;
            case "listening":
              onListeningChange(msg.data === true);
              break;
            case "ready":
              console.log("[WebViewSTT] Ready");
              break;
            case "end":
              // Recognition session ended
              break;
          }
        } catch (err) {
          console.warn("[WebViewSTT] Message parse error:", err);
        }
      },
      [onResult, onError, onListeningChange],
    );

    return (
      <View style={styles.hidden}>
        <WebView
          ref={webViewRef}
          source={{ html: STT_HTML }}
          onMessage={handleMessage}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          mediaPlaybackRequiresUserAction={false}
          allowsInlineMediaPlayback={true}
          // Android: allow microphone access in WebView
          mediaCapturePermissionGrantType="grant"
          androidLayerType="hardware"
          style={styles.webview}
        />
      </View>
    );
  },
);

WebViewSTT.displayName = "WebViewSTT";

const styles = StyleSheet.create({
  hidden: {
    width: 0,
    height: 0,
    position: "absolute",
    opacity: 0,
    overflow: "hidden",
  },
  webview: {
    width: 1,
    height: 1,
  },
});
