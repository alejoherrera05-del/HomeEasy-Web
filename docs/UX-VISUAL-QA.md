# HomeEasy visual UX review gate

Before a visual change is considered ready, review the rendered production build as a visitor would see it, not only the source code.

## Required viewports

- Desktop: 1440 px wide.
- Mobile: 390 px wide.

## What must be checked visually

- Hero headline and body copy remain readable over the actual room image at every hero stage.
- No plant, window frame, Hommy, fixed button, navigation control or decorative element interferes with important text.
- Hommy must feel grounded in the room composition rather than pasted on top of it. Keep the approved character art unchanged; integration is handled by scale, placement, spacing and contact shadow.
- The first viewport must tell a new visitor what HomeEasy sells and offer a clear next action without requiring them to understand internal product terminology.
- Primary conversion language is consultation / quotation. A photo can be requested later by an advisor when useful; it is not the brand's primary call to action.
- Fixed navigation and contact controls must never cover Hommy, product controls, headings or form choices.
- Section copy should make sense to a homeowner scanning quickly. Avoid internal reasoning, negative framing and abstract slogans when a direct explanation is clearer.
- Product and recommendation interfaces may use containers when needed for interaction; editorial information should not default to repeated decorative cards.
- Check visual hierarchy, text contrast, density, whitespace and rhythm across the whole page before approving a release.

## Release rule

Passing unit tests and the production build is necessary but not sufficient. A visual change is not done until the current build has been rendered and reviewed at both required viewports.
