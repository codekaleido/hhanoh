
from PIL import Image
from html import escape

# YOUR IMAGE
img = Image.open("corpse.jpg").convert("RGB")

# YOUR CUSTOM DIMENSIONS
width = 100
height = 50

img = img.resize((width, height), Image.Resampling.LANCZOS)

# YOUR CUSTOM CHARACTER SET
chars = "B@#&%$IOP*"

pixels = img.load()
rows = []

for y in range(height):
    line = []

    for x in range(width):
        r, g, b = pixels[x, y]

        # YOUR ORIGINAL BRIGHTNESS FORMULA
        brightness = 0.299*r + 0.587*g + 0.144*b

        index = int(brightness / 255 * (len(chars) - 1))
        char = escape(chars[index])

        # Preserve RGB colour
        line.append(
            f'<span style="color:rgb({r},{g},{b})">{char}</span>'
        )

    rows.append("".join(line))

# Create RGB HTML artwork
html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<style>
body {{
    margin: 0;
    padding: 12px;
    background: #111;
}}

pre {{
    font-family: "Courier New", monospace;
    font-size: 8px;
    line-height: 1;
    letter-spacing: 0;
    white-space: pre;
    width: max-content;
    margin: 0 auto;
    font-variant-ligatures: none;
}}
</style>
</head>
<body>
<pre>{chr(10).join(rows)}</pre>
</body>
</html>"""

# SAVE THE RESULT
with open("ascii.html", "w", encoding="utf-8") as file:
    file.write(html)

print("RGB ASCII artwork generated successfully!")
