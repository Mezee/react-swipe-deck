# Content swipe deck

First version based on the Card and Fullscreen artboards in Paper's `overhang` file.
Forked from almond-bongbong/react-swipe-deck (MIT). The original swipe interaction is adapted to pointer events, reversible browsing, and long-press reports.

## Run

1. `npm install`
2. `npm run dev -- --host 127.0.0.1`
3. Open http://127.0.0.1:5173

Swipe left/right or use arrows to browse five ideas. Hold a card for one second to expand, or click View report. Swipe down at the top of the report, drag the top handle, press Escape, or click × to return. Make this next saves one selection in local storage.

Edit `src/content.ts` for content. The Paper thumbnail is saved in `public/thumbnail.jpg`; other cards currently reuse it with concept labels. Scores and additional candidates are illustrative, not fresh research. The first candidate draws from the supplied local AI report.

## Verify

`npm run build` and `npm run lint`.

With the dev server running: `npx playwright test` (uses installed Google Chrome). Repeatable screenshots, traces, and the HTML report are saved in `artifacts/`.

Paper's exported report had clipped content. This version preserves the exported colors, typography, dimensions, and panel structure while allowing vertical scrolling and responsive sizing.

Stage light rays use the React Bits LightRays JS/CSS registry component (https://reactbits.dev). Reduced motion shows a static stage.
