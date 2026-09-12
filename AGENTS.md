<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

<!-- END:nextjs-agent-rules -->

# DC Organizer — Design System, Animation & Engineering Rules

These rules apply to the entire project unless a specific component explicitly requires otherwise.

---

## 1. Brand Identity & Naming Authority

- **Official Brand Name:** **DC Organizer**[cite: 12]
- Do **not** use legacy brand names (such as Citin or DC Wedding)[cite: 12].
- Ensure all visual logos, header titles, HTML metadata, page titles, and footers consistently reflect **DC Organizer**[cite: 12].

---

## 2. Typography

Use only these three fonts throughout the DC Organizer project[cite: 12]:

- **Cinzel** — primary display, heading, title, branding, section heading, and elegant editorial text[cite: 12].
- **Fauna One** — primary body/UI font for readable paragraphs, labels, descriptions, navigation, forms, buttons, and general interface text[cite: 12].
- **DM Mono** — utility/technical typography only: metadata, codes, numbers, timestamps, technical labels, status values, small uppercase utility text, and similar supporting information[cite: 12].

### Typography Rules
- Do **not** introduce additional fonts[cite: 12].
- Do **not** use browser/system fallback fonts as an intentional visual style[cite: 12].
- Do **not** use `font-mono` unless it resolves to the project's **DM Mono** font[cite: 12].
- Existing invitation-template typography may be dynamic when it is part of the invitation editor feature; this must not introduce extra fonts into the surrounding DC Organizer application UI[cite: 12].

---

## 3. Light & Dark Theme Visual System

### Light Theme (Dusty Pink & Rose Wood System)
- **Brand Accent (Logo Base):** Dusty Pink (`#E8B4B8`) — used for monogram badges, active tab highlights, and soft accents[cite: 12].
- **Primary Action / Accent:** Deep Rose Wood (`#8C4A56`) — used for primary buttons, key CTAs, branding titles, active borders, and focus rings[cite: 12].
- **Primary Hover:** Dark Rose Wood (`#6E3843`) — hover/pressed state for primary actions[cite: 12].
- **Background Main:** Soft Rose Neutral / Warm White (`#FAFAFA`) — main canvas background for app, dashboard, and studio editor[cite: 12].
- **Surface Secondary:** Pale Blush (`#F5EBEB`) — cards, inputs, dropdown menus, and hover states[cite: 12].
- **Text Primary:** Charcoal Black (`#1E1B1C`) — body text, labels, and form values for maximum readability[cite: 12].
- **Text Accent:** Deep Rose Wood (`#8C4A56`) — section titles, active links, and key emphasis[cite: 12].
- **No Maroon / Creamy:** Maroon and Creamy tones are fully deprecated. Do not introduce maroon or heavy ivory/cream backgrounds[cite: 12].

### Dark Theme (Black + Pink System)
- **Background Main:** Obsidian Black (`#0F0E11`)[cite: 12].
- **Surface Card:** Dark Charcoal (`#1A181E`)[cite: 12].
- **Primary Accent:** Dusty Pink (`#E8B4B8`)[cite: 12].
- **Text Primary:** Pure White / Soft White (`#F8F9FA`)[cite: 12].
- **Text Accent:** Soft Pink Blush (`#F4C2C7`)[cite: 12].

---

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

---

## 6. Code Formatting & Quality Rules (Prettier & ESLint)

- **Code Formatting Rules:** All generated code must be clean and compliant with **Prettier** formatting rules:
  - Indentation: 2 spaces.
  - Double Quotes: Use standard double quotes for JSX attributes.
  - Class Ordering: Group Tailwind CSS utility classes logically (Prettier Tailwind Plugin standard)[cite: 7].
- **ESLint Compliance:** Avoid unused variables, missing React hook dependencies, or invalid DOM elements. Ensure `asChild` patterns are used correctly on Shadcn UI components[cite: 12].

---

## 7. UI Components & Libraries (Shadcn UI & Lucide React)

Use **Shadcn UI** components and **Lucide React** icons across the application[cite: 12].

### Implementation Rules
- **Shadcn UI Customization:** All Shadcn UI components (`Dialog`, `Sheet`, `Table`, `DropdownMenu`, `Button`, `Switch`, `Badge`, `Select`, `Card`) **must be styled using DC Organizer theme tokens**[cite: 12]. Override default slate/zinc/neutral colors[cite: 12].
- **Lucide Icons:** Use Lucide icons (`LucideIcon`) with a minimum size of `w-5 h-5` or `w-6 h-6` for high legibility[cite: 12]. Icon colors must follow theme accents (Rose Wood in light mode, Dusty Pink/White in dark mode)[cite: 12].
- **Interactive Triggers:** Use `asChild` on `SheetTrigger` or `DialogTrigger` when wrapping custom trigger elements to prevent DOM nesting errors[cite: 12].

---

## 8. Code Maintainability & Refactoring Rules

- **File Length Limit:** Keep component and module files within **200–250 lines of code**[cite: 12]. Refactor long files (especially canvas editors or dashboard pages)[cite: 12].
- **Extract Sub-components:** Modularize complex UI into smaller sub-components inside `components/`[cite: 12].
- **Custom Hooks for Logic:** Isolate complex state management, data fetching, or Konva Canvas interactions into custom hooks (e.g., `useCanvasEditor.ts`, `useInvitationData.ts`)[cite: 12].
- **Constants & Helpers Extraction:** Move validation schemas, dropdown options, and formatting helpers to `lib/` or `constants/`[cite: 12].

---

## 9. Layout, Spacing & Visual Clarity

- **Anti-Blur & High Legibility:** Use strong font weights (`font-medium` or `font-semibold` for UI/menus) with high contrast[cite: 12]. Never use washed-out/muted grays[cite: 12].
- **Generous Spacing:** Use proportional padding, margins, and gaps (`p-4`, `p-6`, `gap-4`) so UI elements do not feel cluttered[cite: 12].
- **Touch Targets:** Ensure interactive touch targets have a minimum clickable area of 44x44px[cite: 12].