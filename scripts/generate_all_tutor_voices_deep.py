import os
import sys
import io
import urllib.request
import urllib.parse
import soundfile as sf
import numpy as np

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

WORDS = {
    # Animals
    'ወፍ': 'wef',
    'ቤት': 'bet',
    'ድመት': 'dimet',
    'ሰላም': 'selam',
    'ቤተሰብ': 'beteseb',
    'አንበሳ': 'anbesa',
    'ውሻ': 'wusha',
    # Connectors & Sentence Builder Words
    'እና': 'ena',
    'ጓደኛሞች': 'gwadegnmoch',
    'ናቸው': 'nachew',
    'እንስሳት': 'enssat',
    'ትልቅ': 'tilik',
    'ትንሽ': 'tinish',
    'ነው': 'new',
    'አሉ': 'alu',
    'ይወዳሉ': 'yiwedalu',
    'ይጫወታሉ': 'yichawetalu',
    'ዛፍ': 'zaf',
    'ውሃ': 'wuha',
    'ጫካ': 'chaka',
    # Story Words
    'ሊሊ': 'lili',
    'ቆንጆ': 'konjo',
    'አረንጓዴው': 'arengwade',
    'ታማኙ': 'tamagn',
    'መጥተው': 'metew',
    'ተቀመጡ': 'tekemetu',
    'አራቱም': 'aratum',
    'በደስታ': 'bedesta',
    'አብረው': 'abrew',
    # Full Sentences & Story Scenes
    'ሊሊ በአረንጓዴው ዛፍ ሥር ቆንጆ ወፍ እና ድመት አየች።': 'story_scene_1',
    'ትልቁ አንበሳ እና ታማኙ ውሻም መጥተው አብረዋቸው ተቀመጡ።': 'story_scene_2',
    'አራቱም እንስሳት በደስታ አብረው ይጫወታሉ!': 'story_scene_3',
    'ወፍ እና ድመት ጓደኛሞች ናቸው': 'sentence_1',
    'አንበሳ እና ውሻ እንስሳት ናቸው': 'sentence_2',
}

TUTOR_CONFIGS = {
    'tutor-abebe': {'pitch': 0.84, 'label': 'Deep Male Teacher'},
    'tutor-sara': {'pitch': 1.38, 'label': 'Bright Female Reader'},
    'tutor-dawit': {'pitch': 1.08, 'label': 'Cheerful Young Friend'},
    'tutor-helen': {'pitch': 1.52, 'label': 'Sweet High Female Guide'},
}

BASE_OUTPUT_DIR = r'c:\Users\Administrator\Yenelearning\backend\public\audio\tutors'
os.makedirs(BASE_OUTPUT_DIR, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

def resample_pitch(audio_data, factor):
    new_len = int(len(audio_data) / factor)
    return np.interp(np.linspace(0, len(audio_data), new_len), np.arange(len(audio_data)), audio_data)

print("Starting deep generation of distinct tutor voices...")

for word_text, filename in WORDS.items():
    encoded_text = urllib.parse.quote(word_text)
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded_text}&tl=am&client=tw-ob"

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as resp:
            raw_bytes = resp.read()

        base_data, sr = sf.read(io.BytesIO(raw_bytes))

        for tutor_id, config in TUTOR_CONFIGS.items():
            tutor_dir = os.path.join(BASE_OUTPUT_DIR, tutor_id)
            os.makedirs(tutor_dir, exist_ok=True)

            transformed_data = resample_pitch(base_data, config['pitch'])
            wav_path = os.path.join(tutor_dir, f"{filename}.wav")
            sf.write(wav_path, transformed_data, sr)

        print(f"Generated all 4 tutor voices for -> {word_text} ({filename}.wav)")
    except Exception as e:
        print(f"Error generating {filename}: {e}")

print("\nDeep tutor voice generation complete!")
