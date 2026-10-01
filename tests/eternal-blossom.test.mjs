import assert from "node:assert/strict";
import test from "node:test";
import { readFile, stat } from "node:fs/promises";
import sharp from "sharp";
import { getInvitationTemplate } from "../lib/templates/catalog.ts";
import { parseDesignKey } from "../lib/templates/design.ts";
import { defaultPhotoAssignments, parsePhotoAssignments, withPhotoAssignments } from "../lib/templates/photo-slots.ts";
import { defaultNativeVisualTransform, parseNativeVisualTransforms, withNativeVisualTransforms, nativeVisualCanHide, nativeVisualUsesSystemContent } from "../lib/templates/native-visual-transforms.ts";
import { templateHasDefaultMotion, templateHasDefaultPhotoMotion, templatePhotoMotion, templateNativeMotionForKey } from "../lib/templates/template-motion.ts";

test("Eternal Blossom stays photo-capable and saved explicit palette/font choices remain intact", () => {
  const template = getInvitationTemplate("eternal-blossom");
  assert.deepEqual(template.photoSlots, ["cover", "personOne", "personTwo", "gallery"]);
  assert.equal(template.usesPhotos, true);
  assert.equal(template.preset.palette, "blossom");
  assert.equal(template.preset.font, "playfairLora");
  assert.equal(parseDesignKey("eternal-blossom::blush::cinzelFauna").palette, "blush");
  assert.equal(parseDesignKey("eternal-blossom::blush::cinzelFauna").font, "cinzelFauna");
});

test("Blossom native/photo OFF and authored section timelines override defaults through a saved design", () => {
  assert.equal(templateHasDefaultMotion("eternal-blossom"), true);
  assert.equal(templateHasDefaultPhotoMotion("eternal-blossom"), true);
  assert.equal(templateHasDefaultPhotoMotion("botanical-ivory"), false);
  const photoDefaults = templatePhotoMotion("eternal-blossom");
  assert.equal(photoDefaults.personOne.animation, "glide-left");
  assert.equal(photoDefaults.personTwo.animation, "glide-right");
  assert.equal(photoDefaults.gallery.animation, "tilt-in");
  const stored = withPhotoAssignments("eternal-blossom::blossom::playfairLora", { ...defaultPhotoAssignments(), motion: { cover: { animation: "none" }, gallery: { animation: "fade" } } });
  const resolved = templatePhotoMotion("eternal-blossom", parsePhotoAssignments(stored).motion);
  assert.equal(resolved.cover.animation, "none");
  assert.equal(resolved.gallery.animation, "fade");
  for (const style of [{ animation: "none" }, { timeline: "editorial-sequence" }, { animation: "fade" }]) {
    assert.equal(templatePhotoMotion("eternal-blossom", {}, { gallery: style }).gallery.animation, undefined);
    assert.equal(templateNativeMotionForKey("eternal-blossom", "object:cover:flower-left:cover-copy", { cover: style }), undefined);
  }
  const nativeKey = "object:cover:flower-left:cover-copy";
  const nativeStored = withNativeVisualTransforms(stored, { [nativeKey]: { ...defaultNativeVisualTransform, animation: "none" } });
  assert.equal(parseNativeVisualTransforms(nativeStored)[nativeKey].animation, "none");
  assert.equal(templateNativeMotionForKey("eternal-blossom", nativeKey).animation, "glide-left");
  assert.equal(nativeVisualCanHide("object:cover:flower-right"), true);
  assert.equal(nativeVisualUsesSystemContent("object:envelope:address"), true);
});

test("Blossom WebP specimens retain their original ratio, alpha corners and a small byte budget", async () => {
  for (const [name, width, height] of [["branch", 768, 1152], ["sprig", 640, 640]]) {
    const path = new URL(`../public/templates/eternal-blossom/blossom-${name}.webp`, import.meta.url);
    const image = sharp(await readFile(path));
    const metadata = await image.metadata();
    assert.equal(metadata.format, "webp");
    assert.equal(metadata.width, width);
    assert.equal(metadata.height, height);
    assert.equal(metadata.hasAlpha, true);
    assert.ok((await stat(path)).size < 200000);
    const { data, info } = await image.ensureAlpha().raw().toBuffer({ resolveWithObject: true });
    for (const [x, y] of [[0, 0], [width - 1, 0], [0, height - 1], [width - 1, height - 1]]) assert.equal(data[(y * info.width + x) * 4 + 3], 0);
  }
});
