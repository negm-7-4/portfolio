/**
 * Generates responsive AVIF/WebP derivatives for everything in public/projects.
 *
 * The project shots shipped as full-size JPEG/PNG with no modern format and no
 * srcset, so a phone downloaded the same ~200 kB desktop file a 27" display
 * did. This emits, per source image:
 *
 *   name-640.avif  name-640.webp
 *   name-1024.avif name-1024.webp
 *   name-1600.avif name-1600.webp
 *
 * …plus a ~400-byte inline LQIP per image, recorded in the manifest.
 *
 * …and leaves the original in place as the <img src> fallback. `ProjectVisual`
 * builds the <picture> sources from the same width list.
 *
 * Run with `npm run images`. Output is committed, so a deploy never depends on
 * sharp being installable in the build environment.
 */
import { mkdir, readdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const SOURCE_DIR = "public/projects";
const OUT_DIR = "public/projects/responsive";
const WIDTHS = [640, 1024, 1600];
const SOURCE_EXT = new Set([".jpg", ".jpeg", ".png"]);

const kb = (bytes) => `${Math.round(bytes / 1024)} kB`;

async function main() {
  await mkdir(OUT_DIR, { recursive: true });

  const files = (await readdir(SOURCE_DIR)).filter((f) =>
    SOURCE_EXT.has(path.extname(f).toLowerCase())
  );

  if (files.length === 0) {
    console.log("No source images found in", SOURCE_DIR);
    return;
  }

  let before = 0;
  let after = 0;
  const manifest = {};

  for (const file of files) {
    const src = path.join(SOURCE_DIR, file);
    const base = path.basename(file, path.extname(file));
    const image = sharp(src);
    const meta = await image.metadata();
    before += (await stat(src)).size;

    const entry = { width: meta.width, height: meta.height, widths: [] };

    /* A 20px-wide WebP, base64-inlined (~400 bytes). It renders instantly as a
       blurred stand-in so the slot shows the shot's actual colours rather than
       an empty grey box while the real file arrives. Small enough that
       inlining it costs less than the request it saves. */
    const lqipBuffer = await image
      .clone()
      .resize({ width: 20 })
      .webp({ quality: 45, effort: 6 })
      .toBuffer();
    entry.lqip = `data:image/webp;base64,${lqipBuffer.toString("base64")}`;

    for (const width of WIDTHS) {
      // Never upscale — a 900px-wide source has no business being emitted at
      // 1600 and paying for the extra pixels.
      if (meta.width && width > meta.width) continue;
      entry.widths.push(width);

      const resized = image.clone().resize({ width, withoutEnlargement: true });

      const avif = await resized.clone().avif({ quality: 55, effort: 6 }).toBuffer();
      const webp = await resized.clone().webp({ quality: 76, effort: 5 }).toBuffer();

      await writeFile(path.join(OUT_DIR, `${base}-${width}.avif`), avif);
      await writeFile(path.join(OUT_DIR, `${base}-${width}.webp`), webp);
      after += avif.length + webp.length;

      console.log(`  ${base}-${width}  avif ${kb(avif.length)}  webp ${kb(webp.length)}`);
    }

    // Nothing matched (source narrower than the smallest width): emit one
    // derivative at the source's own width so every image still gets AVIF.
    if (entry.widths.length === 0 && meta.width) {
      const avif = await image.clone().avif({ quality: 55, effort: 6 }).toBuffer();
      const webp = await image.clone().webp({ quality: 76, effort: 5 }).toBuffer();
      await writeFile(path.join(OUT_DIR, `${base}-${meta.width}.avif`), avif);
      await writeFile(path.join(OUT_DIR, `${base}-${meta.width}.webp`), webp);
      entry.widths.push(meta.width);
      after += avif.length + webp.length;
    }

    manifest[`/${SOURCE_DIR.replace("public/", "")}/${file}`] = entry;
  }

  await writeFile("src/data/imageManifest.json", `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(
    `\n${files.length} images · originals ${kb(before)} · derivatives ${kb(after)}` +
      `\nManifest written to src/data/imageManifest.json`
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
