import assert from 'node:assert/strict';
import test from 'node:test';
import { readableInk, contrastRatio, invitationFontFamily } from '../lib/templates/presentation.ts';
import { invitationPalettes } from '../lib/templates/design.ts';

test('custom palette body text is readable on every background and surface', () => {
  for (const palette of Object.values(invitationPalettes)) {
    for (const background of [palette.bg, palette.surface]) {
      assert.ok(contrastRatio(background, readableInk(background, palette.ink)) >= 4.5, palette.name);
    }
  }
});
test('readable preferred colors are preserved and next/font families use their loaded tokens', () => {
  assert.equal(readableInk('#ffffff', '#111111'), '#111111');
  assert.equal(invitationFontFamily('Cinzel'), 'var(--font-dc-heading)');
  assert.equal(invitationFontFamily('Fauna One'), 'var(--font-dc-sans)');
  assert.equal(invitationFontFamily('Playfair Display'), 'Playfair Display');
});
