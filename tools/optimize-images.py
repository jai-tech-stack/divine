"""Create small JPEG copies for Android, iOS and web; retain original artwork."""
from pathlib import Path
from PIL import Image, ImageOps
import shutil

root = Path(__file__).resolve().parents[1]
assets = root / 'assets'
total_before = total_after = 0
for source in sorted(assets.rglob('*.jpg')):
    relative = source.relative_to(assets)
    if relative.parts[0] == 'optimized':
        continue
    target = assets / 'optimized' / relative
    target.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(source) as artwork:
        image = ImageOps.exif_transpose(artwork).convert('RGB')
        image.thumbnail((960, 960), Image.Resampling.LANCZOS)
        image.save(target, 'JPEG', quality=64, optimize=True, progressive=True)
    if target.stat().st_size >= source.stat().st_size:
        shutil.copyfile(source, target)
    total_before += source.stat().st_size
    total_after += target.stat().st_size
print(f'Artwork: {total_before:,} -> {total_after:,} bytes; originals retained.')
