import os
import sys
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

TUTOR_PROFILES = {
    'tutor-abebe': {'pitch_factor': 0.90, 'rate': 1.05},
    'tutor-sara': {'pitch_factor': 1.28, 'rate': 1.15},
    'tutor-dawit': {'pitch_factor': 1.05, 'rate': 1.10},
    'tutor-helen': {'pitch_factor': 1.38, 'rate': 1.18},
}

BASE_DIR = r'c:\Users\Administrator\Yenelearning\backend\public\audio\tutors'
headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

print("Generating WAV & MP3 audio for each tutor...")

def pitch_shift(audio_data, sr, factor):
    if factor == 1.0:
        return audio_data
    indices = np.round(np.arange(0, len(audio_data), factor))
    indices = indices[indices < len(audio_data)].astype(int)
    return audio_data[indices]

for tutor_id, config in TUTOR_PROFILES.items():
    tutor_dir = os.path.join(BASE_DIR, tutor_id)
    os.makedirs(tutor_dir, exist_ok=True)

    for amharic_text, filename in WORDS.items():
        wav_path = os.path.join(tutor_dir, f"{filename}.wav")
        mp3_path = os.path.join(tutor_dir, f"{filename}.mp3")

        encoded_text = urllib.parse.quote(amharic_text)
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded_text}&tl=am&client=tw-ob"

        try:
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req) as resp:
                audio_bytes = resp.read()

            with open(mp3_path, "wb") as f:
                f.write(audio_bytes)

            data, samplerate = sf.read(mp3_path)
            transformed = pitch_shift(data, samplerate, config['pitch_factor'])
            sf.write(wav_path, transformed, samplerate)
            print(f"[{tutor_id}] Saved {filename}.wav & .mp3")
        except Exception as e:
            print(f"Error {filename} for {tutor_id}: {e}")

print("Tutor audio generation complete!")
