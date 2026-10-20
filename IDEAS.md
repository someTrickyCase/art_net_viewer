# Ideas for future features

## Draw your own sprite

- A new menu item in the app (for example the key `d`) opens a small pixel
  editor inside the terminal.
- Move a cursor with the arrow keys and paint pixels with tones 1-9 (shown
  in theme colours). Space or 0 makes a pixel transparent.
- The canvas is limited to the scene size (12 px tall), so the drawing
  always fits the 6-row strip.
- One drawing is enough: the flying version can be made automatically with
  `rotateClockwise()`. Or the user can draw two poses: "waiting" and
  "flying".
- The drawing is saved to a user file (for example
  `%APPDATA%\art-net-viewer\sprite.txt`) as plain digit rows, the same
  format as `src/ui/rocket.ts`. It is loaded at start-up.
- If the file is missing or broken, the app falls back to the default
  rocket.
- Later: share sprites as text files and pick between several saved ones.
