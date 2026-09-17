from pathlib import Path

path = Path('prd1.md')
text = path.read_text()
old = 'Validation status: pending build setelah implementation commit.'
new = 'Validation: Build Validation #954 pada dashboard analytics state **PASS** — dependency install, Prisma Client generation, Next.js production compile, dan TypeScript berhasil.'
if old not in text:
    raise SystemExit('Expected analytics validation note not found')
path.write_text(text.replace(old, new, 1))
