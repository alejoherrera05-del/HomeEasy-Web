# HomeEasy Web Instructions

## Multi-agent delivery model

The current project thread acts as `HOMEEASY — PROJECT LEAD / ORCHESTRATOR`. It coordinates scope, assigns independent reviews, consolidates findings, and prevents contradictory changes. A single agent must never design, implement, and grant final approval to its own work.

Use the repository skills under `.agents/skills/` for independent design/UX, iPhone/Safari, brand/content, local SEO, and release-gate work. The frontend implementer receives approved problems, implements only that scope, runs tests/build, renders the result, and provides complete 1440 px and 390 px evidence. Design, iPhone/Safari, content/SEO, and release review must be performed independently as applicable.

No visual implementation is ready for merge or production until the rendered result has passed the independent design and technical gates. Safari/iPhone claims require physical-device evidence; otherwise record `Requiere validación física en Safari/iPhone`. The release gate may reject a change even when tests and build pass.

Do not work in or modify `alejoherrera05-del/Homeeasy`; this project is exclusively `alejoherrera05-del/HomeEasy-Web`.

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable website-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local site can be handed to Sites. Before a Sites handoff, run `pnpm run build` and `pnpm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.

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
- Do not redesign the approved form layout, typography, spacing, colors, Hommy crop, or subtitle panel while integrating the rig unless a later approved editorial refinement explicitly changes them.
- Keep the approved head/face layers unchanged. The torso is a fixed shell and the shoulder and upper arm never crossfade. The elbow uses three clean layers: upper shell, independently rotating circular rotor, and lower forearm; no limb layer may contain a straight-cut scrap from its neighbour. Resting and pointing hands may use separately calibrated wrist pivots only when both cuffs retain visible overlap throughout the swap. The pointing hand must be colour-matched to the official arm and its fingertip must visibly enter the tablet screen plane during the press.
- The circular shoulder cover belongs inside the articulated upper-arm chain and must rotate with it; never pin it above the moving arm. The tablet/backplate renders in front of the tapping finger so the fingertip disappears naturally around the far screen edge instead of being pasted over the tablet back.

## HomeEasy experience and art-direction requirements — 2026-08-27

- The production experience must not look AI-generated, template-driven or like a prototype. Avoid generic marketing filler, decorative timelines without a real user purpose, fake before/after comparisons, repeated visual devices and UI sections that exist only to fill vertical space.
- Every section must have a clear narrative role in the buying journey and use concrete HomeEasy language tied to real window behavior: light, privacy, opening type, passage, size, daily use, manual/motorized control and installation.
- Do not repeat the same Hommy pose across hero, recommender and closing CTA. The recommender keeps the approved articulated/tablet Hommy; the hero uses the approved ambassador pose; the footer should not reuse mascot art merely as decoration.
- Wallpaper imagery must be visually honest. Never label two different rooms/camera angles as “antes” and “después”. Use a true same-scene transformation if one exists; otherwise use editorial product/context presentation instead of a comparison slider.
- Process/service content should explain how HomeEasy actually works rather than use a decorative connected-circle timeline. Prefer ordered editorial rows, typography and spacing over a repeated grid of decorative cards.
- The standalone automation section is intentionally omitted from the current public-site narrative. Do not restore it simply to add content length; only reintroduce automation if there is a concrete product story or customer need worth showing.
- Brand rose is `#B2566C` across the main UI unless a documented variant is intentionally required.

## Mobile motion stability — user feedback 2026-08-28

- On iPhone Safari, the hero must remain visually solid while the browser bars expand or contract. Height-only `visualViewport` changes during an active scroll must not recalculate the pin distance, stretch the document, reset the scene state or make the blind flicker.
- Progress, visible scene, active light control and accessible stage label must stay synchronized after refresh, rotation and exact terminal progress.
- The first scroll gesture must feel anchored. Keep the hero pinned from the document origin and give mobile enough native scroll distance plus an opening plateau so Safari's toolbar contraction does not read as a scene jump.
- The completed ambient-light state must remain visible for a meaningful final portion of the native scroll range on desktop and mobile. Create this dwell inside the reversible timeline; never trap input, cancel touch events, force a timeout, or use scroll-jacking.

