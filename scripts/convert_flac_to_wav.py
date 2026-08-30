import os
import soundfile as sf

AUDIO_DIR = r'c:\Users\Administrator\Yenelearning\backend\public\audio\amharic'

print("Converting FLAC extracted audio files to standard WAV format...")

for filename in os.listdir(AUDIO_DIR):
    if filename.endswith('.flac'):
        flac_path = os.path.join(AUDIO_DIR, filename)
        wav_filename = filename.replace('.flac', '.wav')
        wav_path = os.path.join(AUDIO_DIR, wav_filename)

        try:
            data, samplerate = sf.read(flac_path)
            sf.write(wav_path, data, samplerate, subtype='PCM_16')
            print(f"Converted {filename} -> {wav_filename} ({samplerate} Hz)")
        except Exception as e:
            print(f"Error converting {filename}: {e}")

print("Audio conversion complete.")
