import os
import sys
import json
import urllib.request
import urllib.parse

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

OUTPUT_DIR = r'c:\Users\Administrator\Yenelearning\backend\public\audio\human_dataset'
os.makedirs(OUTPUT_DIR, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

print("Fetching human speaker clips from snapwre/amharic-speech via Hugging Face API...")

found_samples = []
offsets = [0, 100, 200, 300, 400]

for offset in offsets:
    if len(found_samples) >= 8:
        break

    api_url = f"https://datasets-server.huggingface.co/rows?dataset=snapwre%2Famharic-speech&config=default&split=train&offset={offset}&limit=100"
    
    try:
        req = urllib.request.Request(api_url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            rows = data.get('rows', [])

        for r in rows:
            row_idx = r.get('row_idx')
            row_data = r.get('row', {})
            sentence = row_data.get('sentence') or row_data.get('text') or ''
            audio_info = row_data.get('audio')

            audio_src = None
            if isinstance(audio_info, list) and len(audio_info) > 0:
                audio_src = audio_info[0].get('src')
            elif isinstance(audio_info, dict):
                audio_src = audio_info.get('src')

            if audio_src and len(sentence.strip()) > 0:
                sample_id = len(found_samples) + 1
                filename = f"human_speaker_{sample_id}.wav"
                filepath = os.path.join(OUTPUT_DIR, filename)

                try:
                    audio_req = urllib.request.Request(audio_src, headers=headers)
                    with urllib.request.urlopen(audio_req) as audio_resp:
                        audio_bytes = audio_resp.read()

                    with open(filepath, 'wb') as f:
                        f.write(audio_bytes)

                    sample_record = {
                        'id': sample_id,
                        'row_idx': row_idx,
                        'filename': filename,
                        'url': f"http://localhost:3001/audio/human_dataset/{filename}",
                        'transcript': sentence,
                        'bytes': len(audio_bytes),
                    }
                    found_samples.append(sample_record)
                    print(f"[{sample_id}] Downloaded {filename} ({len(audio_bytes)} bytes): {sentence}")

                    if len(found_samples) >= 6:
                        break
                except Exception as e:
                    pass

    except Exception as e:
        print(f"Error fetching offset {offset}: {e}")

catalog_path = os.path.join(OUTPUT_DIR, 'catalog.json')
with open(catalog_path, 'w', encoding='utf-8') as f:
    json.dump(found_samples, f, ensure_ascii=False, indent=2)

print(f"\nSuccessfully downloaded {len(found_samples)} human speaker samples into backend/public/audio/human_dataset/")
