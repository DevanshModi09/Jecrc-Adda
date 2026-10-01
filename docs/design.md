# College Adda Design System

This describes the existing application on `aman-dev`, inspected before Character implementation. Source of truth: `client/src/styles/global.css`, `components/ui.tsx`, `components/Layout.tsx`, the auth/intro/loading components, and feature styles. These are existing conventions, not a proposed redesign.

## 1. Design Philosophy

College Adda uses a dark arcade/campus interface: square frames, bitmap typography, bright accents, CRT scanlines and game vocabulary such as PLAYER, QUESTS, PRESS START and QUIT. Functional planning and social pages share the same shell as the pixel campus. Decorative glow exists on Campus navigation and Home's Pixelverse action; motion is not exclusively functional.

## 2. Color System

Actual global CSS tokens:

| Token | Value | Existing role |
| --- | --- | --- |
| `--bg` | `#170f2e` | Page background |
| `--bg-deep` | `#100a22` | Inputs, recesses, hard shadows |
| `--panel` | `#221845` | Panel surface |
| `--panel-2` | `#2c2058` | Raised/selected surfaces and dropdown |
| `--ink` | `#f4f1ff` | Text and inner panel border |
| `--muted` | `#b9aee8` | Supporting text |
| `--dim` | `#8a80b8` | Placeholders and secondary indicators |
| `--frame` | `#6a4bd8` | Violet panel frame and field borders |
| `--cyan` | `#3ef2e0` | Links, focus, secondary actions |
| `--pink` | `#ff3ea5` | Brand, errors, special accents |
| `--yellow` | `#ffe04a` | Headings, primary buttons, active navigation |
| `--green` | `#7cff6b` | Completion and availability |
| `--orange` | `#ff8a3d` | Reconnection warning |

Canvas rendering uses literal palette values because it draws into a bitmap. The existing assigned user-color palette also includes `#8b6cff`, `#5ab0ff`, and `#ff5e5e`; profile color is currently the Campus shirt color. It is not always green. Preserve these old colors when customization is absent.

## 3. Typography

`--px`: Press Start 2P, monospace fallback. Used for brand, page headings, panel titles, small labels and buttons. `--vt`: VT323, monospace fallback. Used for body text, navigation, inputs and most dense content. Body is 22px/1.25, 20px on small screens. Page headings are 20px/1.5 (16px mobile); panel titles 13px/1.5; field labels 10px/1.5. Buttons use 11px pixel type, small buttons 9px. `.px-xs`, `.px-sm`, `.upper`, and color utilities are available. Navigation and action copy are uppercase; explanatory prose uses normal sentence case.

## 4. Borders & Panels

`Panel`/`.panel` uses a 4px ink border, then 4px background and 8px violet spread shadows to create a double frame. Cyan and pink tones change the outer frame. Corners are square. Standard padding is `--pad: 18px`, reduced to 14px on mobile. Panel headers have a title and optional action. Dividers are 3px dotted violet. Dropdown uses a compact 3px cyan border and a 5px hard shadow rather than a full double frame.

## 5. Buttons

`.btn` is yellow with dark text, 44px minimum height, 12px 16px padding, and a 4px hard shadow. Pink/cyan variants change fill. Ghost buttons have transparent fill and 3px cyan borders; Quit uses the small ghost treatment, not a separate destructive variant. Hover brightens filled buttons; ghost hover turns yellow. Pressing offsets 2px and reduces shadow. Disabled opacity is .55. `.btn--sm` is at least 36px high; `.btn--block` fills width. Icon buttons are square text controls. Preserve native button semantics.

## 6. Forms

`Field` wraps its label and child; label/input gap is 6px. `.input`, `.select`, `.textarea` use deep background, 3px violet borders, 44px minimum height, square corners and 22px text. Focus turns borders cyan. Placeholder color is dim. `.form-grid` has 16px gaps and optional two/three columns. Field errors are pink; `.form-error` is a 3px pink bordered message, used with `role="alert"`. Native selects and labelled controls recur in Auth, People, timetable, deadlines and profile pages.

