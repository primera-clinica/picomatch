'use strict';

const assert = require('assert');
const { execFileSync } = require('child_process');
const picomatch = require('..');

describe('repeated-star extglob security', () => {
  it('finishes non-matching inputs without blocking the event loop', () => {
    execFileSync(process.execPath, ['-e', `
      const assert = require('assert');
      const picomatch = require(${JSON.stringify(require.resolve('..'))});
      for (const [pattern, prefix] of [['+(*a)', ''], ['*(*a)', ''], ['+(*a)c', ''], ['x+(*a)', 'x']]) {
        for (const options of [{}, { capture: true }]) {
          assert.strictEqual(picomatch.isMatch(prefix + 'a'.repeat(50) + 'b', pattern, options), false);
        }
      }
    `], { timeout: 2000 });
  });

  it('preserves plain repeated-star matching', () => {
    const patterns = ['+(*)', '+(*a)', '*(*a)', '+(a*)', '+(a*b)', '*(*.js)', 'x+(*a)y', '+(*)c'];
    const inputs = ['', 'a', 'aa', 'ab', 'a.a', '.a', 'a/b', 'abc', 'axbayb', 'foo.js', 'foo.ts', 'xaay'];
    for (const options of [{}, { dot: true }, { windows: true }, { bash: true }]) {
      for (const pattern of patterns) {
        for (const input of inputs) {
          assert.deepStrictEqual(
            picomatch.makeRe(pattern, options).exec(input),
            picomatch.makeRe(pattern, { ...options, maxExtglobRecursion: false }).exec(input),
            JSON.stringify({ pattern, input, options })
          );
        }
      }
    }
  });

  it('uses literal fallback when repeated captures cannot be preserved', () => {
    const pattern = '+(*a)';
    assert.deepStrictEqual(Array.from(picomatch.makeRe(pattern, { capture: true }).exec(pattern) || []), [pattern]);
    assert.strictEqual(picomatch.isMatch('aaa', pattern, { capture: true }), false);
    assert.strictEqual(picomatch.isMatch('abab', '+(ab)', { capture: true }), true);
  });

  it('leaves excluded glob syntax unchanged', () => {
    for (const pattern of ['+("*a")', '+(\\\\*a)', '+(*a/b)', '+(*[ab])', '+(a?*)', '+(**a)', '+(*a|b)']) {
      assert.strictEqual(
        picomatch.makeRe(pattern).source,
        picomatch.makeRe(pattern, { maxExtglobRecursion: false }).source,
        pattern
      );
    }
  });
});
