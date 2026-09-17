from pathlib import Path
import re


def replace_in(path: Path, old: str, new: str, *, required: bool = True) -> int:
    text = path.read_text(encoding="utf-8")
    count = text.count(old)
    if required and count == 0:
        raise SystemExit(f"Expected pattern not found in {path}: {old!r}")
    if count:
        path.write_text(text.replace(old, new), encoding="utf-8")
        print(f"updated {path}: {count} replacement(s)")
    return count


# Canonical legacy page wrapper: remove the fixed 1400px ceiling everywhere in application/page chrome.
for root in (Path("app"), Path("components")):
    for path in root.rglob("*.tsx"):
        text = path.read_text(encoding="utf-8")
        old = "w-[min(92vw,1400px)]"
        if old in text:
            path.write_text(text.replace(old, "w-[80vw] max-w-full"), encoding="utf-8")
            print(f"widened legacy 1400px wrapper: {path}")

# Remaining page/workspace roots that use a different legacy max-width form.
replace_in(
    Path("app/dashboard/usher/page.tsx"),
    "w-[min(calc(100%-3rem),1400px)]",
    "w-[80vw] max-w-full",
)
replace_in(
    Path("app/transactions/page.tsx"),
    '<div className="mx-auto max-w-4xl">',
    '<div className="mx-auto w-[80vw] max-w-full">',
)
replace_in(
    Path("components/Payments/CheckoutClient.tsx"),
    '<div className="mx-auto max-w-4xl">',
    '<div className="mx-auto w-[80vw] max-w-full">',
)
replace_in(
    Path("app/admin/page.tsx"),
    '<main className="mx-auto max-w-7xl space-y-8 px-5 py-8 font-[family-name:var(--font-fauna)]">',
    '<main className="mx-auto w-[80vw] max-w-full space-y-8 px-5 py-8 font-[family-name:var(--font-fauna)]">',
)
replace_in(
    Path("components/Owner/OwnerDashboard.tsx"),
    '<main className="mx-auto max-w-7xl space-y-8 px-5 py-8 font-[family-name:var(--font-fauna)]">',
    '<main className="mx-auto w-[80vw] max-w-full space-y-8 px-5 py-8 font-[family-name:var(--font-fauna)]">',
)
replace_in(
    Path("components/Designer/DesignerDashboard.tsx"),
    '<main className="mx-auto max-w-7xl space-y-8 px-5 py-8 font-[family-name:var(--font-fauna)]">',
    '<main className="mx-auto w-[80vw] max-w-full space-y-8 px-5 py-8 font-[family-name:var(--font-fauna)]">',
)
replace_in(
    Path("components/Admin/AdminOperations.tsx"),
    '<section className="mx-auto max-w-6xl space-y-6 px-6 pb-10">',
    '<section className="mx-auto w-full space-y-6 px-6 pb-10">',
)
replace_in(
    Path("components/UsherApp/UsherApp.tsx"),
    '<div className="mx-auto max-w-6xl">',
    '<div className="mx-auto w-full">',
)
replace_in(
    Path("components/InvitationStudio/GuestManagement.tsx"),
    '<div className="mx-auto w-full max-w-7xl space-y-6 p-5 sm:p-8">',
    '<div className="mx-auto w-full space-y-6 p-5 sm:p-8">',
)

# Make the supplemental note explicitly include this broader second pass.
supplement = Path("prd-tambahan.md")
text = supplement.read_text(encoding="utf-8")
marker = "- Event scope fallback labels."
addition = '''- Event scope fallback labels.\n- Public/application page-level containers: homepage, Event Planner, Digital Invitation, Guestbook, Packages, Transactions, Checkout, Navbar, and Invitation Studio header.\n- Backoffice page-level workspaces: Admin, Owner, and Designer; inner modal/text readability constraints remain intentionally compact.'''
if marker not in text:
    raise SystemExit("prd-tambahan implementation scope marker not found")
supplement.write_text(text.replace(marker, addition), encoding="utf-8")
print("updated prd-tambahan.md follow-up scope")

# Ensure the specific fixed 1400px legacy page wrapper is gone from app/components.
legacy = []
for root in (Path("app"), Path("components")):
    for path in root.rglob("*.tsx"):
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if "w-[min(92vw,1400px)]" in line or "w-[min(calc(100%-3rem),1400px)]" in line:
                legacy.append(f"{path}:{lineno}: {line.strip()}")
if legacy:
    print("Legacy fixed-width wrappers remain:")
    print("\n".join(legacy))
    raise SystemExit(1)
print("No targeted fixed 1400px page wrappers remain in app/components TSX.")

# Report remaining max-widths so compact text, modals, devices and invitation renderers are visible to review.
print("\n=== REMAINING MAX-WIDTH REVIEW ===")
for root in (Path("app"), Path("components")):
    for path in root.rglob("*.tsx"):
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if re.search(r'\bmax-w-(?:3xl|4xl|5xl|6xl|7xl)\b', line):
                print(f"{path}:{lineno}: {line.strip()}")

print("\n=== POTENTIAL DECORATIVE NUMBER REVIEW ===")
number_checks = [
    re.compile(r'padStart\(2'),
    re.compile(r'index\s*\+\s*1'),
    re.compile(r'>\s*0[1-9]\s*<'),
    re.compile(r'[\"\'`]\s*(?:Step|Langkah)\s+\d+', re.I),
]
for root in (Path("app"), Path("components")):
    for path in root.rglob("*.tsx"):
        for lineno, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            if any(pattern.search(line) for pattern in number_checks):
                print(f"{path}:{lineno}: {line.strip()}")
