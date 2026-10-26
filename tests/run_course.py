"""Course-owned checks; shared infrastructure never modifies domain algorithms."""
from pathlib import Path
import shutil, subprocess
root=Path(__file__).resolve().parents[1]
node=shutil.which('node')
if not node: raise SystemExit('Node 24.21.0 is required; add its bin directory to PATH')
for directory in ['assets/js', 'scripts']:
 for path in (root/directory).rglob('*.js'):
  subprocess.run([node, '--check', str(path)], check=True)
unit=list((root/'tests').glob('*.test.js'))
if unit: subprocess.run([node, '--test', *map(str,unit)], cwd=root, check=True)
for name in ['sql_examples.py', 'check_site.py']:
 if (root/'tests'/name).is_file(): subprocess.run(['python3', 'tests/'+name], cwd=root, check=True)
if (root/'tests/browser-course.mjs').is_file(): subprocess.run(['python3', 'tests/browser_course.py'], cwd=root, check=True)
print('PASS: course syntax and available academic regressions')
