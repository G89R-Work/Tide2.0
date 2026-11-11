// Läuft im Hintergrund nach jeder Antwort von Claude. Sichert still den Zwischenstand
// und lädt ihn hoch. So geht nichts verloren, wenn ein Limit mitten in der Arbeit greift.
// Kostet keine Tokens und gibt nie etwas aus.
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const dir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
const run = c => execSync(c, { cwd: dir, stdio: ['ignore', 'pipe', 'pipe'] }).toString().trim();

try {
  run('git rev-parse --is-inside-work-tree');
  run('git remote get-url origin');
  const git = join(dir, '.git');
  if (['MERGE_HEAD', 'REBASE_HEAD', 'rebase-merge', 'rebase-apply'].some(f => existsSync(join(git, f)))) process.exit(0);
  if (run('git status --porcelain') === '') process.exit(0);
  run('git add -A');
  run(`git commit --quiet -m "Zwischenstand ${new Date().toISOString().slice(0, 16).replace('T', ' ')}"`);
  run('git push --quiet -u origin HEAD');
} catch {
  // Bewusst still. /abschluss prüft später, ob alles oben ist.
}
process.exit(0);
