# KineroDraw (updated)

`index.html` is the complete site. It is a compiled React build (React, Tailwind and Three.js are loaded/bundled inside it), so it runs by double-clicking the file or from any static host.

## Run / push
1. Put `index.html` in your repo folder (open the folder in VS Code).
2. `git add . && git commit -m "Update KineroDraw" && git push`
3. GitHub: Settings > Pages > Deploy from branch > `main` / root. Your site goes live at `https://<user>.github.io/<repo>/`.

## What changed
- Team: member 2 is now Shivaan More (photo + Instagram link).
- CAD: "Joint detail" slide replaced with a plain bolt-and-nut joint drawing; the 3D arm's joints are now bolts (washer, hex nut, shank).
- All "hover to / drag to / click" helper text removed.
- Shapes: new Three.js 3D scene (circle, square, triangle drawn by a pen) - see `patches/shapes3d.js`.
- Code: the code card hangs from a lanyard like an ID card, swings in, reacts to the pointer on the strap, and lines type in - see `patches/codehang.js` and `patches/extra.css`.
- Footer: "Made by Krish Kumar Jaiswal with a team of nine."

## patches/
Readable source of the new pieces. They are written for the compiled bundle (they use its internal names such as `aa`, `xt`, `pt`, `mo`), so they are reference code, not drop-in files for a fresh Vite project.
