# Demon Born launch scope

## Preview launch pages

Publishable for Vercel preview:

1. `/`
2. `/wiki/`
3. `/trello/`
4. `/codes/`
5. `/controls/`
6. `/beginner-guide/`
7. `/sources/`
8. `/editorial/`
9. `/about/`
10. `/privacy/`
11. `/contact/`

## Must not publish yet

- `/clans/`
- `/classes/`
- `/breathing-styles/`
- `/blood-demon-arts/`
- `/tier-list/`
- `/map/`
- `/quests/`
- `/bosses/`

These require official documentation or hands-on gameplay.

## Acceptance criteria

- Every game fact maps to `research/demon-born/claims.yaml`.
- Every page declares source IDs and verification status.
- Codes page does not list third-party codes.
- Trello page does not claim an official Trello exists unless verified.
- No third-party screenshots/images.
- Ads disabled.
- Do not mix Echoes Compass / Echoes of Aincrad content, source IDs, page copy, brand language or metadata into this site.
- Reusing the Astro engineering pattern is allowed; reusing Echoes game content or visual identity is not.
- `npm run build` and `npm run check` pass.
- If no custom domain is purchased, set site URL to a neutral placeholder and keep noindex/robots behavior appropriate for preview, or ask the user before public indexing.
