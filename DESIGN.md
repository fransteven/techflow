# Design System Document

## 1. Overview & Creative North Star: "The Kinetic Ledger"

This design system is a departure from the static, boxy nature of traditional enterprise software. Our Creative North Star is **The Kinetic Ledger**. It represents a fusion of high-end editorial clarity and the velocity of modern commerce.

We break the "template" look by prioritizing **white space as a structural element** rather than a void. By moving away from rigid grids and 1px borders, we create a fluid, sophisticated interface that feels "carved" out of a pure white canvas. The system uses intentional asymmetry, generous padding, and high-contrast typography to guide the eye, ensuring that efficiency never comes at the expense of elegance.

---

## 2. Colors & Surface Philosophy

The palette is vibrant and professional, anchored by a deep primary blue and supported by high-visibility accents.

### The Palette
- **Primary Blue (`#0050d4`)**: Used for primary actions and brand presence.
- **Success (`#vibrant-green`)**: Indicating healthy stock levels and growth.
- **Warning (`#Bright-Orange`)**: Highlighting low stock or pending actions.
- **Danger (`#b31b25`)**: Critical stock-outs or errors.
- **Layout Background (`#ffffff`)**: A pure, stark white foundation.

### The "No-Line" Rule
To achieve a premium feel, **sectioning via 1px solid borders is prohibited.** Boundaries must be defined solely through:
1. **Background Color Shifts:** Using `surface-container-low` sections against a `surface` background.
2. **Tonal Transitions:** Utilizing subtle shifts in the Material Design surface tiers.

### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. We use the surface-container tiers to define importance:
- **`surface-container-lowest` (#ffffff):** Reserved for primary content cards and data tables to make them "pop" against the page.
- **`surface` (#f5f7f9):** The standard background for the application canvas.
- **`surface-container-high` (#dfe3e6):** Used for sidebar backgrounds or inactive regions.

### The "Glass & Gradient" Rule
Floating elements (like modals or dropdowns) should utilize **Glassmorphism**. Use a semi-transparent `surface` color with a `backdrop-blur` of 12px to 20px. For main CTAs, apply a subtle linear gradient from `primary` to `primary-container` to provide a "soul" and depth that flat hex codes cannot replicate.

---

## 3. Typography

The system utilizes two distinct typefaces to create an editorial hierarchy.

*   **Display & Headlines (Manrope):** A geometric sans-serif used for large-scale data and section titles. It conveys modern authority.
    *   *Headline-LG (2rem):* For main dashboard headers.
    *   *Display-SM (2.25rem):* For hero KPI numbers.
*   **Body & Labels (Inter):** A highly legible, neutral sans-serif for operational data.
    *   *Body-MD (0.875rem):* Standard data entry and table content.
    *   *Label-MD (0.75rem):* For status chips and metadata.

Hierarchy is conveyed through **weight and scale contrast** rather than color alone. Headers should be Bold/Extra-Bold, while body text remains Regular/Medium.

---

## 4. Elevation & Depth

We eschew traditional drop shadows in favor of **Tonal Layering**.

*   **The Layering Principle:** Depth is achieved by "stacking." Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural lift.
*   **Ambient Shadows:** If a "floating" effect is required for a modal or a primary KPI card, use an extra-diffused shadow: `box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);`.
*   **The "Ghost Border" Fallback:** If accessibility requires a border, it must be a "Ghost Border" using `outline-variant` at 15% opacity. **100% opaque borders are forbidden.**
*   **Backdrop Blur:** Use blurs on secondary navigation or overlay elements to let underlying colors bleed through, ensuring the layout feels integrated.

---

## 5. Components

### Buttons
- **Primary:** Gradient-filled (`primary` to `primary-dim`), `rounded-md`, white text.
- **Secondary:** Transparent with a `primary` label and a ghost-border on hover.
- **Tertiary:** Subtle `surface-container-high` background with no border.

### Minimalist KPI Cards
KPIs must be borderless. Use `title-lg` for the metric and `body-sm` for the label. Separate metrics using vertical white space (32px+) or a very subtle vertical `surface-container-highest` divider that does not touch the top or bottom of the container.

### Modern Tables
Tables follow a strict editorial layout:
- **No Side Borders:** Data should feel like it is floating on the page.
- **Horizontal Dividers Only:** Use `outline-variant` at 10% opacity for row separation.
- **Row Hover:** Use a subtle `surface-container-low` background shift on hover to indicate interactivity.

### Sidebar Navigation
- **Active State:** A solid `primary` vertical pill on the leading edge with a `primary-container` (at 10% opacity) background highlight.
- **Icons:** Use `outline` tokens for inactive states and `primary` for active states.

### Status Chips
- **Success/Warning/Danger:** High-contrast background with a darker tone for text (e.g., `on-error-container` on `error-container`). Shapes must be `rounded-full` for an "app-like" feel.

---

## 6. Do's and Don'ts

### Do:
- **Use White Space as a Tool:** If two elements feel cluttered, add more space rather than adding a line.
- **Layer Your Surfaces:** Always place lighter surfaces on top of darker ones to imply elevation.
- **Align to the Type Baseline:** Ensure your table data and labels feel mathematically grounded.

### Don't:
- **Never use 1px solid black or dark grey borders.** It breaks the "Kinetic Ledger" aesthetic.
- **Avoid Flat Blue CTAs:** Always add a 2% gradient or a subtle inner-glow to make primary actions feel tactile.
- **Don't Over-shadow:** If you can see the shadow clearly, it’s too dark. It should be felt, not seen.
