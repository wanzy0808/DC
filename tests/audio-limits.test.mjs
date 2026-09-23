import test from 'node:test';
import assert from 'node:assert/strict';
import { audioUploadError, MAX_AUDIO_BYTES } from '../lib/invitations/audio-limits.ts';

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
