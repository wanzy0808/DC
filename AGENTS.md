<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

<<<<<<< HEAD
# DC Organizer — Design System, Animation & Engineering Rules
=======
# DC Organizer — Design System Rules
>>>>>>> 0aa923d7384554393256ffb41e53b3072207e2ba

These rules apply to the entire project unless a specific component explicitly requires otherwise.

---

<<<<<<< HEAD
## 1. Brand Identity & Naming Authority
=======
Use only these three fonts throughout the DC Organizer project:
>>>>>>> 0aa923d7384554393256ffb41e53b3072207e2ba

- **Official Brand Name:** **DC Organizer**[cite: 12]
- Do **not** use legacy brand names (such as Citin or DC Wedding)[cite: 12].
- Ensure all visual logos, header titles, HTML metadata, page titles, and footers consistently reflect **DC Organizer**[cite: 12].

<<<<<<< HEAD
---

## 2. Typography
=======
### Typography rules
- Do not introduce additional fonts.
- Do not use browser/system fallback fonts as an intentional visual style.
- Do not use `font-mono` unless it resolves to the project's **DM Mono** font.
- Do not use random Google Fonts, template fonts, or component-library fonts.
- Existing invitation-template typography may be dynamic when it is part of invitation content/editor functionality; this must not introduce extra fonts into surrounding application UI.
- Keep typography consistent across landing page, dashboard, editor, RSVP, Usher App, forms, dialogs, menus, cards, and other application UI.
>>>>>>> 0aa923d7384554393256ffb41e53b3072207e2ba

Use only these three fonts throughout the DC Organizer project[cite: 12]:

<<<<<<< HEAD
- **Cinzel** — primary display, heading, title, branding, section heading, and elegant editorial text[cite: 12].
- **Fauna One** — primary body/UI font for readable paragraphs, labels, descriptions, navigation, forms, buttons, and general interface text[cite: 12].
- **DM Mono** — utility/technical typography only: metadata, codes, numbers, timestamps, technical labels, status values, small uppercase utility text, and similar supporting information[cite: 12].

### Typography Rules
- Do **not** introduce additional fonts[cite: 12].
- Do **not** use browser/system fallback fonts as an intentional visual style[cite: 12].
- Do **not** use `font-mono` unless it resolves to the project's **DM Mono** font[cite: 12].
- Existing invitation-template typography may be dynamic when it is part of the invitation editor feature; this must not introduce extra fonts into the surrounding DC Organizer application UI[cite: 12].

---
=======
The primary light theme is an elegant **Deep Rose Wood + Dusty Pink** visual system with warm neutral surfaces.

### Canonical light-theme palette
1. **Primary Accent / Action:** Deep Rose Wood — `#8C4A56`
2. **Brand Accent:** Dusty Pink — `#E8B4B8`
3. **Primary Hover:** Dark Rose Wood — `#6E3843`
4. **Background Utama:** Soft Rose Neutral / Warm White — `#FAFAFA`
5. **Surface Secondary (Card/Input):** Pale Blush — `#F5EBEB`
6. **Text Utama:** Charcoal Black — `#1E1B1C`
>>>>>>> 5b425fef1c1818abf20176ab71e6f3592112246a

<<<<<<< HEAD
## 3. Light & Dark Theme Visual System

