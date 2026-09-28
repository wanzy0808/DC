# Invitation template assets

Designer assets can be grouped by template key:

```text
public/templates/
  eternal-blossom/
    preview.jpg
    hero.jpg
    music.mp3
  another-template/
    preview.jpg
```

Register each template in `lib/templates/catalog.ts`. The app uses one shared invitation renderer, so adding a template does not require duplicating dashboard or route files.

## Shared vs template-owned assets

Keep files here only when they belong to one invitation template. Global brand, landing, marketing, demo, payment and audio assets belong under `public/assets/` instead. Do not add new loose files to the `public/` root.
