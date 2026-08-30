import { Platform } from 'react-native';
import Constants from 'expo-constants';
import { Audio } from 'expo-av';

let isAudioConfigured = false;

export async function configureAppAudio(): Promise<void> {
  if (isAudioConfigured) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      allowsRecordingIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    });
    isAudioConfigured = true;
  } catch (e) {
    // Non-fatal if audio mode configuration is delayed
  }
}

export function getAudioBaseUrl(): string {
  if (Platform.OS === 'web') {
    return 'http://localhost:3001';
  }

  const debuggerHost =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest?.debuggerHost ||
    (Constants as any).manifest2?.extra?.expoGo?.debuggerHost;

  if (debuggerHost) {
    const hostIp = debuggerHost.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:3001`;
    }
  }

  return 'http://localhost:3001';
}

export function getTutorAudioUrl(tutorKey: string, fileName: string): string {
  const base = getAudioBaseUrl();
  return `${base}/audio/tutors/${tutorKey}/${fileName}.wav?t=${Date.now()}`;
}
