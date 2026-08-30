import os
import sys
import json
import soundfile as sf
import numpy as np
from datasets import load_dataset

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_DIR = r'c:\Users\Administrator\Yenelearning\backend\public\audio\dataset_samples'
os.makedirs(OUTPUT_DIR, exist_ok=True)

TARGET_KEYWORDS = ['ወፍ', 'ድመት', 'አንበሳ', 'ውሻ', 'ቤት', 'ሰላም', 'ዛፍ', 'ተፈጥሮ']

print("Loading stream from snapwre/amharic-speech dataset...")

ds = load_dataset('snapwre/amharic-speech', split='train', streaming=True)

samples = []
count = 0
max_samples = 8

for row in ds:
    count += 1
    sentence = row.get('sentence', '') or row.get('text', '') or row.get('transcription', '')
    
    # Check if any target word is in the transcript
    matched_keyword = None
    for kw in TARGET_KEYWORDS:
        if kw in sentence:
            matched_keyword = kw
            break

    if matched_keyword or count <= 3:
        sample_idx = len(samples) + 1
        filename = f"sample_{sample_idx}_{matched_keyword or 'general'}.wav"
        filepath = os.path.join(OUTPUT_DIR, filename)

        audio_data = row.get('audio')
        if audio_data:
            array = audio_data.get('array')
            sampling_rate = audio_data.get('sampling_rate', 16000)
            
            if array is not None:
                sf.write(filepath, np.array(array), sampling_rate)
                duration_sec = round(len(array) / sampling_rate, 2)
                
                sample_meta = {
                    'sample_id': sample_idx,
                    'matched_keyword': matched_keyword or 'general',
                    'filename': filename,
                    'url': f"http://localhost:3001/audio/dataset_samples/{filename}",
                    'sentence': sentence,
                    'duration_sec': duration_sec,
                    'sampling_rate': sampling_rate,
                }
                samples.append(sample_meta)
                print(f"[{sample_idx}] Keyword: {matched_keyword} | Duration: {duration_sec}s | Text: {sentence}")

        if len(samples) >= max_samples:
            break

    if count > 500:
        break

metadata_file = os.path.join(OUTPUT_DIR, 'samples_index.json')
with open(metadata_file, 'w', encoding='utf-8') as f:
    json.dump(samples, f, ensure_ascii=False, indent=2)

print(f"\nExtracted {len(samples)} human speaker samples into backend/public/audio/dataset_samples/")