## Mobile Hommy recommender — user feedback 2026-08-28

- On phones, Hommy's official `idle -> tapTablet -> idle` reaction and the active question must coexist in the viewport. Keep Hommy as a compact sticky adviser within the recommender while the document itself scrolls; do not add a nested scroller, fixed overlay, game-show chrome or answers placed over the character.
- A selected answer must remain visibly selected until the tablet-touch moment is readable, then advance predictably to the next question. Keep the official rig mounted and preserve its complete return to idle; reduced motion uses only the short accessible feedback duration.
- Mobile answers must preserve native button semantics, at least 44 px targets, a non-color selected state, readable label/detail sizes, duplicate-tap protection, an announced Hommy status and predictable focus on the next question.

## Approved next-round visual scope — user direction

These items are approved scope constraints for the next implementation round, but they do not authorize an unreviewed redesign or production push.

- Improve the desktop ambient-light face effect for hero Hommy. Preserve the approved full character, pose, identity, geometry and colors. If a CSS overlay cannot produce a premium result, a tightly cropped second face/screen state may be created for ambient light and swapped in a controlled way. It may brighten eyes, mouth and appropriate luminous expression details, but must not restyle or regenerate the whole character or look like a global filter.
- Remove accidental vertical emptiness. Audit section gaps, padding, min-heights and transitions between hero, recommender, catalogue, wallpaper, process and contact. Keep intentional editorial breathing room; remove large bands that do not add hierarchy or meaning.
- Redesign `Cómo trabajamos` with stronger art direction while retaining the six exact customer steps. It may use a real/editorial image, asymmetric composition, a highlighted `Visita sin costo`, useful step content and a clear CTA. Do not reduce it to a cold grid, decorative timeline or generic text boxes.
- The current contact/closing visual treatment is rejected and must be redesigned. The new close must visibly prioritize HomeEasy, Popayán, the physical address, WhatsApp, Instagram and Facebook, with clear icons for WhatsApp, Instagram, Facebook and location. It must expose `Cotizar proyecto`, `Agendar visita sin costo` and `Hablar por WhatsApp` as distinct actions and may use official triangles or one purposeful supporting image.
- Rewrite late-page copy only where needed so it is human, concrete, commercially intentional and specific to HomeEasy. Every line must help the visitor understand, trust, advance, contact or quote; reject administrative, interchangeable or AI-sounding filler.
- Use photography or visual product resources when they add meaning and integrate with the established premium editorial system. Never add images, panels or decoration merely to fill space.
- Strengthen brand recall and local presence, especially at the close: HomeEasy is in Popayán, advises, quotes, schedules a free visit and installs.
- After implementation, render the full experience at 1440 px and 390 px, compare before/after, and have independent Design, iPhone/Safari and Release agents review hero, process and contact. Do not approve if the result remains empty, generic, weak or visually unresolved.

## Hero → Hommy → catálogo mobile phase — physical iPhone feedback 2026-08-28

- This phase is limited to the hero handoff, the Hommy recommender and the mobile catalogue. Do not alter wallpaper, process, footer, SEO, the approved hero Hommy asset or core HomeEasy identity while delivering it.
- The hero must keep its four reversible physical states but should not occupy an excessive number of screens. The final 8–10% is a calm handoff: the stage navigation becomes lighter and recedes while a restrained Hommy recommender cue begins to appear. Do not add another complex ScrollTrigger, input lock or theatrical transition.
- On phones, Hommy is the recommender's protagonist in a roughly 300–330 px sticky stage contained strictly within the recommender. Keep face, torso, tablet and articulated tapping arm readable, and place the live message as a discreet overlay instead of shrinking the character beside a large text block.
- After an answer, keep the selected choice and Hommy's response readable for about 650–800 ms before moving to the next question. The complete official rig reaction may finish after the question advances, but rapid taps remain locked until the rig returns safely to idle.
- The recommender introduction should be compact and direct; it must not consume a large mobile viewport before the first question. Use concrete language such as “Hommy te ayuda a elegir” and let the stage plus question carry the experience.
- Mobile catalogue navigation has one horizontal row only: the need filters. Hide the second family scroller and replace it with a simple selected-system control showing the product name, its position (for example `1 de 12`) and previous/next arrows. Opening the name or “Cambiar sistema” reveals a simple native-style list or bottom sheet without a new UI library.
- Mobile galleries keep the primary image large. Thumbnails are approximately 90–105 px wide, horizontally scroll with snap, use labels of at least 12 px, and make video items visibly distinct from photos.
- Mobile catalogue text minimums for this phase are: filters 13.5–14 px, metadata 12–13 px, thumbnail labels at least 12 px, body 15–16 px, titles 36–42 px and buttons at least 14 px.
- Validate complete renders at 1440 px and 390 px. Physical Safari/iPhone approval remains separate and must be recorded as required until the user validates the deployed preview.

