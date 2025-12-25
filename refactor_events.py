import re
import os

file_path = r"c:\Users\zandi\Desktop\nrw\RE_Bone\src\game\config\events.js"

print(f"Processing {file_path}...")

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update effect signature
# Matches "effect: () =>" with flexible whitespace
content = re.sub(r'effect:\s*\(\)\s*=>', r'effect: ({ Player, gameStore, SoundManager, Achievements, LootManager, Game }) =>', content)

# 2. Update global references
replacements = {
    r'window\.Player': 'Player',
    r'window\.gameStore': 'gameStore',
    r'window\.SoundManager': 'SoundManager',
    r'window\.Achievements': 'Achievements',
    r'window\.LootManager': 'LootManager',
    r'window\.Game': 'Game',
    r'window\.Events': 'Events',
    r'window\.Ascension': 'Ascension' # Use Ascension if present? events.js didn't show Ascension usage but good safeguard.
}

for pattern, repl in replacements.items():
    content = re.sub(pattern, repl, content)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done.")
