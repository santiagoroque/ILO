// Tests for lite mode (js/quality.js): slow computers get fewer animations.
// Run with: npm test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { chooseQuality, loopsOn } from '../js/quality.js';

test('fast frames stay full; slow frames switch to lite', () => {
  assert.equal(chooseQuality(Array(60).fill(16)), 'full');
  assert.equal(chooseQuality(Array(60).fill(55)), 'lite');
  assert.equal(chooseQuality(Array(10).fill(55)), 'full'); // Too few samples
});

test('the URL flag wins', () => {
  assert.equal(chooseQuality(Array(60).fill(55), { forced: 'full' }), 'full');
  assert.equal(chooseQuality([], { forced: 'lite' }), 'lite');
});

test('reduced motion keeps loops off even in full mode', () => {
  assert.equal(loopsOn('full', true), false);
  assert.equal(loopsOn('lite', false), false);
  assert.equal(loopsOn('full', false), true);
});
