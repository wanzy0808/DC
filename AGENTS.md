<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# DC Wedding — Design System Rules

These rules apply to the entire project unless a specific component explicitly requires otherwise.

## 1. Typography

Use only these three fonts throughout the DC Wedding project:

- **Cinzel** — primary display, heading, title, branding, section heading, and elegant editorial text.
- **Fauna One** — primary body/UI font for readable paragraphs, labels, descriptions, navigation, forms, buttons, and general interface text.
- **DM Mono** — utility/technical typography only: metadata, codes, numbers, timestamps, technical labels, status values, small uppercase utility text, and similar supporting information.

### Typography rules

- Do **not** introduce additional fonts.
- Do **not** use browser/system fallback fonts as an intentional visual style.
- Do **not** use `font-mono` unless it resolves to the project's **DM Mono** font.
- Do **not** use random Google Fonts, template fonts, or component-library fonts.
- Existing invitation-template typography may be dynamic when it is part of the invitation content/editor feature; this must not introduce extra fonts into the surrounding DC Wedding application UI.
- Keep typography consistent across landing page, dashboard, editor, RSVP, Usher App, forms, dialogs, menus, cards, and other application UI.

## 2. Light Mode / Default Visual Theme

The primary light theme is an elegant **Deep Rose Wood + Dusty Pink** visual system with warm neutral surfaces.

### Canonical light-theme palette

1. **Primary Accent / Action:** Deep Rose Wood — `#8C4A56`
2. **Brand Accent:** Dusty Pink — `#E8B4B8`
3. **Primary Hover:** Dark Rose Wood — `#6E3843`
4. **Background Utama:** Soft Rose Neutral / Warm White — `#FAFAFA`
5. **Surface Secondary (Card/Input):** Pale Blush — `#F5EBEB`
6. **Text Utama:** Charcoal Black — `#1E1B1C`

### Light-theme rules

- Use `#8C4A56` for primary actions, important accents, active states, branding, and key controls.
- Use `#E8B4B8` as the supporting brand accent, selected-state highlight, subtle emphasis, and decorative accent.
- Use `#6E3843` for primary hover/pressed states and stronger rose-wood contrast.
- Use `#FAFAFA` as the main application/page background rather than cream, ivory, parchment, or warm beige.
- Use `#F5EBEB` for cards, inputs, secondary surfaces, soft panels, and grouped content areas.
- Use `#1E1B1C` as the default functional/body text color on light surfaces.
- Do not introduce unrelated accent colors unless required by a specific product state or accessibility need.
- Prefer semantic theme tokens over hard-coded colors when a token already exists.
- Never sacrifice readability for color matching.

### Text Color Hierarchy — Anti AI-Slop Rule

- **Do not use two text colors everywhere just to create visual variety.** Avoid the common pattern of turning ordinary black/dark text into rose wood without a clear purpose.
- **Default body and functional text should use `#1E1B1C`** on light surfaces.
- **Deep Rose Wood is an accent, not a default replacement for charcoal text.** Use it selectively for emphasis, active states, important headings/labels, links, branding, or controls that genuinely need emphasis.
- Do **not** turn body text, descriptions, helper text, metadata, navigation text, or other secondary text Deep Rose Wood merely to create a second text color.
- Establish hierarchy primarily through typography, weight, size, spacing, layout, and contrast.
- If charcoal text is already readable and visually appropriate, **do not change it to rose wood without a specific design reason**.

## 3. Dark Mode

Dark mode uses a **black + pink** visual system.

### Color direction

- **Background:** black or near-black.
- **Primary accent:** pink / soft rose / hot pink tones as appropriate to the surface.
- **Text:** white or light neutral text on dark backgrounds.
- **Text:** pink may be used for emphasis, headings, labels, links, or accents when readability remains strong.

### Dark-theme rules

- Do not simply invert the light theme.
- Dark surfaces should remain genuinely dark/black.
- Pink is the primary accent family in dark mode.
- White text is preferred for long-form readability on black backgrounds.
- Pink text is allowed for emphasis but must remain clearly readable.
- Avoid low-contrast combinations such as dark gray text on black or dark pink on black.

## 4. Contrast & Readability

Readability always takes priority over strict color matching.

- On **light backgrounds:** use `#1E1B1C`, or sufficiently dark rose wood text where an accent is intentional.
- On **dark/black backgrounds:** use white, light neutral, or sufficiently bright pink text.
- Buttons, badges, inputs, menus, overlays, and cards must maintain clear text/background contrast.
- Hover, active, disabled, and selected states must remain readable in both themes.
- Decorative colors must never make functional text difficult to read.

## 5. UI Components & Libraries (Shadcn UI & Lucide React)

Gunakan komponen **Shadcn UI** dan ikon dari **Lucide React** untuk kebutuhan UI/UX interaktif seluruh aplikasi.

