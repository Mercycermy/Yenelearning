import os
import sys
import urllib.request
import urllib.parse

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

OUTPUT_DIR = r'c:\Users\Administrator\Yenelearning\backend\public\audio\amharic'
os.makedirs(OUTPUT_DIR, exist_ok=True)

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

print("Batch generating story scenes and vocabulary audio files...")

for amharic_text, filename in WORDS.items():
    mp3_path = os.path.join(OUTPUT_DIR, f"{filename}.mp3")

    encoded_text = urllib.parse.quote(amharic_text)
    url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={encoded_text}&tl=am&client=tw-ob"

    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req) as response:
            audio_bytes = response.read()

        with open(mp3_path, "wb") as f:
            f.write(audio_bytes)

        print(f"Saved audio -> {filename}.mp3 ({len(audio_bytes)} bytes)")
    except Exception as e:
        print(f"Error generating audio for {filename}: {e}")

print("All story and vocabulary audio files generated successfully.")
