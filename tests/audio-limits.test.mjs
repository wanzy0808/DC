import test from 'node:test';
import assert from 'node:assert/strict';
import { audioUploadError, hasAudioSignature, MAX_AUDIO_BYTES } from '../lib/invitations/audio-limits.ts';

test('audio accepts exactly 3 MB but rejects one byte over the limit', () => {
  assert.equal(audioUploadError({ type: 'audio/mpeg', size: MAX_AUDIO_BYTES }, 0), null);
  assert.match(audioUploadError({ type: 'audio/mpeg', size: MAX_AUDIO_BYTES + 1 }, 0), /3 MB/);
});
test('second upload is allowed; third is rejected; deletion frees a slot', () => {
  const file = { type: 'audio/mpeg', size: 1024 };
  assert.equal(audioUploadError(file, 1), null);
  assert.match(audioUploadError(file, 2), /Maksimal 2/);
  assert.equal(audioUploadError(file, 2 - 1), null);
});
test('empty and unsupported uploads are rejected', () => {
  assert.ok(audioUploadError({ type: 'audio/mpeg', size: 0 }, 0));
  assert.ok(audioUploadError({ type: 'text/html', size: 100 }, 0));
});

test('audio signature checks accept supported headers and reject mislabeled content', () => {
  const bytes = (...values) => Uint8Array.from(values);
  const header = (text) => new TextEncoder().encode(text);
  assert.equal(hasAudioSignature(header('ID3\\x04\\x00\\x00\\x00\\x00\\x00\\x00'), 'audio/mpeg'), true);
  assert.equal(hasAudioSignature(bytes(0xff, 0xfb, 0x90, 0x64, 0, 0, 0, 0, 0, 0, 0, 0), 'audio/mpeg'), true);
  assert.equal(hasAudioSignature(header('RIFF____WAVE'), 'audio/wav'), true);
  assert.equal(hasAudioSignature(header('OggS________'), 'audio/ogg'), true);
  assert.equal(hasAudioSignature(bytes(0xff, 0xf1, 0x50, 0x80, 0, 0, 0, 0, 0, 0, 0, 0), 'audio/aac'), true);
  assert.equal(hasAudioSignature(header('____ftypM4A ____'), 'audio/x-m4a'), true);
  assert.equal(hasAudioSignature(header('<html>not an audio file</html>'), 'audio/mpeg'), false);
  assert.equal(hasAudioSignature(header('RIFF____WAVE'), 'audio/mpeg'), false);
  assert.equal(hasAudioSignature(bytes(0xff, 0xfb), 'audio/mpeg'), false);
});
