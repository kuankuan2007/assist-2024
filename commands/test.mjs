import esbuild from 'esbuild';
esbuild.buildSync({
  entryPoints: ['test/index.ts'],
  outfile: 'test/index.js',
  bundle: true,
  platform: 'node',
  target: 'node21',
  sourcemap: true
});
import('../test/index.js');
