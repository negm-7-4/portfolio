import { useEffect, useRef, useState } from "react";

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
  ...rest
}) {
  const entry = manifest[src];
  const imgRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  /* A cached image can finish decoding before React attaches onLoad. This only
     tidies the placeholder away — it is never what makes the photo visible
     (see the style comment below) — but without it the stand-in would linger
     behind an already-painted image. */
  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0) setLoaded(true);
  }, []);

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
        style={style}
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
        ref={imgRef}
        src={src}
        alt={alt}
        width={entry.width}
        height={entry.height}
        className={className}
        loading={loading}
        decoding="async"
        fetchPriority={fetchPriority}
        onLoad={() => setLoaded(true)}
        /* Two decisions here, both about failure modes.
        
           The stand-in is the <img>'s OWN background, not an extra element:
           <picture> only permits <source> and <img> children, so a wrapper
           would be invalid markup that browsers relocate out of the picture.
           A 20px WebP scaled to fill is blurred by the browser's own smoothing.

           And the image is NEVER hidden waiting for JS. An earlier version
           faded it in on `onLoad`, which meant any missed load event — a
           lazy image the browser defers, a decode that beats hydration —
           left the photo permanently at opacity 0 with only a blurry 20px
           square visible. Now the real pixels simply paint over the
           background when they arrive; `loaded` only *removes* the fallback
           afterwards. JS tidies up, it never reveals. */
        style={{
          ...style,
          ...(entry.lqip && !loaded
            ? {
                backgroundImage: `url("${entry.lqip}")`,
                backgroundSize: "cover",
                backgroundPosition: "top center",
              }
            : null),
        }}
        {...rest}
      />
    </picture>
  );
}