<<<<<<< HEAD
### Light Theme (Dusty Pink & Rose Wood System)
- **Brand Accent (Logo Base):** Dusty Pink (`#E8B4B8`) — used for monogram badges, active tab highlights, and soft accents[cite: 12].
- **Primary Action / Accent:** Deep Rose Wood (`#8C4A56`) — used for primary buttons, key CTAs, branding titles, active borders, and focus rings[cite: 12].
- **Primary Hover:** Dark Rose Wood (`#6E3843`) — hover/pressed state for primary actions[cite: 12].
- **Background Main:** Soft Rose Neutral / Warm White (`#FAFAFA`) — main canvas background for app, dashboard, and studio editor[cite: 12].
- **Surface Secondary:** Pale Blush (`#F5EBEB`) — cards, inputs, dropdown menus, and hover states[cite: 12].
- **Text Primary:** Charcoal Black (`#1E1B1C`) — body text, labels, and form values for maximum readability[cite: 12].
- **Text Accent:** Deep Rose Wood (`#8C4A56`) — section titles, active links, and key emphasis[cite: 12].
- **No Maroon / Creamy:** Maroon and Creamy tones are fully deprecated. Do not introduce maroon or heavy ivory/cream backgrounds[cite: 12].
=======
=======
### Light-theme rules
>>>>>>> 0aa923d7384554393256ffb41e53b3072207e2ba
- Use `#8C4A56` for primary actions, important accents, active states, branding, and key controls.
- Use `#E8B4B8` as the supporting brand accent, selected-state highlight, subtle emphasis, and decorative accent.
- Use `#6E3843` for primary hover/pressed states and stronger rose-wood contrast.
- Use `#FAFAFA` as the main application/page background rather than cream, ivory, parchment, or warm beige.
- Use `#F5EBEB` for cards, inputs, secondary surfaces, soft panels, and grouped content areas.
- Use `#1E1B1C` as the default functional/body text color on light surfaces.
- Do not introduce unrelated accent colors unless required by a specific product state or accessibility need.
- Prefer semantic theme tokens over hard-coded colors when a token already exists.
- Never sacrifice readability for color matching.
>>>>>>> 5b425fef1c1818abf20176ab71e6f3592112246a

<<<<<<< HEAD
### Dark Theme (Black + Pink System)
- **Background Main:** Obsidian Black (`#0F0E11`)[cite: 12].
- **Surface Card:** Dark Charcoal (`#1A181E`)[cite: 12].
- **Primary Accent:** Dusty Pink (`#E8B4B8`)[cite: 12].
- **Text Primary:** Pure White / Soft White (`#F8F9FA`)[cite: 12].
- **Text Accent:** Soft Pink Blush (`#F4C2C7`)[cite: 12].

<<<<<<< HEAD
---
=======
- **Do not use two text colors everywhere just to create visual variety.** Avoid the common pattern of turning ordinary black/dark text into rose wood without a clear purpose.
- **Default body and functional text should use `#1E1B1C`** on light surfaces.
- **Deep Rose Wood is an accent, not a default replacement for charcoal text.** Use it selectively for emphasis, active states, important headings/labels, links, branding, or controls that genuinely need emphasis.
- Do **not** turn body text, descriptions, helper text, metadata, navigation text, or other secondary text Deep Rose Wood merely to create a second text color.
- Establish hierarchy primarily through typography, weight, size, spacing, layout, and contrast.
- If charcoal text is already readable and visually appropriate, **do not change it to rose wood without a specific design reason**.
>>>>>>> 5b425fef1c1818abf20176ab71e6f3592112246a

## 4. Text Color Hierarchy — Anti AI-Slop Rule

- **Do not use two text colors everywhere just to create visual variety.** Avoid turning ordinary black/dark text into Rose Wood without a clear purpose[cite: 12].
- **Default body and functional text should use one primary readable text color** appropriate to the background (`#1E1B1C` on light, `#F8F9FA` on dark)[cite: 12].
- **Rose Wood / Pink is an accent, not a default replacement for black body text.**[cite: 12]
- Establish hierarchy primarily through **typography, weight, size, spacing, layout, and contrast**, rather than excessive text-color variation[cite: 12].

---

## 5. Animation & Motion Design Rules (Framer Motion)

AI Agent **must** strictly adhere to the following animation standards to ensure smooth, high-end, and non-distracting user experiences[cite: 7]:

### Core Motion Principles
- **Directives:** Always include `"use client";` at the top of any file utilizing `framer-motion`[cite: 7].
- **Performance First:** Animate only transform (`x`, `y`, `scale`, `rotate`) and `opacity` properties to ensure GPU hardware acceleration (60-120fps). Avoid animating `width`, `height`, `margin`, or `padding` directly[cite: 7].
- **Micro-Interactions (Buttons & Cards):**
  - Buttons must feature soft hover scaling: `whileHover={{ scale: 1.02 }}` and active click feedback: `whileTap={{ scale: 0.98 }}`[cite: 7].
  - Interactive cards should use smooth vertical lift: `whileHover={{ y: -4 }}` with a spring transition[cite: 7].
- **Easings & Curves:** Use custom cubic-bezier curves for premium feel instead of generic linear transitions[cite: 7]:
  - Natural Entrance: `ease: [0.22, 1, 0.36, 1]` (duration: `0.4s` to `0.6s`)[cite: 7].
  - Snappy Interactive Elements: `type: "spring", stiffness: 400, damping: 25`[cite: 7].
- **Scroll Animations & Staggering:**
  - Use `motion.div` with `initial={{ opacity: 0, y: 20 }}` and `whileInView={{ opacity: 1, y: 0 }}` with `viewport={{ once: true, margin: "-50px" }}` to prevent continuous re-triggering[cite: 7].
  - For lists or grids, use `variants` with `staggerChildren: 0.08` to reveal elements sequentially[cite: 7].
- **Layout Transitions:** Use `<AnimatePresence mode="wait">` for seamless tab switching, modal dialog openings, and page transitions[cite: 7].
- **Accessibility (Reduced Motion):** Respect user system settings by utilizing `useReducedMotion()` from Framer Motion to disable heavy animations when requested[cite: 7].
=======
## 3. Dark Mode

Dark mode uses the canonical **Obsidian Black + Dusty Pink** visual system.

### Canonical dark-theme palette
1. **Background Main:** Obsidian Black — `#0F0E11`
2. **Surface Card:** Dark Charcoal — `#1A181E`
3. **Primary Accent:** Dusty Pink — `#E8B4B8`
4. **Text Primary:** Pure White / Soft White — `#F8F9FA`
5. **Text Accent:** Soft Pink Blush — `#F4C2C7`

### Dark-theme rules
- Use `#0F0E11` as the primary application/page background.
- Use `#1A181E` for cards, inputs, dialogs, tables, grouped surfaces, and secondary containers.
- Use `#E8B4B8` for primary actions, active states, key controls, and the main dark-theme accent.
- Use `#F8F9FA` as the default text color for long-form and functional content.
- Use `#F4C2C7` selectively for headings, labels, links, metadata, selected states, and secondary emphasis.
- Do not simply invert the light theme.
- Avoid unrelated accent colors and avoid the old black + hot-pink palette.
- Maintain strong contrast between text and dark surfaces.
>>>>>>> 0aa923d7384554393256ffb41e53b3072207e2ba

---

<<<<<<< HEAD
## 6. Code Formatting & Quality Rules (Prettier & ESLint)

<<<<<<< HEAD
- **Code Formatting Rules:** All generated code must be clean and compliant with **Prettier** formatting rules:
  - Indentation: 2 spaces.
  - Double Quotes: Use standard double quotes for JSX attributes.
  - Class Ordering: Group Tailwind CSS utility classes logically (Prettier Tailwind Plugin standard)[cite: 7].
- **ESLint Compliance:** Avoid unused variables, missing React hook dependencies, or invalid DOM elements. Ensure `asChild` patterns are used correctly on Shadcn UI components[cite: 12].
=======
- On **light backgrounds:** use `#1E1B1C`, or sufficiently dark rose wood text where an accent is intentional.
- On **dark/black backgrounds:** use white, light neutral, or sufficiently bright pink text.
=======
Readability always takes priority over strict color matching.
- On light backgrounds: use `#1E1B1C`, or sufficiently dark rose wood text where an accent is intentional.
- On dark backgrounds: use `#F8F9FA`, `#F4C2C7`, or sufficiently bright `#E8B4B8` text according to hierarchy.
>>>>>>> 0aa923d7384554393256ffb41e53b3072207e2ba
- Buttons, badges, inputs, menus, overlays, and cards must maintain clear text/background contrast.
- Hover, active, disabled, and selected states must remain readable in both themes.
- Decorative colors must never make functional text difficult to read.
>>>>>>> 5b425fef1c1818abf20176ab71e6f3592112246a

