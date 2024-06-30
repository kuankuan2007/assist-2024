import esbuild from 'esbuild';
import childProcess from 'child_process';
import fs from 'fs';
fs.rmSync('dist', { recursive: true });
fs.rmSync('types', { recursive: true });
childProcess.execSync('tsc');
esbuild.buildSync({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  sourcemap: true,
});