## 7. Navigation

`Layout` owns the logo, main navigation, player profile/section/level and Quit. The top links are DASHBOARD (the `/` home route), CAMPUS, FEED, ACADEMICS, EVENTS, PLAYERS. The logo also links home. On desktop, equal outer grid tracks center the navigation against the viewport, with the logo left and player/Quit right. Active links are yellow with `▶`; Campus otherwise glows pink. Academics groups deadlines, assignments, timetable and attendance. Its button exposes expanded state; click toggles, outside pointer closes, Escape returns focus, and its ordinary links are tabbable. The popup is absolutely positioned and does not change row height. Player information sits at the right and links to PLAYERS / MY PLAYER. At 1400px the nav wraps onto its own row; at 760px header padding becomes 16px. Code Desk remains available through Home's PLAYERS ONLINE / DESKS action. PLAYERS uses the existing `.tabs` and `.tab` controls for My Player, Find Players, Friends and Requests; the tab is represented in the URL.

## 8. Pixel Graphics

Campus is a canvas scene built from rectangle primitives and a prerendered map. `drawAvatar` in `features/campus/render.ts` draws a 12×16 character anchored at its feet: fixed skin, dark hair, colored shirt, dark legs, two-step walking cycle, directional face and optional seated posture. Staff reuse this renderer with cap/apron. Canvas smoothing is disabled and canvas CSS uses pixelated rendering. Preserve integer pixels and nearest-neighbor scaling for enlarged previews. Labels (including YOU) are separate from the body. Elsewhere `ui.tsx` Avatar is an initials square, not the Campus character. The chat action uses crisp-edge SVG. Existing café dishes use emoji; that exception is not a reason to substitute emoji for new character art.

The Campus panel's small fullscreen control expands only the `.campus` game wrapper, including its canvas, minimap and overlays. The browser Fullscreen API and `fullscreenchange` keep its enter/exit label in sync (including Escape); container resize recalculates the canvas while retaining pixelated rendering and a dark backdrop.

### Campus Map & JECRC Layout Rules

- **Topology & Truth:** The campus map layout directly represents the JECRC University campus topology from the reference layout, replacing earlier fictional arrangements with real spatial relationships (VIB on the west, Central Lawn ring, Football Ground, NYB, BH1, Mess, Basketball, BH2, Cricket Turf, Tennis Court, GH, JMCH in the south-west, Large Ground in the south-east, BH3 in the far south, and North/East gates).
- **Pixel-Art Continuity:** The map strictly uses the existing College Adda pixel-art language, Arcade color tokens, 16×16 tile dimensions, and nearest-neighbor rendering. No Google Maps, 3D, vector, or isometric graphics are introduced.
- **Centralized Geometry:** World dimensions (`120×80` tiles in `WORLD_SIZE`), building footprints (`BUILDINGS`), road segments (`ROAD_SEGMENTS`), and zone boundaries (`MAP_ZONES`) are centralized and data-driven in `client/src/features/campus/map.ts`. Coordinates must not be scattered across multiple rendering files.
- **Road & Connectivity Principle:** Roadways are 2–3 tiles wide, fully walkable paths that physically connect all campus locations into one navigable network. Buildings have designated doorways opening directly onto adjacent roads.
- **Visual Families:**
  - *Academic Blocks (VIB, NYB):* Classrooms, lecture hall desks, computer stations.
  - *Institutional Block (JMCH):* Expansive medical college halls, laboratories, central reception.
  - *Hostel Family (BH1, BH2, BH3, GH):* Shared hostel architecture, student rooms, study spaces, common-room hangouts.
  - *Dining (MESS):* Food counter with live staff/waiter service and dining tables.
  - *Sports Grounds:* Clear surface textures (grass football field, acrylic basketball court, synthetic cricket turf with clay pitch, tennis court, and large ground with perimeter running track).
  - *Landscaped Green Space (Central Lawn):* Lush flora, fountain, stone footpaths, and relaxation benches.
