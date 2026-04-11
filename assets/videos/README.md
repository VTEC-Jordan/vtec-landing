# Videos Folder

Drop your MP4 files here. Recommended files:

## For Hero Sections
- `hero-main.mp4` - Main index.html hero video
- `partner-hero.mp4` - Partner page hero video  
- `workshops-hero.mp4` - Workshops page hero video

## Video Requirements
- **Format:** MP4 (H.264 codec recommended)
- **Size:** Aim for 5-20MB per file (compress if needed)
- **Resolution:** 1920x1080 (Full HD) or 1280x720 (HD)
- **Duration:** 10-30 seconds (for loop)
- **Audio:** Muted (videos will have `muted` attribute)

## How to Reference in HTML
```html
<video autoplay muted loop playsinline class="hero-video">
    <source src="assets/videos/hero-main.mp4" type="video/mp4">
</video>
```

## Compression Tools
If your files are too large:
- **FFmpeg** (command line): `ffmpeg -i input.mp4 -vcodec h264 -crf 28 output.mp4`
- **HandBrake** (GUI): https://handbrake.fr
- **Online:** https://cloudconvert.com

## Tips
- Use dark, engaging visuals (they'll be behind text with dark overlay)
- Keep movement smooth and continuous (for looping)
- Avoid cuts or scene transitions (better for seamless loop)
