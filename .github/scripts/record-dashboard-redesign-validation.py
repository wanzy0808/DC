from pathlib import Path

path = Path('prd1.md')
text = path.read_text()
old = '- Build Validation #946: **FAILED** pada TypeScript karena helper `Stat` ikut terhapus saat overview diganti; compile aplikasi sudah lolos sebelum type-check. Helper dipulihkan dan validation ulang diperlukan.'
new = '''- Build Validation #946: **FAILED** pada TypeScript karena helper `Stat` ikut terhapus saat overview diganti; compile aplikasi sudah lolos sebelum type-check.\n- Commit `a88f1b474f3cf6e384d4cf315e1cceea00f4522b` memulihkan helper `Stat`.\n- Build Validation #949 pada state source setelah fix: **PASS**. Dependency install, Prisma Client generation, Next.js production compile, dan TypeScript semuanya berhasil.'''
if old not in text:
    raise SystemExit('Expected validation note not found')
path.write_text(text.replace(old, new, 1))