### Rules penggunaan Shadcn UI & Lucide:
- **Shadcn UI Components:** Manfaatkan komponen standar seperti `Dialog`, `Sheet`, `Table`, `DropdownMenu`, `Button`, `Switch`, `Badge`, `Select`, dan `Card`.
- **Styling Customization:** Setiap komponen Shadcn UI yang digunakan **wajib disesuaikan warna dan tipografinya** menginduk pada *theme tokens* DC Wedding (Light: Deep Rose Wood/Dusty Pink/Warm White/Pale Blush, Dark: Black/Pink). Jangan biarkan warna default Shadcn (seperti slate/zinc/neutral bawaan) tanpa penyesuaian.
- **Lucide Icons:** Gunakan ikon Lucide (`LucideIcon`) dengan ukuran ringkas (misal `w-4 h-4` atau `w-5 h-5`) untuk keterbacaan yang rapi. Warna ikon harus mengikuti hierarki *accent color* halaman.
- **Interactive Triggers:** Gunakan properti `asChild` pada `SheetTrigger` atau `DialogTrigger` jika dibungkus oleh komponen khusus untuk menghindari *nested button error* di DOM.

## 6. Implementation Guidance

- Reuse the project's existing CSS variables, theme tokens, and font variables whenever possible.
- Prefer semantic theme tokens over hard-coded colors when a token already exists.
- If a new light-theme token is necessary, keep it within the canonical `#8C4A56`, `#E8B4B8`, `#6E3843`, `#FAFAFA`, `#F5EBEB`, `#1E1B1C` palette.
- Keep light and dark variants intentionally designed rather than relying on automatic color inversion.
- Before adding a new UI component, check that its typography and colors follow these rules.

## 7. Design Consistency

DC Wedding should feel like one coherent premium wedding platform.

- **Cinzel = elegance / display.**
- **Fauna One = readable application UI.**
- **DM Mono = utility / technical detail.**
- **Light mode = Deep Rose Wood + Dusty Pink + Soft Rose Neutral + Pale Blush + Charcoal.**
- **Dark mode = black + pink.**
- **Text color should remain restrained; do not create unnecessary multi-color text hierarchy.**

When choosing between two visually valid implementations, prefer the one that is simpler, more consistent, more readable, and closer to this design system.

## 8. Code Maintainability & Refactoring Rules

Untuk menjaga kualitas basis kode (*codebase*) agar tetap bersih, modular, dan mudah dipelihara:

- **File Length Limit:** Usahakan setiap file komponen atau modul **tidak melebihi 200–250 baris kode**. Jika file sudah terlalu panjang (terutama file halaman atau canvas editor), lakukan refactoring.
- **Extract Sub-components:** Pisahkan UI yang kompleks atau independen menjadi komponen-komponents kecil tersendiri di dalam direktori `components/` (misalnya: memisahkan modal, form section, toolbar, atau item list).
- **Custom Hooks for Logic:** Ekstrak logika state yang berat, data fetching, event handler kompleks, atau integrasi Konva Canvas ke dalam *custom hooks* (misalnya: `useCanvasEditor.ts`, `useInvitationData.ts`) untuk memisahkan logika dari layer UI.
- **Single Responsibility Principle:** Pastikan satu file/komponen hanya menangani satu tugas utama.
- **Constants & Helpers Extraction:** Pindahkan data konstan, opsi dropdown, skema validasi, atau fungsi utility matematika/formatting keluar dari file komponen utama ke file terpisah di `lib/` atau `constants/`.

## 9. Layout, Spacing & Visual Clarity Rules

- **Anti-Blur & High Legibility:** Seluruh teks, label menu, dan tombol wajib menggunakan font-weight yang tegas (minimal `font-medium` atau `font-semibold` untuk UI/menu) dengan warna kontras tinggi. Dilarang keras menggunakan warna teks samar/buram (seperti muted gray yang terlalu muda) tanpa alasan spesifik.
- **Generous Spacing & Layout Scaling:** Manfaatkan area/ruang layar yang luas secara maksimal. Gunakan padding, margin, dan gap yang proporsional (misal: `p-4`, `p-6`, `gap-4`) agar elemen UI/menu tidak berdesakan dan mudah dibaca.
- **Icon Sizing & Touch Targets:** Ikon tidak boleh terlalu kecil. Gunakan ukuran minimal `w-5 h-5` atau `w-6 h-6` untuk menu/action button utama, serta pastikan area klik/sentuh (*touch target*) memiliki padding memadai (minimal 44x44px).
- **Navigation & Menu Readability:** Menu navigasi, dropdown, dan sidebar harus memiliki ukuran font yang nyaman dibaca (minimal `text-sm` hingga `text-base`), tingkat keterbacaan tinggi, serta indikator state aktif/hover yang jelas.