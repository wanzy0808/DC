import assert from 'node:assert/strict';
import test from 'node:test';
import { invitationSectionItems, parseInvitationSections, withInvitationSections } from '../lib/templates/sections.ts';

test('legacy three-section designs keep all new controls enabled', () => {
  const value = parseInvitationSections('rose::blush::cinzelFauna::sections=rsvp,gift');
  assert.equal(value.wishes, false);
  assert.equal(value.rsvp, true);
  assert.equal(value.gift, true);
  for (const { key } of invitationSectionItems.filter(({ key }) => !['rsvp','wishes','gift'].includes(key))) assert.equal(value[key], true, key);
});
test('all fifteen controls round-trip independently, without changing photo assignments', () => {
  assert.equal(invitationSectionItems.length, 15);
  for (const { key } of invitationSectionItems) {
    const original = parseInvitationSections('rose');
    original[key] = false;
    const serialized = withInvitationSections('rose::blush::cinzelFauna::photos=keep', original);
    assert.ok(serialized.includes('::photos=keep'));
    assert.deepEqual(parseInvitationSections(serialized), original, key);
    original[key] = true;
    assert.equal(parseInvitationSections(withInvitationSections(serialized, original))[key], true);
  }
});
test('all-off designs remain off after save and legacy empty list is preserved', () => {
  const state = Object.fromEntries(invitationSectionItems.map(({key}) => [key, false]));
  assert.deepEqual(parseInvitationSections(withInvitationSections('rose', state)), state);
  assert.equal(parseInvitationSections('rose::sections=').rsvp, false);
  assert.equal(parseInvitationSections('rose::sections=').cover, true);
});
