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

The primary light theme is an elegant **maroon + creamy** visual system.

### Color direction

- **Primary:** maroon / burgundy / deep wine tones.
- **Background:** creamy, warm off-white, ivory, parchment, or similar warm neutral tones.
- **Text:** use **black/dark brown** on light backgrounds when it provides the best readability.
- **Text:** use **white/cream** on sufficiently dark maroon surfaces when it provides better contrast.
- Supporting neutrals should remain warm and harmonious with the creamy background.

### Light-theme rules

- Prefer maroon for primary actions, important accents, active states, branding, borders, and key decorative elements.
- Prefer creamy backgrounds over cold pure white for major surfaces.
- Never sacrifice readability for color matching.
- Text color must always have sufficient contrast against its background.
- Do not create unrelated accent colors unless required by a specific product state or accessibility need.

### Text Color Hierarchy — Anti AI-Slop Rule

- **Do not use two text colors everywhere just to create visual variety.** Avoid the common pattern of turning ordinary black/dark text into maroon without a clear purpose.
- **Default body and functional text should use one primary readable text color** appropriate to the background. On light/creamy surfaces, black or dark brown is normally preferred.
- **Maroon is an accent, not a default replacement for black text.** Use it selectively for emphasis, active states, important headings/labels, links, branding, or other elements that genuinely need emphasis.
- Do **not** turn body text, descriptions, helper text, metadata, navigation text, or other secondary text maroon merely to create a second text color.
- Establish hierarchy primarily through **typography, weight, size, spacing, layout, and contrast**, rather than excessive text-color variation.
- If black/dark text is already readable and visually appropriate, **do not change it to maroon without a specific design reason**.
- When in doubt, choose the simpler single-text-color treatment rather than adding another text color.

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

- On **light/creamy backgrounds:** use black, dark brown, or sufficiently dark maroon text.
- On **dark/black backgrounds:** use white, light neutral, or sufficiently bright pink text.
- Buttons, badges, inputs, menus, overlays, and cards must maintain clear text/background contrast.
- Hover, active, disabled, and selected states must remain readable in both themes.
- Decorative colors must never make functional text difficult to read.

## 5. UI Components & Libraries (Shadcn UI & Lucide React)

Gunakan komponen **Shadcn UI** dan ikon dari **Lucide React** untuk kebutuhan UI/UX interaktif seluruh aplikasi.

### Rules penggunaan Shadcn UI & Lucide:
- **Shadcn UI Components:** Manfaatkan komponen standar seperti `Dialog`, `Sheet`, `Table`, `DropdownMenu`, `Button`, `Switch`, `Badge`, `Select`, dan `Card`.
- **Styling Customization:** Setiap komponen Shadcn UI yang digunakan **wajib disesuaikan warna dan tipografinya** menginduk pada *theme tokens* DC Wedding (Light: Maroon/Cream, Dark: Black/Pink). Jangan biarkan warna default Shadcn (seperti slate/zinc/neutral bawaan) tanpa penyesuaian.
- **Lucide Icons:** Gunakan ikon Lucide (`LucideIcon`) dengan ukuran ringkas (misal `w-4 h-4` atau `w-5 h-5`) untuk keterbacaan yang rapi. Warna ikon harus mengikuti hierarki *accent color* halaman (maroon di light mode, pink/white di dark mode).
- **Interactive Triggers:** Gunakan properti `asChild` pada `SheetTrigger` atau `DialogTrigger` jika dibungkus oleh komponen khusus untuk menghindari *nested button error* di DOM.

## 6. Implementation Guidance

- Reuse the project's existing CSS variables, theme tokens, and font variables whenever possible.
- Prefer semantic theme tokens over hard-coded colors when a token already exists.
- If a new token is necessary, keep it within the DC Wedding maroon/creamy light palette or black/pink dark palette.
- Keep light and dark variants intentionally designed rather than relying on automatic color inversion.
- Before adding a new UI component, check that its typography and colors follow these rules.

## 7. Design Consistency

DC Wedding should feel like one coherent premium wedding platform.

- **Cinzel = elegance / display.**
- **Fauna One = readable application UI.**
- **DM Mono = utility / technical detail.**
- **Light mode = maroon + creamy.**
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