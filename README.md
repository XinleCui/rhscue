# rhscue · A Personal Universe Inside a Black Hole

A personal website with a cinematic black-hole entrance. The landing page uses
the supplied black-hole image as one whole scene: the entire image rotates
slowly, and clicking the black hole triggers the existing interstellar wormhole
transition into the home page.

The home page contains sections for a resume, life story, gallery, and future
check-ins. Its background remains alive with layered drifting stars, breathing
nebulae, occasional meteors, and subtle pointer/scroll parallax.

## How To Open

- Easiest: double-click `index.html`.
- Or run a local server from this folder:

```bash
python3 -m http.server 8000
```

Then open <http://localhost:8000>.

## File Structure

```text
rhscue/
├── index.html        Entrance: living black hole scene
├── home.html         Home: Resume / My Story / Gallery / Someday
├── assets/
│   └── blackhole-bg.png
├── css/
│   ├── landing.css   Entrance page styles
│   └── home.css      Home page styles
├── js/
│   ├── blackhole.js  Animated black-hole image renderer
│   ├── warp.js       Wormhole transition animation
│   └── home.js       Home interactions, gallery, and check-in data
└── photos/           Put your own photos here
```

## How To Customize

1. **Resume / Life Story**: open `home.html` and replace the bracketed
   placeholders with your own English text.
2. **Gallery**: name your photos `1.jpg`, `2.jpg`, and so on, then drop them
   into `photos/`. Edit captions at the top of `js/home.js`.
3. **Future check-ins**: edit the `DESTINATIONS` array at the top of
   `js/home.js`.
4. **Entrance image**: replace `assets/blackhole-bg.png` with another image if
   you want a different black-hole scene.
5. **Black-hole click area**: edit the ratio values in `js/blackhole.js` inside
   `computeBlackHole()`.

## Details

- The entrance animation is still the existing warp transition from this
  folder.
- The entrance is based on the uploaded image and animated as one slowly
  rotating full-scene image.
- Check-in progress is saved locally in the browser with `localStorage`.
