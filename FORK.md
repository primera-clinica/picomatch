# Temporary repeated-star ReDoS patch

This branch retains picomatch 4.0.7 and patches the simple single-branch repeated-star forms in CVE-2026-112366. The collapse and capture fallback are adapted from [upstream PR 246](https://github.com/micromatch/picomatch/pull/246/commits/f03bec2c02e46f063fbfdc161aae1d0f854b2565). It does not make arbitrary untrusted glob or regular-expression patterns safe.

Run `npm run mocha` for the upstream suite and the deadline-bounded security regressions in `test/repeated-star-security.js`. Capture mode deliberately uses the existing literal fallback for the affected patterns; the explicit `maxExtglobRecursion: false` opt-out retains upstream behavior.

Replace this temporary dependency with an official upstream release once that release passes these regressions. Keep downstream dependencies pinned to a full tested commit until then; do not add unrelated features to this fork.
