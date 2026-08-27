# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## HomeEasy hero motion requirements

- Preserve the current visual design, interface composition, copy, navigation, Hommy asset and brand color `#B2566C`.
- The Sheer Elegance hero must be a deterministic layered scene, never a crossfade or sequence of independently generated room photographs.
- Keep the room, windows, exterior, furniture and Hommy geometrically fixed. Animate only the fabric reveal, relative band phase, light filtering and localized lamp state.
- Model the panoramic Sheer Elegance as one continuous blind with one uninterrupted headrail, bottom rail and pair of front/back fabric planes.
- Keep the hero architecture rectilinear: the window head, sill and mullions remain parallel to the image edges so the blind never conflicts with a diagonal perspective.
- Build depth from separate complete raster layers: empty room, complete plant, side table, complete lamp (off/on), furniture, then Hommy/interface. Foreground objects must never be pre-cut to another object's silhouette.
- Scroll remains native, reversible and directly controls one timeline; include responsive and reduced-motion behavior.
- Development builds expose `?heroDebug=1` for exact progress and layer inspection.

## Hommy form animation requirements

- Treat `public/assets/hommy/hommy-official.png` as the immutable official appearance for the form character.
- Never use Rive, video, GIF, AI pose sequences, crossfades, whole-PNG movement, color filters or tablet feedback for this gesture.
- The only approved motion is `idle -> tapTablet -> idle`: eyes look toward the tablet, the head follows subtly, the articulated free arm touches once, and every piece returns to its exact starting pose.
- Build the character from full-canvas transparent layers aligned to the 1254 x 1254 official source. Rotate pieces only from the documented neck, shoulder, elbow and wrist pivots.
- If any required layer is absent or invalid, keep the new official PNG completely static while the form remains fully functional.
- Do not redesign the approved form layout, cards, typography, spacing, colors, Hommy crop, or subtitle panel while integrating the rig.
- Keep the approved head/face layers unchanged. The torso is a fixed shell and the shoulder and upper arm never crossfade. The elbow uses three clean layers: upper shell, independently rotating circular rotor, and lower forearm; no limb layer may contain a straight-cut scrap from its neighbour. Resting and pointing hands may use separately calibrated wrist pivots only when both cuffs retain visible overlap throughout the swap. The pointing hand must be colour-matched to the official arm and its fingertip must visibly enter the tablet screen plane during the press.
- The circular shoulder cover belongs inside the articulated upper-arm chain and must rotate with it; never pin it above the moving arm. The tablet/backplate renders in front of the tapping finger so the fingertip disappears naturally around the far screen edge instead of being pasted over the tablet back.
