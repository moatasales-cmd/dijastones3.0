"use client";

import { useEffect, useState } from "react";

/**
 * Material image gallery: large image + thumbnails + fullscreen lightbox
 * with prev/next. Mirrors the old detail-images markup and lightbox.
 */
export default function Gallery({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const count = images.length;

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") setLightbox((i) => ((i ?? 0) + 1) % count);
      if (e.key === "ArrowLeft")
        setLightbox((i) => ((i ?? 0) - 1 + count) % count);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, count]);

  if (count === 0) {
    return (
      <div className="detail-images">
        <div
          className="detail-main-img"
          style={{
            background:
              "linear-gradient(135deg, var(--bg-mist), var(--bg-alt))",
          }}
        />
      </div>
    );
  }

  const nav = (dir: number) =>
    setLightbox((i) => ((i ?? 0) + dir + count) % count);

  return (
    <div className="detail-images">
      <div className="detail-main-img">
        <img
          src={images[active]}
          id="mainImg"
          alt={alt}
          onClick={() => setLightbox(active)}
          style={{ cursor: "pointer" }}
        />
      </div>
      <div className="detail-thumbs">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className={i === active ? "active" : ""}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setActive(i)}
            onClick={() => setLightbox(i)}
          />
        ))}
      </div>

      <div
        className={`lightbox${lightbox !== null ? " open" : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setLightbox(null);
        }}
      >
        <button
          className="lightbox-close"
          onClick={() => setLightbox(null)}
          aria-label="Close"
        >
          &times;
        </button>
        {count > 1 && (
          <button
            className="lightbox-prev"
            onClick={() => nav(-1)}
            aria-label="Previous"
          >
            &#8249;
          </button>
        )}
        {lightbox !== null && (
          <img className="lightbox-img" src={images[lightbox]} alt={alt} />
        )}
        {count > 1 && (
          <button
            className="lightbox-next"
            onClick={() => nav(1)}
            aria-label="Next"
          >
            &#8250;
          </button>
        )}
        {count > 1 && (
          <div className="lightbox-counter">
            {(lightbox ?? 0) + 1} / {count}
          </div>
        )}
      </div>
    </div>
  );
}
