// Centralized site configuration for Demon Born Compass.
// Preview URL used for Vercel deployment preview.
// No custom domain purchased yet.

export const SITE_URL =
  import.meta.env.PROD
    ? 'https://demon-born-compass.vercel.app'
    : 'http://localhost:4321';

export const SITE_TITLE = 'Demon Born Compass';
export const SITE_DESCRIPTION =
  'Unofficial English guide for Demon Born Roblox — covering wiki status, controls, beginner guide, and codes status.';
export const SITE_LANG = 'en';

export const GAME_NAME = 'Demon Born';
export const CURRENT_VERSION = 'World Cup Beta (no public semantic version)';
export const EVIDENCE_REVIEW_DATE = '2026-06-29';
export const EVIDENCE_STATUS = 'official-confirmed';

// Ad toggle — set to false to disable all ads instantly across the entire site
export const ADS_ENABLED = false;

// Registered source IDs for this site
export const SOURCE_IDS = [
  'DB-ROBLOX-001',
  'DB-API-001',
  'DB-API-002',
  'DB-API-003',
  'DB-API-004',
  'DB-API-005',
  'DB-API-006',
  'DB-API-007',
  'DB-API-008',
  'DB-API-009',
  'DB-API-010',
  'DB-API-011',
  'DB-TRENDS-001',
  'DB-SERP-001',
  'DB-SERP-002',
  'DB-LEAD-001',
  'DB-LEAD-002',
  'DB-LEAD-005',
  'DB-LEAD-006',
  'DB-LEAD-007',
  'DB-LEAD-008',
  'DB-LEAD-009',
  'DB-LEAD-010',
  'DB-LEAD-011',
  'DB-LEAD-012',
  'DB-LEAD-013',
  'DB-LEAD-014',
  'DB-AUTO-001',
] as const;

// Pages in launch scope
export const LAUNCH_PAGES = [
  { url: '/',           title: 'Home' },
  { url: '/wiki/',      title: 'Wiki Status' },
  { url: '/trello/',    title: 'Trello Status' },
  { url: '/codes/',     title: 'Codes Status' },
  { url: '/controls/',  title: 'Controls' },
  { url: '/beginner-guide/', title: 'Beginner Guide' },
  { url: '/sources/',   title: 'Sources & Corrections' },
  { url: '/editorial/', title: 'Editorial Policy' },
  { url: '/about/',     title: 'About' },
  { url: '/privacy/',   title: 'Privacy' },
  { url: '/contact/',   title: 'Contact' },
] as const;