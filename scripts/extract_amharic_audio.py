import os
import sys

# Force UTF-8 stdout encoding on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from datasets import load_dataset, Audio

TARGET_WORDS = {
    'ወፍ': 'wef.flac',
    'ቤት': 'bet.flac',
    'ድመት': 'dimet.flac',
    'ሰላም': 'selam.flac',
    'ቤተሰብ': 'beteseb.flac',
    'አንበሳ': 'anbesa.flac',
}

OUTPUT_DIR = r'c:\Users\Administrator\Yenelearning\backend\public\audio\amharic'
os.makedirs(OUTPUT_DIR, exist_ok=True)

print("Streaming snapwre/amharic-speech dataset from Hugging Face...")

try:
    dataset = load_dataset("snapwre/amharic-speech", split="train", streaming=True)
    dataset = dataset.cast_column("audio", Audio(decode=False))
    
    needed = dict(TARGET_WORDS)
    found_matches = {}

    for item in dataset:
        sentence = item.get("sentence", "")
        for word, filename in list(needed.items()):
            if word in sentence:
                audio = item.get("audio", {})
                audio_bytes = audio.get("bytes")

                if audio_bytes:
                    out_path = os.path.join(OUTPUT_DIR, filename)
                    with open(out_path, "wb") as f:
                        f.write(audio_bytes)
                    print(f"Extracted audio for {word} -> {filename}")
                    found_matches[word] = filename
                    del needed[word]
                    break

        if not needed:
            print("All requested vocabulary audio clips extracted!")
            break

    print(f"Extraction summary: {len(found_matches)} of {len(TARGET_WORDS)} words extracted.")

except Exception as e:
    print(f"Extraction error: {e}")
