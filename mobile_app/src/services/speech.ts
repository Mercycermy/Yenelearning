import * as Speech from 'expo-speech';

const locales: Record<string, string> = {
  english: 'en-US',
  amharic: 'am-ET',
  oromo: 'om-ET',
  geez: 'am-ET',
};

let activeRecognition: any = null;

export const speechService = {
  localeFor(language: string) {
    return locales[language] ?? 'en-US';
  },

  async speak(text: string, language: string): Promise<boolean> {
    Speech.stop();
    const locale = this.localeFor(language);
    return new Promise<boolean>((resolve) => {
      try {
        Speech.speak(text, {
          language: locale,
          rate: 0.85,
          pitch: 1.0,
          onDone: () => resolve(true),
          onStopped: () => resolve(true),
          onError: () => resolve(false),
        });
      } catch {
        resolve(false);
      }
    });
  },

  stop() {
    Speech.stop();
  },

  async listen(
    language: string,
    onResult: (words: string, isFinal: boolean) => void
  ): Promise<boolean> {
    this.stop();
    const locale = this.localeFor(language);

    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          if (activeRecognition) {
            activeRecognition.abort();
          }
          const recognition = new SpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = true;
          recognition.lang = locale;

          recognition.onresult = (event: any) => {
            let transcript = '';
            let isFinal = false;
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              transcript += event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                isFinal = true;
              }
            }
            onResult(transcript, isFinal);
          };

          recognition.onerror = () => {
            onResult('', true);
          };

          recognition.onend = () => {
            activeRecognition = null;
          };

          activeRecognition = recognition;
          recognition.start();
          return true;
        } catch {
          return false;
        }
      }
    }
    return false;
  },

  stopListening() {
    if (activeRecognition) {
      try {
        activeRecognition.stop();
      } catch {}
      activeRecognition = null;
    }
  },
};

