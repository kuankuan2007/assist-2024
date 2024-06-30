
await import('./build.mjs');
import esbuild from 'esbuild';
esbuild.buildSync({
  entryPoints: ['test/index.ts'],
  outdir:'test/dist',
  bundle: true,
  sourcemap: true,
  platform: 'node'
});

import('../test/dist/index.js');
