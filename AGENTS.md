# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

## HomeEasy hero motion requirements

- Preserve the current visual design, interface composition, copy, navigation and brand color `#B2566C` unless an explicitly approved refinement replaces one of them.
- The Sheer Elegance hero must be a deterministic layered scene, never a crossfade or sequence of independently generated room photographs.
- Keep the room, windows, exterior, furniture and Hommy geometrically fixed. Animate only the fabric reveal, relative band phase, light filtering and localized lamp state.
- Model the panoramic Sheer Elegance as one continuous blind with one uninterrupted headrail, bottom rail and pair of front/back fabric planes.
- Keep the hero architecture rectilinear: the window head, sill and mullions remain parallel to the image edges so the blind never conflicts with a diagonal perspective.
- Build depth from separate complete raster layers: empty room, complete plant, side table, complete lamp (off/on), furniture, then Hommy/interface. Foreground objects must never be pre-cut to another object's silhouette.
- Scroll remains native, reversible and directly controls one timeline; include responsive and reduced-motion behavior.
- Development builds expose `?heroDebug=1` for exact progress and layer inspection.
- The hero Hommy is a distinct ambassador pose approved by the user on 2026-08-27: full-body, placed on the right, looking/presenting toward the left. Do not regenerate, recolor, mirror, restyle, re-pose or substitute that approved character without explicit user approval. Technical background removal for web integration may remove only background pixels; it must not recolor the character.

## Hommy form animation requirements

- Treat `public/assets/hommy/hommy-official.png` as the immutable official appearance for the form character.
- Never use Rive, video, GIF, AI pose sequences, crossfades, whole-PNG movement, color filters or tablet feedback for this gesture.
- The only approved motion is `idle -> tapTablet -> idle`: eyes look toward the tablet, the head follows subtly, the articulated free arm touches once, and every piece returns to its exact starting pose.
- Build the character from full-canvas transparent layers aligned to the 1254 x 1254 official source. Rotate pieces only from the documented neck, shoulder, elbow and wrist pivots.
- If any required layer is absent or invalid, keep the new official PNG completely static while the form remains fully functional.
- Do not redesign the approved form layout, cards, typography, spacing, colors, Hommy crop, or subtitle panel while integrating the rig.
- Keep the approved head/face layers unchanged. The torso is a fixed shell and the shoulder and upper arm never crossfade. The elbow uses three clean layers: upper shell, independently rotating circular rotor, and lower forearm; no limb layer may contain a straight-cut scrap from its neighbour. Resting and pointing hands may use separately calibrated wrist pivots only when both cuffs retain visible overlap throughout the swap. The pointing hand must be colour-matched to the official arm and its fingertip must visibly enter the tablet screen plane during the press.
- The circular shoulder cover belongs inside the articulated upper-arm chain and must rotate with it; never pin it above the moving arm. The tablet/backplate renders in front of the tapping finger so the fingertip disappears naturally around the far screen edge instead of being pasted over the tablet back.

## HomeEasy experience and art-direction requirements — 2026-08-27

- The production experience must not look AI-generated, template-driven or like a prototype. Avoid generic marketing filler, decorative timelines without a real user purpose, fake before/after comparisons, repeated visual devices and UI sections that exist only to fill vertical space.
- Every section must have a clear narrative role in the buying journey and use concrete HomeEasy language tied to real window behavior: light, privacy, opening type, passage, size, daily use, manual/motorized control and installation.
- Do not repeat the same Hommy pose across hero, recommender and closing CTA. The recommender keeps the approved articulated/tablet Hommy; the hero uses the approved ambassador pose; the footer should not reuse mascot art merely as decoration.
- Wallpaper imagery must be visually honest. Never label two different rooms/camera angles as “antes” and “después”. Use a true same-scene transformation if one exists; otherwise use editorial product/context presentation instead of a comparison slider.
- Process/service content should explain how HomeEasy actually works rather than use a decorative connected-circle timeline. Prefer specific service steps and editorial cards.
- Automation examples should describe believable daily moments and user benefits; avoid arbitrary clock times unless they are user-set examples with clear context.
- Brand rose is `#B2566C` across the main UI unless a documented variant is intentionally required.

## Repository maintenance

- Use pnpm as the single package manager for this website. Keep `pnpm-lock.yaml` authoritative; do not reintroduce `package-lock.json` or a workspace file unless the project actually becomes a workspace.