---

## 7. UI Components & Libraries (Shadcn UI & Lucide React)

<<<<<<< HEAD
Use **Shadcn UI** components and **Lucide React** icons across the application[cite: 12].
=======
### Rules penggunaan Shadcn UI & Lucide:
- **Shadcn UI Components:** Manfaatkan komponen standar seperti `Dialog`, `Sheet`, `Table`, `DropdownMenu`, `Button`, `Switch`, `Badge`, `Select`, dan `Card`.
<<<<<<< HEAD
- **Styling Customization:** Setiap komponen Shadcn UI yang digunakan **wajib disesuaikan warna dan tipografinya** menginduk pada *theme tokens* DC Wedding (Light: Deep Rose Wood/Dusty Pink/Warm White/Pale Blush, Dark: Black/Pink). Jangan biarkan warna default Shadcn (seperti slate/zinc/neutral bawaan) tanpa penyesuaian.
- **Lucide Icons:** Gunakan ikon Lucide (`LucideIcon`) dengan ukuran ringkas (misal `w-4 h-4` atau `w-5 h-5`) untuk keterbacaan yang rapi. Warna ikon harus mengikuti hierarki *accent color* halaman.
- **Interactive Triggers:** Gunakan properti `asChild` pada `SheetTrigger` atau `DialogTrigger` jika dibungkus oleh komponen khusus untuk menghindari *nested button error* di DOM.
>>>>>>> 5b425fef1c1818abf20176ab71e6f3592112246a

### Implementation Rules
- **Shadcn UI Customization:** All Shadcn UI components (`Dialog`, `Sheet`, `Table`, `DropdownMenu`, `Button`, `Switch`, `Badge`, `Select`, `Card`) **must be styled using DC Organizer theme tokens**[cite: 12]. Override default slate/zinc/neutral colors[cite: 12].
- **Lucide Icons:** Use Lucide icons (`LucideIcon`) with a minimum size of `w-5 h-5` or `w-6 h-6` for high legibility[cite: 12]. Icon colors must follow theme accents (Rose Wood in light mode, Dusty Pink/White in dark mode)[cite: 12].
- **Interactive Triggers:** Use `asChild` on `SheetTrigger` or `DialogTrigger` when wrapping custom trigger elements to prevent DOM nesting errors[cite: 12].

<<<<<<< HEAD
---
=======
=======
- **Styling Customization:** Setiap komponen Shadcn UI yang digunakan wajib disesuaikan warna dan tipografinya menginduk pada theme tokens DC Organizer (Light: Deep Rose Wood/Dusty Pink/Warm White/Pale Blush, Dark: Obsidian Black/Dark Charcoal/Dusty Pink/Soft White/Pink Blush).
- **Lucide Icons:** Gunakan ikon Lucide (`LucideIcon`) dengan ukuran ringkas untuk keterbacaan yang rapi. Warna ikon harus mengikuti hierarki accent color halaman.
- **Interactive Triggers:** Gunakan properti `asChild` pada `SheetTrigger` atau `DialogTrigger` jika dibungkus oleh komponen khusus untuk menghindari nested button error di DOM.

## 6. Implementation Guidance
>>>>>>> 0aa923d7384554393256ffb41e53b3072207e2ba
- Reuse the project's existing CSS variables, theme tokens, and font variables whenever possible.
- Prefer semantic theme tokens over hard-coded colors when a token already exists.
- If a new light-theme token is necessary, keep it within the canonical light palette.
- If a new dark-theme token is necessary, keep it within `#0F0E11`, `#1A181E`, `#E8B4B8`, `#F8F9FA`, and `#F4C2C7`, except for explicit product-state colors required for accessibility.
- Keep light and dark variants intentionally designed rather than relying on automatic color inversion.
- Before adding a new UI component, check that its typography and colors follow these rules.

