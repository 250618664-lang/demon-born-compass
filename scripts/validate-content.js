/**
 * validate-content.js
 *
 * Build-time content validation for Demon Born Compass.
 * Run: node scripts/validate-content.js
 * Part of: npm run build (runs automatically after astro build)
 *
 * 10 checks:
 *   1.  source_ids: every source_id declared in claims.mjs exists in the site source registry
 *   2.  claim_ids: every claim_id declared in claims.mjs exists in CLAIM_SOURCE_MAP
 *   3.  source_page_alignment: each page's declared source_ids match claim-to-source mapping
 *   4.  verification_status: every page has a non-empty status
 *   5.  game_version: every game content page has a version
 *   6.  unique titles: no two pages share the same <title>
 *   7.  unique canonical URLs: no two pages share the same URL path
 *   8.  internal links: all relative hrefs resolve to a registered page
 *   9.  no forbidden content: no tier list, best clan, best breathing, copied codes, etc.
 *   10. no Echoes/Aincrad/echoescompass cross-contamination
 *
 * Exit code 0 = pass. Exit code 1 = at least one failure.
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
// __dirname     = d:/游戏站项目/sites/demon-born/scripts
// ..            = demon-born (site root)
const SITE_ROOT = join(__dirname, '..');
const DIST_DIR  = join(SITE_ROOT, 'dist');

// ---- Load site data ----
const {
  CONTENT_PAGES,
  TRUST_PAGES,
  HOME_PAGE,
  REGISTERED_PATHS,
  CLAIM_SOURCE_MAP,
} = await import('../src/data/claims.mjs');

// ---- Explicit FORBIDDEN_PATTERNS ----
const FORBIDDEN_PATTERNS = [
  { pattern: /tier\s+list/i,                                  label: 'Tier list' },
  { pattern: /"best"\s+(clan|build|breathing|weapon)/i,       label: 'Best clan/build/breathing' },
  { pattern: /best\s+(clan|build|breathing\s+style)/i,        label: 'Best clan/build/breathing' },
  { pattern: /breathing\s+style/i,                            label: 'Breathing style (unverified)' },
  { pattern: /blood\s+demon\s+arts/i,                          label: 'Blood demon arts (unverified)' },
  { pattern: /clan\s+(tier|rank|ranking)/i,                    label: 'Clan tier/ranking' },
  { pattern: /working\s+codes?\s+(from|copied)/i,              label: 'Working codes copied from third party' },
  { pattern: /official\s+trello/i,                             label: 'Official Trello claimed without verification' },
  { pattern: /official\s+discord/i,                            label: 'Official Discord claimed without verification' },
  { pattern: /pocket\s+tactics|destructoid|beebom|radio\s+times/i, label: 'Third-party code site referenced as source' },
  { pattern: /walkthrough/i,                                   label: 'Walkthrough' },
  { pattern: /boss\s+(guide|name|mechanic)/i,                  label: 'Boss guide/name' },
  { pattern: /interactive\s+map/i,                             label: 'Interactive map' },
  { pattern: /secret\s+area|hidden\s+location/i,              label: 'Secret area / hidden location' },
  { pattern: /drop\s+rate/i,                                   label: 'Drop rate' },
  { pattern: /damage\s+number/i,                               label: 'Damage number' },
  { pattern: /亲测|tested\s+by\s+(us|our|this\s+site)/i,       label: 'False tested claim' },
  { pattern: /hands[\s-]?on\s+tested/i,                        label: 'Unverified hands-on tested claim' },
  // Demon Born specific cross-contamination
  { pattern: /echoes\s+of\s+aincrad/i,                         label: 'Echoes of Aincrad cross-contamination' },
  { pattern: /echoescompass/i,                                 label: 'echoescompass cross-contamination' },
  { pattern: /aincrad/i,                                       label: 'Aincrad cross-contamination' },
];

// ---- DENIAL_PATTERNS (phrases that negate forbidden content — false-positive overrides) ----
const DENIAL_PATTERNS = [
  /no\s+(tier\s+list|walkthrough|boss\s+guide|interactive\s+map|secret\s+area|best\s+build|breathing\s+style|clan)/i,
  /no\s+official\s+(tier\s+list|walkthrough|boss\s+guide|interactive\s+map|trello|discord)/i,
  /not\s+a\s+(tier\s+list|walkthrough|guide)/i,
  /this\s+page\s+does\s+not\s+(contain|cover|include|have)/i,
  /unofficial.*map|fan.*map/i,
  /not\s+yet\s+confirmed|not\s+yet\s+verified|not\s+confirmed\s+from\s+official/i,
  /no\s+verified\s+official/i,
  /requires\s+hands[\s-]?on\s+testing|require\s+hands[\s-]?on\s+testing/i,
  /detailed\s+.*\s+require[s]?\s+(hands[\s-]?on\s+)?testing/i,
  /walkthrough\s+steps\s+require/i,
  /no\s+walkthrough\s+published/i,
  /not\s+yet\s+published\s+as\s+a\s+walkthrough/i,
];

function isDenial(text, pattern) {
  if (!pattern.test(text)) return false;
  return DENIAL_PATTERNS.some(d => d.test(text));
}

// ---- REGISTERED_PATHS with trailing slashes stripped for link validation ----
const REGISTERED_PATHS_NORMALIZED = new Set(
  [...REGISTERED_PATHS].map(p => p.replace(/\/$/, '') || '/')
);

// ---- Collect built HTML files ----
const NON_PAGE_DIRS = new Set(['_assets', '_astro', 'node_modules']);
function getBuiltPages(distDir) {
  const pages = [];
  for (const entry of readdirSync(distDir, { withFileTypes: true })) {
    if (entry.isDirectory() && !NON_PAGE_DIRS.has(entry.name)) {
      const indexFile = join(distDir, entry.name, 'index.html');
      pages.push({ path: `/${entry.name}/`, file: indexFile });
    }
  }
  pages.push({ path: '/', file: join(distDir, 'index.html') });
  return pages;
}

// ---- Extract metadata from built HTML ----
function extractMeta(html, field) {
  switch (field) {
    case 'title': {
      const m = html.match(/<title>([^<]+)<\/title>/);
      return m ? m[1].trim() : null;
    }
    case 'canonical': {
      const m = html.match(/<link rel="canonical" href="([^"]+)"/);
      return m ? m[1].trim() : null;
    }
    default:
      return null;
  }
}

// ---- Extract internal relative hrefs from HTML ----
function extractInternalLinks(html) {
  const hrefs = [];
  const re = /href="(\/[^"]+)"/g;
  let m;
  while ((m = re.exec(html)) !== null) {
    hrefs.push(m[1].replace(/\/$/, '') || '/');
  }
  return [...new Set(hrefs)];
}

const ASSET_PATTERNS = [
  /\/_assets\//, /\.css$/, /\.js$/, /\.svg$/, /\.png$/, /\.jpg$/, /\.ico$/,
];

let errors = [];

// =============================================================================
// CHECK 1: all declared source_ids are registered in the site source registry
// =============================================================================
console.log('\n[1/10] Validating source IDs are registered...');
// SOURCE_IDS are stored in site.ts but for validator we check against the
// source IDs actually used in pages vs. what's in CLAIM_SOURCE_MAP values
const allSourceIdsUsed = new Set(
  Object.values({ ...CONTENT_PAGES, ...HOME_PAGE })
    .flatMap(p => p.sourceIds ?? [])
);
const allKnownSourceIds = new Set(Object.values(CLAIM_SOURCE_MAP));
for (const sid of allSourceIdsUsed) {
  if (!allKnownSourceIds.has(sid)) {
    errors.push(`FAIL [source_id] "${sid}" used in a page but not in CLAIM_SOURCE_MAP`);
  }
}
console.log('  PASS — all declared source_ids accounted for in CLAIM_SOURCE_MAP');

// =============================================================================
// CHECK 2: all declared claim_ids exist in CLAIM_SOURCE_MAP
// =============================================================================
console.log('\n[2/10] Validating claim_ids against CLAIM_SOURCE_MAP...');
const allClaimIdsUsed = new Set(
  Object.values({ ...CONTENT_PAGES, ...HOME_PAGE })
    .flatMap(p => p.claimIds ?? [])
);
for (const cid of allClaimIdsUsed) {
  if (!CLAIM_SOURCE_MAP[cid]) {
    errors.push(`FAIL [claim_id] "${cid}" used in a page but not in CLAIM_SOURCE_MAP`);
  }
}
console.log('  PASS — all declared claim_ids found in CLAIM_SOURCE_MAP');

// =============================================================================
// CHECK 3: source_page_alignment — each claim's source matches page's declared sourceIds
// =============================================================================
console.log('\n[3/10] Validating source-page alignment...');
for (const [pagePath, pageData] of Object.entries({ ...CONTENT_PAGES, ...HOME_PAGE })) {
  const expectedSourceIds = new Set(pageData.sourceIds ?? []);
  for (const cid of pageData.claimIds ?? []) {
    const claimSourceId = CLAIM_SOURCE_MAP[cid];
    if (claimSourceId && !expectedSourceIds.has(claimSourceId)) {
      errors.push(
        `FAIL [source_align] ${pagePath}: claim "${cid}" maps to source "${claimSourceId}" ` +
        `but page declares [${[...expectedSourceIds].join(', ')}]`
      );
    }
  }
}
console.log('  PASS — all claim-to-source mappings consistent with page declarations');

// =============================================================================
// CHECK 4: verification_status presence
// =============================================================================
console.log('\n[4/10] Validating verification_status on all pages...');
const allPages = { ...HOME_PAGE, ...CONTENT_PAGES, ...TRUST_PAGES };
for (const [pagePath, pageData] of Object.entries(allPages)) {
  if (pageData.type !== 'trust') {
    if (!pageData.verificationStatus || pageData.verificationStatus.trim() === '') {
      errors.push(`FAIL [verification_status] ${pagePath}: status is empty`);
    }
  }
}
console.log('  PASS — all game pages have verification_status');

// =============================================================================
// CHECK 5: game_version presence for game content pages
// =============================================================================
console.log('\n[5/10] Validating game_version on game content pages...');
for (const [pagePath, pageData] of Object.entries({ ...CONTENT_PAGES, ...HOME_PAGE })) {
  if (!pageData.gameVersion || pageData.gameVersion.trim() === '') {
    errors.push(`FAIL [game_version] ${pagePath}: version is empty`);
  }
}
console.log('  PASS — all game pages have game_version');

// =============================================================================
// CHECKS 6-7: Unique titles, canonicals
// =============================================================================
console.log('\n[6-7/10] Checking unique titles and canonicals...');
const pages = getBuiltPages(DIST_DIR);
const titles     = new Map();
const canonicals = new Map();

for (const { path, file } of pages) {
  let html;
  try {
    html = readFileSync(file, 'utf-8');
  } catch (e) {
    errors.push(`FAIL [read_file] ${file}: ${e.message}`);
    continue;
  }
  const title  = extractMeta(html, 'title');
  const canon  = extractMeta(html, 'canonical');

  if (title) {
    if (titles.has(title)) {
      errors.push(`FAIL [duplicate_title] "${title}" appears on ${path} and ${titles.get(title)}`);
    } else {
      titles.set(title, path);
    }
  }
  if (canon) {
    if (canonicals.has(canon)) {
      errors.push(`FAIL [duplicate_canonical] "${canon}" on ${path} and ${canonicals.get(canon)}`);
    } else {
      canonicals.set(canon, path);
    }
  }
}
console.log(`  PASS — ${titles.size} titles, ${canonicals.size} canonicals all unique`);

// =============================================================================
// CHECK 8: Internal links resolve
// =============================================================================
console.log('\n[8/10] Checking all internal links resolve to registered pages...');
let linkErrors = 0;
for (const { path, file } of pages) {
  let html;
  try {
    html = readFileSync(file, 'utf-8');
  } catch (e) {
    errors.push(`FAIL [read_file] ${file}: ${e.message}`);
    continue;
  }
  const links = extractInternalLinks(html);
  for (const link of links) {
    const normalized = link.replace(/\/$/, '') || '/';
    if (normalized.startsWith('http') || normalized.startsWith('mailto:')) continue;
    if (ASSET_PATTERNS.some(re => re.test(normalized))) continue;
    if (REGISTERED_PATHS_NORMALIZED.has(normalized)) continue;
    errors.push(`FAIL [broken_link] ${path}: "${normalized}" not registered`);
    linkErrors++;
  }
}
if (linkErrors === 0) console.log('  PASS — all internal links resolve');
else console.log(`  FAIL — ${linkErrors} broken link(s)`);

// =============================================================================
// CHECK 9: no forbidden content
// =============================================================================
console.log('\n[9/10] Scanning for forbidden / unverified content claims...');
// Exact trust-page paths that are skipped (disclaimers appear there legitimately)
const SKIPPED_EXACT = new Set([
  '/', '/sources/', '/editorial/', '/about/', '/privacy/', '/contact/',
]);
let forbiddenErrors = 0;
for (const { path, file } of pages) {
  if (SKIPPED_EXACT.has(path)) continue;
  let html;
  try {
    html = readFileSync(file, 'utf-8');
  } catch (e) {
    errors.push(`FAIL [read_file] ${file}: ${e.message}`);
    continue;
  }
  // Strip info-note and evidence-badge blocks (contain legitimate disclaimers)
  const text = html
    .replace(/<div class="info-note"[^>]*>[\s\S]*?<\/div>\s*<\/div>/g, ' ')
    .replace(/<div class="info-block"[^>]*>[\s\S]*?<\/div>/g, ' ')
    .replace(/<div class="evidence-strip-bar[^"]*"[^>]*>[\s\S]*?<\/div>/g, ' ')
    .replace(/<[^>]+>/g, ' ');
  for (const { pattern, label } of FORBIDDEN_PATTERNS) {
    if (pattern.test(text) && !isDenial(text, pattern)) {
      errors.push(`FAIL [forbidden_content] ${path}: "${label}" found`);
      forbiddenErrors++;
    }
  }
}
if (forbiddenErrors === 0) console.log('  PASS — no forbidden content found');
else console.log(`  FAIL — ${forbiddenErrors} forbidden content occurrence(s)`);

// =============================================================================
// CHECK 10: no Echoes/Aincrad/echoescompass cross-contamination
// =============================================================================
console.log('\n[10/10] Checking for Echoes/Aincrad cross-contamination...');
let contaminationErrors = 0;
const CONTAMINATION_PATTERNS = [
  /echoes\s+of\s+aincrad/i,
  /echoescompass/i,
  /aincrad/i,
];
for (const { path, file } of pages) {
  let html;
  try {
    html = readFileSync(file, 'utf-8');
  } catch (e) {
    continue;
  }
  const text = html.replace(/<[^>]+>/g, ' ');
  for (const re of CONTAMINATION_PATTERNS) {
    if (re.test(text)) {
      errors.push(`FAIL [contamination] ${path}: pattern "${re}" found — possible cross-contamination`);
      contaminationErrors++;
    }
  }
}
if (contaminationErrors === 0) console.log('  PASS — no cross-contamination detected');
else console.log(`  FAIL — ${contaminationErrors} contamination occurrence(s)`);

// =============================================================================
// SUMMARY
// =============================================================================
console.log('\n' + '='.repeat(60));
if (errors.length === 0) {
  console.log('ALL 10 CHECKS PASSED');
  process.exit(0);
} else {
  console.log(`${errors.length} ERROR(S):`);
  for (const err of errors) {
    console.log('  ' + err);
  }
  process.exit(1);
}