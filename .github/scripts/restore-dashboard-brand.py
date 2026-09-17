from pathlib import Path

page_path = Path('app/dashboard/page.tsx')
text = page_path.read_text()

old_desktop = '''                <Link
                  href="/"
                  className="font-[family-name:var(--font-cinzel)] text-base font-bold tracking-[0.12em] text-primary"
                >
                  DC Organizer
                </Link>'''
new_desktop = '''                <Link href="/" className="group block min-w-0">
                  <div className="font-[family-name:var(--font-dc-heading)] text-2xl font-bold leading-none tracking-[0.12em] text-primary transition-transform group-hover:scale-[1.01]">
                    DC Organizer
                  </div>
                  <div className="mt-1 whitespace-nowrap font-[family-name:var(--font-dc-mono)] text-[8px] uppercase tracking-[0.22em] text-foreground/60">
                    Your best consultant for wedding & event
                  </div>
                </Link>'''

old_mobile = '''                  <Link
                    href="/"
                    className="shrink-0 font-[family-name:var(--font-cinzel)] text-sm font-bold tracking-[0.12em] text-primary lg:hidden"
                  >
                    DC Organizer
                  </Link>'''
new_mobile = '''                  <Link href="/" className="group min-w-0 shrink-0 lg:hidden">
                    <div className="font-[family-name:var(--font-dc-heading)] text-base font-bold leading-none tracking-[0.12em] text-primary">
                      DC Organizer
                    </div>
                    <div className="mt-0.5 hidden whitespace-nowrap font-[family-name:var(--font-dc-mono)] text-[6px] uppercase tracking-[0.16em] text-foreground/60 sm:block">
                      Your best consultant for wedding & event
                    </div>
                  </Link>'''

if old_desktop not in text:
    raise SystemExit('desktop dashboard brand snippet not found')
if old_mobile not in text:
    raise SystemExit('mobile dashboard brand snippet not found')

text = text.replace(old_desktop, new_desktop, 1)
text = text.replace(old_mobile, new_mobile, 1)
page_path.write_text(text)

changelog_path = Path('prd1.md')
changelog = changelog_path.read_text()
entry = '''

---

## 2026-09-17 — Dashboard Brand Lockup Restore

### Summary
Dashboard redesign sempat menyederhanakan brand lockup menjadi teks `DC Organizer` saja. Perubahan itu dikoreksi agar header dashboard kembali mengikuti canonical public navbar brand treatment tanpa mengubah layout/data-oriented dashboard yang baru.

### Implementation
- desktop dashboard header menggunakan kembali font token brand `--font-dc-heading`;
- tagline canonical `Your best consultant for wedding & event` dipulihkan;
- mobile header memakai brand treatment yang sama dalam skala responsif;
- tidak ada perubahan pada brand color, logo wording, public navbar, product flow, database, atau entitlement.

### Affected file
- `app/dashboard/page.tsx`

### Validation
Workflow **Restore Dashboard Brand** menjalankan dependency install, Prisma Client generation, dan Next.js production build + TypeScript sebelum commit final dibuat. Hasil workflow wajib PASS.
'''
if '## 2026-09-17 — Dashboard Brand Lockup Restore' not in changelog:
    changelog_path.write_text(changelog + entry)