## 7. Design Consistency

The application should feel like one coherent premium wedding platform.
- **Brand = DC Organizer.**
- **Cinzel = elegance / display.**
- **Fauna One = readable application UI.**
- **DM Mono = utility / technical detail.**
- **Light mode = Deep Rose Wood + Dusty Pink + Soft Rose Neutral + Pale Blush + Charcoal.**
- **Dark mode = Obsidian Black + Dark Charcoal + Dusty Pink + Soft White + Pink Blush.**
- **Text color should remain restrained; do not create unnecessary multi-color text hierarchy.**

When choosing between two visually valid implementations, prefer the one that is simpler, more consistent, more readable, and closer to this design system.
>>>>>>> 5b425fef1c1818abf20176ab71e6f3592112246a

## 8. Code Maintainability & Refactoring Rules
<<<<<<< HEAD

- **File Length Limit:** Keep component and module files within **200–250 lines of code**[cite: 12]. Refactor long files (especially canvas editors or dashboard pages)[cite: 12].
- **Extract Sub-components:** Modularize complex UI into smaller sub-components inside `components/`[cite: 12].
- **Custom Hooks for Logic:** Isolate complex state management, data fetching, or Konva Canvas interactions into custom hooks (e.g., `useCanvasEditor.ts`, `useInvitationData.ts`)[cite: 12].
- **Constants & Helpers Extraction:** Move validation schemas, dropdown options, and formatting helpers to `lib/` or `constants/`[cite: 12].

---

## 9. Layout, Spacing & Visual Clarity

- **Anti-Blur & High Legibility:** Use strong font weights (`font-medium` or `font-semibold` for UI/menus) with high contrast[cite: 12]. Never use washed-out/muted grays[cite: 12].
- **Generous Spacing:** Use proportional padding, margins, and gaps (`p-4`, `p-6`, `gap-4`) so UI elements do not feel cluttered[cite: 12].
- **Touch Targets:** Ensure interactive touch targets have a minimum clickable area of 44x44px[cite: 12].
=======
- **File Length Limit:** Usahakan setiap file komponen atau modul tidak melebihi 200–250 baris kode. Jika file sudah terlalu panjang, lakukan refactoring.
- **Extract Sub-components:** Pisahkan UI yang kompleks atau independen menjadi komponen-komponen kecil tersendiri di `components/`.
- **Custom Hooks for Logic:** Ekstrak logika state yang berat, data fetching, event handler kompleks, atau integrasi Konva Canvas ke dalam custom hooks.
- **Single Responsibility Principle:** Pastikan satu file/komponen hanya menangani satu tugas utama.
- **Constants & Helpers Extraction:** Pindahkan data konstan, opsi dropdown, skema validasi, atau fungsi utility matematika/formatting keluar dari file komponen utama ke `lib/` atau `constants/`.

## 9. Layout, Spacing & Visual Clarity Rules
- **Anti-Blur & High Legibility:** Seluruh teks, label menu, dan tombol wajib menggunakan font-weight yang tegas dengan warna kontras tinggi.
- **Generous Spacing & Layout Scaling:** Manfaatkan area/ruang layar yang luas secara maksimal dengan padding, margin, dan gap yang proporsional.
- **Icon Sizing & Touch Targets:** Ikon utama gunakan ukuran minimal `w-5 h-5` atau `w-6 h-6`, dengan touch target minimal 44x44px.
- **Navigation & Menu Readability:** Menu navigasi, dropdown, dan sidebar harus memiliki ukuran font yang nyaman dibaca dan indikator state aktif/hover yang jelas.
>>>>>>> 0aa923d7384554393256ffb41e53b3072207e2ba
