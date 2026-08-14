import manifest from "../../data/imageManifest.json";

/**
 * A project image that ships the right bytes for the screen looking at it.
 *
 * Before this, every visitor got the full-size JPEG/PNG regardless of device:
 * a phone downloaded the same ~200 kB desktop file as a 27" display, with no
 * modern format and no intrinsic size (so the layout jumped when it landed).
 *
 * `npm run images` generates AVIF + WebP at 640/1024/1600 and records each
 * source's real dimensions in imageManifest.json. This renders:
 *
 *   <picture>
 *     <source type="image/avif" srcset="…-640.avif 640w, …" sizes=…>
 *     <source type="image/webp" srcset="…">
 *     <img src="original" width height loading decoding>
 *
 * Browsers pick the smallest acceptable candidate; anything that understands
 * neither format still gets the original. `width`/`height` come from the
 * manifest so the box is reserved before a byte arrives — no layout shift.
 */
export default function ResponsiveImage({
  src,
  alt,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 50vw",
  loading = "lazy",
  fetchPriority,
  style,
  /** Opt out for an image that should not open in the viewer. */
  zoomable = true,
  ...rest
}) {
  const entry = manifest[src];

  /* Openable images announce themselves to `Lightbox`, which is wired by
     delegation. The attributes live on the <img> rather than a wrapping
     <button> on purpose: several of these images are absolutely positioned
     inside their own layout, and introducing an element between them and
     their parent would move them. role + tabIndex make it operable and
     announced without changing a single box. */
  const zoom = zoomable
    ? {
        "data-zoomable": "",
        role: "button",
        tabIndex: 0,
        "aria-haspopup": "dialog",
        // The custom cursor is the affordance on desktop: `cursor: zoom-in`
        // is deliberately overridden site-wide by `cursor: none`, so a CSS
        // cursor alone would leave these images looking inert. This makes the
        // ring inflate and spell out what the click does. `cursor: zoom-in`
        // stays for the fallback path where no custom cursor is drawn.
        "data-cursor": "hover",
        "data-cursor-text": "Open",
        style: { cursor: "zoom-in", ...style },
      }
    : { style };

  // No derivatives (a new image added without re-running the script) — still
  // render something correct rather than nothing.
  if (!entry) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        {...zoom}
        {...rest}
      />
    );
  }

  const base = src.replace(/\.[^.]+$/, "").replace("/projects/", "/projects/responsive/");
  const srcSet = (ext) => entry.widths.map((w) => `${base}-${w}.${ext} ${w}w`).join(", ");

  return (
    <picture>
      <source type="image/avif" srcSet={srcSet("avif")} sizes={sizes} />
      <source type="image/webp" srcSet={srcSet("webp")} sizes={sizes} />
      <img
        src={src}
        alt={alt}
        width={entry.width}
        height={entry.height}
        className={className}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        {...zoom}
        {...rest}
      />
    </picture>
  );
}
