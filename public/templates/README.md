# Invitation template assets

Every invitation template has one canonical folder under `public/templates/<template-key>/`.

```text
public/templates/
  eternal-blossom/
    README.md
    preview.webp
    hero.webp
    music.mp3
  another-template/
    README.md
    preview.webp
```

Register each template in `lib/templates/catalog.ts`. The app uses one shared invitation renderer, so adding a template does not require duplicating dashboard or route files.

## Rules

- Keep template-specific artwork and its template README together in `public/templates/<template-key>/`.
- Use lowercase kebab-case template keys and folder names; do not use spaces.
- Browser-served raster artwork must use WebP. Do not add PNG/JPG/JPEG under `public/`.
- Global brand, landing, marketing, demo, payment and audio assets belong under `public/assets/`.
- Do not recreate a second root-level `assets/templates/` directory.
