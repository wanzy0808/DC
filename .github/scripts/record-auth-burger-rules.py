from pathlib import Path


def replace_once(path: str, old: str, new: str) -> None:
    file = Path(path)
    text = file.read_text(encoding="utf-8")
    if old not in text:
        raise SystemExit(f"Expected text not found in {path}: {old[:100]}")
    file.write_text(text.replace(old, new, 1), encoding="utf-8")


prd_old = "- Public burger menu tidak menampilkan `Beranda`; home tetap dapat dicapai melalui brand/logo. Seluruh action utama memakai canonical Rose Button treatment seperti action `Daftar`. `Layanan` tetap menjadi parent dengan submenu Event Planner / Digital Invitation / Guestbook, `Masuk` dan `Daftar` wajib tersedia, dan icon `Layanan` harus berbeda dari icon `Paket`; decorative numbering tidak digunakan."
prd_new = "- Public burger menu tidak menampilkan `Beranda`; home tetap dapat dicapai melalui brand/logo. Untuk locale Indonesia, submenu layanan memakai label `Perencana Acara`, `Undangan Digital`, dan `Buku Tamu Digital`. `Layanan` tetap menjadi parent dengan submenu tersebut, `Masuk` dan `Daftar` wajib tersedia, dan icon `Layanan` harus berbeda dari icon `Paket`; decorative numbering tidak digunakan.\n- Burger navigation dan authentication surfaces (`Daftar` dialog serta `/login`) memakai treatment netral **background putih + teks hitam + border tipis** sebagai exception eksplisit dari canonical Rose application button. Rose tetap dipakai untuk accent/focus/link, bukan fill utama pada surface ini.\n- Registration dialog tidak boleh menempatkan action `Masuk` di header kanan bila bertabrakan dengan tombol close `X`; switch ke `Masuk` ditempatkan di bawah form. Login/register copy harus general-event oriented, bukan wedding-only."
replace_once("prd.md", prd_old, prd_new)

agents_old = "- Public burger menu omits a dedicated Home/Beranda item; the logo remains the home path. Top-level burger actions use the canonical `Button` visual treatment consistently, `Layanan` remains a submenu parent, `Masuk` and `Daftar` remain visible, and service/package icons must be visually distinct."
agents_new = "- Public burger menu omits a dedicated Home/Beranda item; the logo remains the home path. In Indonesian, service labels are `Perencana Acara`, `Undangan Digital`, and `Buku Tamu Digital`. `Layanan` remains a submenu parent, `Masuk` and `Daftar` remain visible, and service/package icons must be visually distinct.\n- Explicit UI exception: burger navigation buttons plus registration/login controls use a neutral white surface with black text and a subtle border in both themes. Keep using the shared `Button` primitive, but this surface-specific treatment supersedes the Rose fill rule for these auth/navigation surfaces. Rose remains the accent for focus, links, and selected emphasis.\n- Registration dialog headers must reserve the top-right area for the close `X`; do not place a `Masuk` action there. Put the login switch below the registration form. Auth copy must remain general-event oriented."
replace_once("AGENTS.md", agents_old, agents_new)

button_old = "- Do not introduce one-off button colors, gradients, borders, shadows, rounded treatments, or page-specific button variants outside `components/ui/button.tsx`."
button_new = button_old + "\n- Exception defined above: burger navigation and auth/login/register surfaces may override the canonical Rose fill with the documented neutral white/black treatment while still rendering through `Button`."
replace_once("AGENTS.md", button_old, button_new)

readme_old = "- Public burger navigation omits Beranda/Home because the brand logo already returns home; main actions share the canonical Rose Button treatment, `Layanan` retains its service submenu, `Masuk` and `Daftar` stay present, and `Layanan`/`Paket` use distinct icons."
readme_new = "- Public burger navigation omits Beranda/Home because the brand logo already returns home. Indonesian service labels are `Perencana Acara`, `Undangan Digital`, and `Buku Tamu Digital`; `Layanan` retains its submenu, `Masuk` and `Daftar` stay present, and `Layanan`/`Paket` use distinct icons.\n- Burger navigation and auth surfaces intentionally use white controls with black text and a subtle border in both themes; Rose remains the accent. Registration keeps the close `X` unobstructed, with the `Masuk` switch below the form. `/login` follows the same neutral visual language and general-event wording."
replace_once("README.md", readme_old, readme_new)

changelog = Path("prd1.md")
text = changelog.read_text(encoding="utf-8")
heading = "## 2026-09-17 — Indonesian Burger Labels & Neutral Auth Surfaces"
if heading not in text:
    text += """

---

## 2026-09-17 — Indonesian Burger Labels & Neutral Auth Surfaces

### Requirement / Intent
Mengembalikan burger menu ke treatment putih dengan teks hitam, melokalkan submenu layanan ke Bahasa Indonesia, menghilangkan overlap action `Masuk` dengan tombol close pada dialog Daftar, dan menyamakan visual/copy halaman Masuk dengan aturan produk general-event.

### Implementation
- label locale Indonesia di burger diubah menjadi `Perencana Acara`, `Undangan Digital`, dan `Buku Tamu Digital`;
- seluruh button burger memakai background putih, teks hitam, border tipis, dan Rose hanya sebagai accent/ring;
- `Layanan` tetap memiliki submenu dan icon `Layers`, sementara Paket memakai `Package`;
- dialog Daftar memakai surface putih/teks hitam, termasuk Google, password visibility, dan submit controls;
- action `Masuk` pada header dialog Daftar dihapus agar tidak menutupi tombol close `X`; switch Masuk tetap tersedia di bawah form;
- copy vendor pada Daftar digeneralisasi dari konteks wedding menjadi konteks acara;
- halaman `/login` disederhanakan menjadi general-event workspace copy dan memakai visual putih/teks hitam yang konsisten dengan Daftar/burger;
- theme prop lama pada burger/register dibuang karena auth surface sekarang sengaja netral di kedua theme;
- requirement aktif disinkronkan ke `prd.md`, `AGENTS.md`, dan `README.md`.

### Affected Files
- `lib/i18n.ts`
- `components/Layout/Navbar/BurgerMenuContent.tsx`
- `components/Layout/Navbar/RegisterDialog.tsx`
- `components/Layout/Navbar/Navbar.tsx`
- `app/login/page.tsx`
- `prd.md`
- `AGENTS.md`
- `README.md`
- `prd1.md`

### Commits
- `cc0a8498c5b345a5b34773b56f57a2164ca463c8` — localize Indonesian burger service labels;
- `704b9fe59825e87c5935e76d7267648940f7255a` — restore neutral burger button styling;
- `0a5b7b1bffa8361b6f7019b546af052212d5d70e` — fix registration dialog actions and neutral styling;
- `4598cc30a408153839ea8d7cddf3e6ef12c1063a` — remove obsolete burger theme prop;
- `2d9c2711778be9fff1aab2fc6aff54f45035a599` — remove obsolete navbar theme plumbing;
- `0f3a6476e46fdd00cec9746a7b7e8b91a4806e80` — align login page with neutral auth styling.

### Validation
- GitHub Actions Build Validation #927 on source head `0f3a6476e46fdd00cec9746a7b7e8b91a4806e80`: pending observation at changelog script creation time.
- Database migration: N/A.
"""
    changelog.write_text(text, encoding="utf-8")
