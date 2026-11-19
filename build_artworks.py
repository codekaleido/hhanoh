
import json
import subprocess
import sys
from pathlib import Path

ARTWORKS = Path("public/artworks")
manifest = []

for folder in sorted(ARTWORKS.iterdir()):

    if not folder.is_dir():
        continue

    scripts = list(folder.glob("*.py"))

    images = []
    for pattern in ("*.jpg", "*.jpeg", "*.png", "*.webp",
                    "*.JPG", "*.JPEG", "*.PNG", "*.WEBP"):
        images.extend(folder.glob(pattern))

    if not scripts or not images:
        print(f"Skipping {folder.name}: script or image missing")
        continue

    script = scripts[0]
    image = images[0]

    print(f"\nRunning custom script: {script.name}")

    # Run YOUR Python script inside its own artwork folder
    subprocess.run(
        [sys.executable, str(script.resolve())],
        cwd=folder,
        check=True
    )

    # Each custom script must generate this file
    ascii_file = folder / "ascii.html"

    if not ascii_file.exists():
        print(f"ERROR: {ascii_file} was not generated!")
        continue

    manifest.append({
        "id": folder.name,
        "title": folder.name.replace("-", " ").replace("_", " ").title(),
        "image": f"/artworks/{folder.name}/{image.name}",
        "asciiUrl": f"/artworks/{folder.name}/ascii.html",
        "type": "ARTWORK",
        "tone": "aqua",
        "note": ""
    })

manifest_path = ARTWORKS / "manifest.json"

manifest_path.write_text(
    json.dumps(manifest, indent=2),
    encoding="utf-8"
)

print(f"\nSuccessfully loaded {len(manifest)} custom artworks!")
