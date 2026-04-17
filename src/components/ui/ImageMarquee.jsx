import React from 'react';

/**
 * Dual-row image marquee (top row scrolls right→left, bottom row left→right).
 *
 * Place your images in `src/assets/marquee/` and import them here, or pass `imagesTop`/`imagesBottom`
 * as props (arrays of image URLs) to override the defaults.
 */
export function ImageMarquee({
  imagesTop,
  imagesBottom,
  speed = 30,
  tileSize = 256,
  className = '',
}) {
  const top = imagesTop && imagesTop.length ? imagesTop : DEFAULT_TOP;
  const bottom = imagesBottom && imagesBottom.length ? imagesBottom : DEFAULT_BOTTOM;

  return (
    <div
      className={`relative w-full h-full flex items-center justify-center overflow-hidden ${className}`}
    >
      <div className="flex flex-col gap-0 w-full">
        <MarqueeRow images={top} speed={speed} reverse tileSize={tileSize} />
        <MarqueeRow images={bottom} speed={speed} tileSize={tileSize} />
      </div>

      {/* Vignette edges — pure black to fully blend with page background (no seam) */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 w-40 z-10"
        style={{ background: 'linear-gradient(to right, #000 0%, rgba(0,0,0,0.85) 40%, transparent 100%)' }}
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-40 z-10"
        style={{ background: 'linear-gradient(to left, #000 0%, rgba(0,0,0,0.85) 40%, transparent 100%)' }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-24 z-10"
        style={{ background: 'linear-gradient(to bottom, #000 0%, rgba(0,0,0,0.7) 40%, transparent 100%)' }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-24 z-10"
        style={{ background: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.7) 40%, transparent 100%)' }}
      />

      <style>{`
        @keyframes marquee-scroll {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee-scroll var(--marquee-duration, 30s) linear infinite;
        }
        .marquee-track.reverse {
          animation-direction: reverse;
        }
        .marquee-row:hover .marquee-track {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}

function MarqueeRow({ images, speed, reverse = false, tileSize }) {
  const duplicated = [...images, ...images];
  return (
    <div className="marquee-row overflow-hidden">
      <div
        className={`marquee-track ${reverse ? 'reverse' : ''}`}
        style={{ '--marquee-duration': `${speed}s` }}
      >
        {duplicated.map((src, idx) => (
          <div
            key={idx}
            className="relative flex-shrink-0 overflow-hidden"
            style={{ width: tileSize, height: tileSize }}
          >
            <img
              src={src}
              alt=""
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

// Fallbacks — replace these by dropping images into src/assets/marquee/ and
// importing them at the top of login.jsx, then passing them as props.
const DEFAULT_TOP = [
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=700&h=700&fit=crop',
  'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=700&h=700&fit=crop',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&h=700&fit=crop',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=700&h=700&fit=crop',
];

const DEFAULT_BOTTOM = [
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=700&h=700&fit=crop',
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=700&h=700&fit=crop',
  'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=700&h=700&fit=crop',
  'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=700&h=700&fit=crop',
];

export default ImageMarquee;
