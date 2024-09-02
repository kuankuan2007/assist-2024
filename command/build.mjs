import esbuild from 'esbuild';
import childProcess from 'child_process';
import fs from 'fs';
if (fs.existsSync('dist')) fs.rmSync('dist', { recursive: true });
if (fs.existsSync('types')) fs.rmSync('types', { recursive: true });

fs.mkdirSync('dist');

childProcess.execSync('tsc');

esbuild.buildSync({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.js',
  bundle: true,
  sourcemap: true,
  format: 'esm',
});
