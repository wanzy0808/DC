/** A small public derivative for catalog cards. No private master asset is read or exposed. */
const preview = '<svg xmlns="http://www.w3.org/2000/svg" width="420" height="620" viewBox="0 0 420 620" role="img" aria-label="Zen Atelier illustration"><rect width="420" height="620" fill="#f4f0e6"/><rect x="17" y="17" width="386" height="586" fill="none" stroke="#b9ac97"/><circle cx="209" cy="253" r="94" fill="#a9513b"/><path d="M0 355L64 304 108 325 164 239 225 325 282 266 348 340 420 294V425H0Z" fill="#98a79a" opacity=".58"/><path d="M0 384 66 346 120 371 187 324 247 370 303 335 364 380 420 355V430H0Z" fill="#566a5c" opacity=".8"/><path d="M0 20C50 60 86 79 130 102c34 18 65 27 114 37M101 85C120 38 149 24 187 15M145 111C159 78 173 68 199 59" fill="none" stroke="#554a40" stroke-width="3"/><g fill="#d6a69c"><circle cx="185" cy="22" r="11"/><circle cx="201" cy="57" r="9"/><circle cx="240" cy="137" r="10"/><circle cx="129" cy="99" r="9"/></g><g text-anchor="middle" fill="#383f37"><text x="210" y="482" font-size="35" font-family="Georgia,serif">Zen Atelier</text><text x="210" y="512" font-size="10" letter-spacing="3" font-family="sans-serif">DC ORGANIZER</text></g></svg>';

export function GET() {
  return new Response(preview, {
    headers: {
      "Content-Type": "image/svg+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; img-src 'none'; style-src 'none'; sandbox",
    },
  });
}