## Repository maintenance

- Use pnpm as the single package manager for this website. Keep `pnpm-lock.yaml` authoritative; do not reintroduce `package-lock.json` or a workspace file unless the project actually becomes a workspace.

## Anti-template design rules

- HomeEasy must not drift into generic AI/SaaS landing-page defaults. Avoid decorative card grids, card-inside-card compositions, gratuitous pills, glassmorphism, gradients used only for decoration, and repeated eyebrow tags above every heading.
- Use containers only when they carry interaction or structure. Editorial content should rely on typography, spacing, rules, photography, and deliberate asymmetry before introducing another surface.
- Copy must describe a concrete customer action, product behavior, or decision. Avoid broad filler such as “transform your space”, “elevate your experience”, “unlock”, “hablemos de tu espacio”, or other interchangeable marketing phrases.
- HomeEasy brand personality comes from the real assets and product expertise: `triangulo.png`, `triangulogold.png`, Hommy only where useful, the rose/gold palette, real window constraints, real fabrics, and real installation logic.
- Product-category filters should read as navigation/tabs rather than decorative pill chips unless a pill shape has a genuine semantic or interaction reason.
- Prefer one strong idea per section. If a section does not help a visitor understand a product, make a decision, trust the service, or contact HomeEasy, remove it.

## Premium landing refinement — 2026-08-27

- The hero sells the complete HomeEasy service, not only light control: use the approved project copy, give it a clean left reading zone, keep the layered Sheer animation unchanged, and integrate the approved ambassador Hommy at realistic scale on the right.
- Prefer fewer, larger and more legible modules. Avoid microcopy, cards nested inside cards, decorative bars and repeated messages that make the page feel like a generated mockup.
- The wallpaper section uses a true same-room before/after pair. The camera, architecture, furniture and lighting must match; only the wall finish may change.
- Contact is a warm, light editorial closing section with the visible WhatsApp number `+57 333 431 9374`, clear service facts and two explicit conversion paths: WhatsApp and quotation request.
- Decorative brand monograms should be flat vector artwork. Never use glossy or 3D logo treatments as UI decoration.

## Local brand and conversion requirements — 2026-08-27

- HomeEasy is presented as a local Popayán business. Keep the public NAP consistent everywhere: Transversal 9 # 6N-26, Popayán, Cauca; WhatsApp +57 333 431 9374; Instagram and Facebook @homeeasypopayan.
- The primary local search language is “persianas en Popayán” and “papel de colgadura en Popayán”. Use it naturally in the H1, metadata and closing contact context; never keyword-stuff product descriptions or image alt text.
- The public service sequence has six customer-facing steps: asesoría, cotización, visita sin costo, medición, definición de sistema/material e instalación.
- Wallpaper claims must remain grounded in official Pentagrama catalogues. The Conceptos catalogue supports the factual labels lavable, buena resistencia a la luz and fácil de retirar, plus roll sizes and case types; do not extrapolate unsupported performance claims.
- Desktop and mobile hero layouts are separate compositions. The mobile hero must keep the Sheer Elegance action legible, Hommy grounded and all four light states reachable without clipping.
