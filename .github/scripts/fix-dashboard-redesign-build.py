from pathlib import Path

page_path = Path('app/dashboard/page.tsx')
changelog_path = Path('prd1.md')

page = page_path.read_text()
marker = '\nfunction EventActivationNotice({ event }: { event: DashboardEvent }) {'
if marker not in page:
    raise SystemExit('EventActivationNotice marker not found')

stat = '''\nfunction Stat({ label, value }: { label: string; value: string }) {\n  return (\n    <div className="min-w-0 rounded-xl border border-border/70 bg-background p-4">\n      <p className="font-[family-name:var(--font-dm-mono)] text-[8px] uppercase tracking-[0.12em] text-muted-foreground">\n        {label}\n      </p>\n      <p className="mt-1.5 truncate text-lg font-semibold text-foreground">{value}</p>\n    </div>\n  );\n}\n'''

if 'function Stat({ label, value }' not in page:
    page = page.replace(marker, stat + marker, 1)
    page_path.write_text(page)

changelog = changelog_path.read_text()
old = '- GitHub Build Validation: pending setelah source commit.'
new = '- Build Validation #946: **FAILED** pada TypeScript karena helper `Stat` ikut terhapus saat overview diganti; compile aplikasi sudah lolos sebelum type-check. Helper dipulihkan dan validation ulang diperlukan.'
if old in changelog:
    changelog_path.write_text(changelog.replace(old, new, 1))
