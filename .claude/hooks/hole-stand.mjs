// Läuft beim Start jeder Sitzung. Holt still den neuesten Stand aus GitHub.
// Kostet keine Tokens: Es gibt nur dann eine Zeile aus, wenn etwas nicht klappt.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const run = c => execSync(c, { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();

try {
  run('git rev-parse --is-inside-work-tree');
  run('git remote get-url origin');
} catch {
  process.exit(0); // Noch kein Repository oder kein GitHub verbunden: nichts zu tun.
}

try {
  if (existsSync(join(dir, '.git', 'MERGE_HEAD'))) throw new Error('Zusammenführung offen');
  run('git fetch --quiet origin');
  const zweig = run('git rev-parse --abbrev-ref HEAD');
  if (zweig === 'main') run('git merge --ff-only --quiet origin/main');
  else run('git merge --quiet --no-edit origin/main');
} catch {
  console.log('Hinweis: Der neueste Stand aus GitHub ließ sich nicht automatisch holen. Prüfe zuerst mit git status, ob ungesicherte Änderungen oder ein Konflikt vorliegen, und löse das, bevor du baust.');
}
process.exit(0);
