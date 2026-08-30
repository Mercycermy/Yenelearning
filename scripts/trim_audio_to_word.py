import os
import soundfile as sf
import numpy as np

AUDIO_DIR = r'c:\Users\Administrator\Yenelearning\backend\public\audio\amharic'

print("Trimming audio clips to single word duration...")

for filename in os.listdir(AUDIO_DIR):
    if filename.endswith('.wav'):
        wav_path = os.path.join(AUDIO_DIR, filename)

        try:
            data, samplerate = sf.read(wav_path)
            
            # Convert to mono if stereo
            if len(data.shape) > 1:
                data = np.mean(data, axis=1)

            # Trim leading & trailing silence (threshold = 2% of max amplitude)
            abs_data = np.abs(data)
            threshold = 0.02 * np.max(abs_data)
            non_silent_indices = np.where(abs_data > threshold)[0]

            if len(non_silent_indices) > 0:
                start_idx = max(0, non_silent_indices[0] - int(0.05 * samplerate))
                # Single word duration max 1.2 seconds (1.2 * samplerate)
                max_samples = int(1.2 * samplerate)
                end_idx = min(len(data), start_idx + max_samples)

                trimmed_data = data[start_idx:end_idx]
                sf.write(wav_path, trimmed_data, samplerate, subtype='PCM_16')
                print(f"Trimmed {filename}: original {len(data)/samplerate:.2f}s -> {len(trimmed_data)/samplerate:.2f}s")
        except Exception as e:
            print(f"Error trimming {filename}: {e}")

print("Audio trimming complete.")
