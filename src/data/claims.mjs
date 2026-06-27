/**
 * Demon Born Compass — Structured Claims Registry
 *
 * Mirrors the authoritative claims from the project's research/demon-born/claims.yaml
 * in a form that the site build and validator can use without accessing the
 * project-root research directory.
 *
 * Only claims with "official-confirmed" or "volatile_snapshot" confidence are
 * included here. Leads, community-reported, and user-observed items are not
 * published as game facts.
 *
 * source_ids map to source-log.csv entries tracked in src/data/sources.ts
 */

// ---------------------------------------------------------------------------
// Page declarations
// Each entry: url, title, type, sourceIds, claimIds, verificationStatus, gameVersion
// ---------------------------------------------------------------------------

/** @type {Record<string, {url: string, title: string, type: string, sourceIds: string[], claimIds: string[], verificationStatus: string, gameVersion: string}>} */
export const CONTENT_PAGES = {
  '/wiki/': {
    url: '/wiki/',
    title: 'Wiki Status',
    type: 'status_page',
    sourceIds: ['DB-SERP-001', 'DB-ROBLOX-001', 'DB-API-001'],
    claimIds: ['db-serp-001', 'db-identity-001', 'db-scope-001'],
    verificationStatus: 'serp-gap-confirmed',
    gameVersion: 'World Cup Beta',
  },
  '/trello/': {
    url: '/trello/',
    title: 'Trello Status',
    type: 'status_page',
    sourceIds: ['DB-SERP-001', 'DB-LEAD-001', 'DB-LEAD-002'],
    claimIds: ['db-serp-001'],
    verificationStatus: 'unverified-official-link',
    gameVersion: 'World Cup Beta',
  },
  '/codes/': {
    url: '/codes/',
    title: 'Codes Status',
    type: 'codes_status',
    sourceIds: ['DB-TRENDS-001', 'DB-SERP-001', 'DB-LEAD-001', 'DB-LEAD-002'],
    claimIds: ['db-trends-001', 'db-serp-001'],
    verificationStatus: 'source-limited',
    gameVersion: 'World Cup Beta',
  },
  '/controls/': {
    url: '/controls/',
    title: 'Controls',
    type: 'official_fact_page',
    sourceIds: ['DB-API-001'],
    claimIds: ['db-controls-001'],
    verificationStatus: 'official-confirmed',
    gameVersion: 'World Cup Beta',
  },
  '/beginner-guide/': {
    url: '/beginner-guide/',
    title: 'Beginner Guide',
    type: 'limited_fact_page',
    sourceIds: ['DB-API-001'],
    claimIds: ['db-scope-001', 'db-route-001', 'db-controls-001'],
    verificationStatus: 'official-confirmed-limited',
    gameVersion: 'World Cup Beta',
  },
};

/** @type {Record<string, {url: string, title: string, type: string}>} */
export const TRUST_PAGES = {
  '/sources/': {
    url: '/sources/',
    title: 'Sources & Corrections',
    type: 'trust',
  },
  '/editorial/': {
    url: '/editorial/',
    title: 'Editorial Policy',
    type: 'trust',
  },
  '/about/': {
    url: '/about/',
    title: 'About',
    type: 'trust',
  },
  '/privacy/': {
    url: '/privacy/',
    title: 'Privacy',
    type: 'trust',
  },
  '/contact/': {
    url: '/contact/',
    title: 'Contact',
    type: 'trust',
  },
};

/** @type {Record<string, {url: string, title: string, type: string, sourceIds: string[], claimIds: string[], verificationStatus: string, gameVersion: string}>} */
export const HOME_PAGE = {
  '/': {
    url: '/',
    title: 'Home',
    type: 'hub',
    sourceIds: ['DB-ROBLOX-001', 'DB-API-001', 'DB-TRENDS-001', 'DB-SERP-001'],
    claimIds: ['db-identity-001', 'db-scope-001', 'db-trends-001', 'db-serp-001'],
    verificationStatus: 'official-confirmed-limited',
    gameVersion: 'World Cup Beta',
  },
};

// ---------------------------------------------------------------------------
// Derived sets used by validator
// ---------------------------------------------------------------------------

/** All source IDs registered across the site */
export const REGISTERED_SOURCE_IDS = [
  ...new Set(
    Object.values({ ...CONTENT_PAGES, ...HOME_PAGE })
      .flatMap(p => p.sourceIds ?? [])
  ),
];

/** All claim IDs registered across the site */
export const REGISTERED_CLAIM_IDS = [
  ...new Set(
    Object.values({ ...CONTENT_PAGES, ...HOME_PAGE })
      .flatMap(p => p.claimIds ?? [])
  ),
];

/** All valid URL paths (used for internal link validation) */
export const REGISTERED_PATHS = new Set([
  '/',
  ...Object.keys(CONTENT_PAGES),
  ...Object.keys(TRUST_PAGES),
]);

/** Paths that are trust/utility pages (skipped in forbidden-content scan) */
export const TRUST_PAGE_PATHS = new Set(Object.keys(TRUST_PAGES));

/** Paths that are game content pages */
export const GAME_CONTENT_PAGE_PATHS = new Set(Object.keys(CONTENT_PAGES));

/** All pages keyed by path */
export const ALL_PAGES = { ...HOME_PAGE, ...CONTENT_PAGES, ...TRUST_PAGES };

// ---------------------------------------------------------------------------
// Claim-to-source mapping (mirrors claims.yaml)
// ---------------------------------------------------------------------------

/** Maps claim_id -> source_id, derived from claims.yaml */
export const CLAIM_SOURCE_MAP = {
  'db-identity-001':  'DB-API-001',
  'db-genre-001':     'DB-API-001',
  'db-scope-001':     'DB-API-001',
  'db-route-001':     'DB-API-001',
  'db-controls-001':  'DB-API-001',
  'db-players-001':   'DB-API-001',
  'db-snapshot-001':  'DB-API-001',
  'db-votes-001':     'DB-API-002',
  'db-group-001':     'DB-API-003',
  'db-badges-001':    'DB-API-004',
  'db-trends-001':    'DB-TRENDS-001',
  'db-serp-001':      'DB-SERP-001',
  // Page-level source IDs not tied to specific claims:
  // DB-ROBLOX-001 used on wiki and home pages for identity facts
  'db-page-roblox-001':  'DB-ROBLOX-001',
  // DB-LEAD-001 / DB-LEAD-002 used on trello and codes pages as competition leads
  'db-page-lead-001':    'DB-LEAD-001',
  'db-page-lead-002':    'DB-LEAD-002',
};