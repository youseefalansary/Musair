import { cpSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const desktopShell = path.join(root, 'desktop-shell');
const outputDir = path.join(root, 'release', 'windows');
const packageJson = JSON.parse(readFileSync(path.join(root, 'package.json'), 'utf8'));
const electronVersion = JSON.parse(
  readFileSync(path.join(root, 'node_modules', 'electron', 'package.json'), 'utf8'),
).version;
const appFolder = 'Musair-win32-x64';
const archivePath = path.join(root, 'release', 'Musair-v1.0.0-Windows-x64.zip');

if (packageJson.version !== '1.0.0') {
  throw new Error(`Expected project version 1.0.0, found ${packageJson.version}`);
}
if (!existsSync(path.join(root, 'dist', 'index.html'))) {
  throw new Error('Web build missing. Run the build script before packaging Windows.');
}

rmSync(path.join(desktopShell, 'dist'), { recursive: true, force: true });
cpSync(path.join(root, 'dist'), path.join(desktopShell, 'dist'), { recursive: true });
rmSync(outputDir, { recursive: true, force: true });
mkdirSync(outputDir, { recursive: true });

const pack = spawnSync(
  'pnpm',
  [
    'exec',
    'electron-packager',
    desktopShell,
    'Musair',
    '--platform=win32',
    '--arch=x64',
    `--electron-version=${electronVersion}`,
    `--out=${outputDir}`,
    '--overwrite',
    '--asar',
  ],
  { cwd: root, stdio: 'inherit' },
);
if (pack.error) throw pack.error;
if (pack.status !== 0) throw new Error(`Electron packaging failed with status ${pack.status}`);

const appDirectory = path.join(outputDir, appFolder);
const executable = path.join(appDirectory, 'Musair.exe');
if (!existsSync(executable)) throw new Error(`Windows executable not found: ${executable}`);

rmSync(archivePath, { force: true });
const zip = spawnSync('zip', ['-qr', archivePath, appFolder], {
  cwd: outputDir,
  stdio: 'inherit',
});
if (zip.error) throw zip.error;
if (zip.status !== 0) throw new Error(`Windows archive creation failed with status ${zip.status}`);

console.log(`Windows executable: ${executable}`);
console.log(`Windows app archive: ${archivePath}`);
