'use client'

/**
 * Chars — splits text into animatable character spans.
 * The parent element must carry the accessible label; the split
 * characters themselves are hidden from assistive tech.
 */
export function Chars({ text }: { text: string }) {
  return (
    <span className="split-chars" aria-hidden="true">
      {Array.from(text).map((c, i) =>
        c === ' ' ? (
          <span key={i} className="char char-space">
            {' '}
          </span>
        ) : (
          <span key={i} className="char">
            {c}
          </span>
        )
      )}
    </span>
  )
}
