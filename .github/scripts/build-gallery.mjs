// Builds gallery/manifest.json and gallery/thumbs/** from the photos/ folder.
// Each sub-folder of photos/ becomes an album. Run by the build-gallery workflow.
// No npm dependencies: shells out to ImageMagick (convert/identify), preinstalled on runners.

import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, extname } from 'node:path';

const ROOT = process.cwd();
const PHOTOS = join(ROOT, 'photos');
const THUMBS = join(ROOT, 'gallery', 'thumbs');
const MANIFEST = join(ROOT, 'gallery', 'manifest.json');
const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const THUMB_MAX = 600; // px, longest side

const titleCase = (s) =>
  s.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/\b\w/g, (c) => c.toUpperCase());

const encPath = (...parts) => '/' + parts.map(encodeURIComponent).join('/');

function listDirs(p) {
  if (!existsSync(p)) return [];
  return readdirSync(p).filter((n) => !n.startsWith('.') && statSync(join(p, n)).isDirectory());
}
function listImages(p) {
  return readdirSync(p)
    .filter((n) => !n.startsWith('.') && IMG_EXT.has(extname(n).toLowerCase())) // skip hidden/.trashed files
    .sort();
}

// Rebuild thumbs from scratch so renamed/removed photos don't leave orphans.
rmSync(THUMBS, { recursive: true, force: true });
mkdirSync(THUMBS, { recursive: true });

const albums = [];
for (const dir of listDirs(PHOTOS).sort()) {
  const srcDir = join(PHOTOS, dir);
  const imgs = listImages(srcDir);
  if (imgs.length === 0) continue;

  const outDir = join(THUMBS, dir);
  mkdirSync(outDir, { recursive: true });

  const images = [];
  for (const img of imgs) {
    const src = join(srcDir, img);
    const out = join(outDir, img);
    // Auto-orient (respect EXIF from phones), strip metadata, shrink-only, compress.
    execFileSync('convert', [
      src, '-auto-orient', '-strip',
      '-resize', `${THUMB_MAX}x${THUMB_MAX}>`,
      '-quality', '82', out,
    ]);
    let w = 0, h = 0;
    try {
      const dim = execFileSync('identify', ['-format', '%w %h', out]).toString().trim().split(/\s+/);
      w = parseInt(dim[0], 10) || 0;
      h = parseInt(dim[1], 10) || 0;
    } catch { /* dimensions optional */ }
    images.push({ full: encPath('photos', dir, img), thumb: encPath('gallery', 'thumbs', dir, img), w, h });
  }

  albums.push({
    slug: dir,
    title: titleCase(dir),
    count: images.length,
    cover: images[0].full,
    coverThumb: images[0].thumb,
    images,
  });
}

// No volatile fields (e.g. timestamps): identical photos -> identical manifest,
// so the workflow only commits when the photo set actually changes.
const manifest = { albums };
mkdirSync(join(ROOT, 'gallery'), { recursive: true });
writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));
console.log(`Built manifest: ${albums.length} album(s), ${albums.reduce((n, a) => n + a.count, 0)} photo(s).`);