- **Minimap Correspondence:** The minimap renders the prerendered campus canvas with an exact matching aspect ratio (`120 / 80`), displaying live player positions and the dynamic camera viewport frame.

## 9. Animation & Motion

EntryIntro is a fixed branded overlay at z-index 1000: short logo/tagline arrivals, then an upward exit, with a timeout fallback and inert background. Reduced motion uses a short opacity exit. CampusLoadingTransition is a separate fixed overlay at 900 with a stepped segmented meter, pending/exiting states, inert content and animation/timeout exit handling in App. Reduced motion makes transitions near-instant and the meter static. Academics opens directly with a flipped caret; no reveal animation. Buttons use a pressed translation. Blink/glow and Home's glow have reduced-motion overrides. New editor controls need no animation loop.

## 10. Layout & Spacing

Main content is max-width 1360px, centered, with 12px 40px 60px padding. Page headers have 30px bottom margin. Two/three-column grids use 34px gaps; stacks 14px, rows 12px. Three columns become two at 1100px and one at 760px; form columns also collapse at 760px. Auth has its own 1160px two-column layout, 64px gap, collapsing at 860px. Home combines framed panels and a Pixelverse action. Feed uses post panels; People uses filters/cards; Events uses grouped dated panels; Academics uses forms, tabs and subject/status panels; Code Desk uses room cards and shared timer/chat regions. Feature CSS handles their local layouts.

## 11. Accessibility

The global focus-visible outline is 3px dashed cyan with 3px offset. Native controls, labelled fields, aria-pressed filters, aria-current links, role=status loaders, alerts, dialog-based modals and reduced-motion media queries already exist. Intro/loading overlays make underlying content inert. Do not communicate character selection through color alone: pair a visible selected marker with names and semantic selected state. Dim text is supporting text, not a substitute for prominent instructions; the code does not establish a complete contrast certification.

## 12. Design Consistency Rules

- Reuse existing tokens, PageHead, Panel, button/form classes and spacing patterns.
- Preserve the pixel fonts, square corners, hard shadows and double frames.
- Keep the current sprite silhouette and share its actual drawing code with previews.
- Do not introduce rounded SaaS cards, glass surfaces, arbitrary gradients, fonts or image/avatar dependencies for a feature.
- Use existing arrow/text/SVG treatments for controls; do not create emoji avatars.
- Keep option labels, keyboard focus, selection markers and useful errors visible.
- Preserve intro/loading appearance and the surrounding navigation behavior.

### Existing inconsistencies and boundaries

Canvas colors are literals while CSS uses tokens; the user palette's purple differs from `--frame`. Initials avatars and Campus sprites are intentionally different representations. Page-specific spacing and breakpoints vary. Decorative glows and café emoji already exist, so neither an animation-free nor emoji-free claim describes the whole repository. The Academics disclosure uses `aria-haspopup` with ordinary links rather than a complete ARIA menu pattern. This document records those boundaries; it does not authorize unrelated cleanup.

### Character reuse plan

Use PageHead, one Panel, existing primary/ghost buttons, the global focus/error/status treatments and a local responsive layout. Reuse drawAvatar for a static enlarged canvas preview and Campus; introduce only shirt presets and a second hair layer. New account setup and later editing share one editor.

### Implemented Character extension

Character creation is a dedicated onboarding screen; later edits live beside the player card under PLAYERS / MY PLAYER. The editor uses one cyan-framed panel, a static 24×24 canvas displayed at 192×192, and the existing ghost buttons with aria-pressed, visible arrows and text labels. Its onboarding container has a two-column layout that stacks at 760px. Six shirt presets reuse the existing palette: green, cyan, pink, yellow, user-palette purple and orange. Legacy players can retain ORIGINAL rather than being forced into a new color. Hair 01 preserves the existing drawing; Hair 02 adds dark side/back rectangles. Both preview and Campus call the same drawAvatar function.
