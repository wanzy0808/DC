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