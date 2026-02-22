# TechFlow

TechFlow is a modern Point of Sale (POS) and Inventory Management System built with cutting-edge web technologies. It is designed to be fast, scalable, and easy to maintain.

## 🚀 Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Database ORM:** [Drizzle ORM](https://orm.drizzle.team)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com)
- **UI Components:** [Radix UI](https://www.radix-ui.com)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs)
- **Validation:** [Zod](https://zod.dev)
- **Authentication:** [Better Auth](https://better-auth.com)

## 📂 Project Structure

The project has been carefully modularized for better maintainability and scalability:

```text
techflow/
├── public/                 # Static assets (images, icons)
├── scripts/                # Utility scripts (e.g., clean-db.ts)
├── drizzle/                # Drizzle database migrations and snapshots
└── src/
    ├── app/                # Next.js App Router
    │   ├── (auth)/         # Authentication pages (Sign In, Sign Up)
    │   ├── (main)/         # Main application routes (Dashboard, POS, Inventory, etc.)
    │   ├── actions/        # Next.js Server Actions for handling mutations
    │   └── api/            # Next.js API Routes (e.g., for auth)
    │
    ├── components/         # Reusable React components
    │   ├── ui/             # Generic UI components (Buttons, Inputs, etc.)
    │   ├── layout/         # Layout components (Sidebar, Navbar)
    │   └── ...             # Feature-specific components (pos, inventory, etc.)
    │
    ├── db/                 # Database connection and Object-Relational Mapping (ORM)
    │   └── schema/         # Modularized database schemas (users, products, sales, etc.)
    │
    ├── hooks/              # Custom React hooks (e.g., useDebounce, etc.)
    │
    ├── lib/                # Shared utilities and configurations
    │   ├── auth/           # Authentication configuration
    │   └── validators/     # Zod schema definitions for form and API validation
    │
    ├── services/           # Business logic layer (interacts directly with the db)
    │   ├── pos-service.ts
    │   ├── inventory-service.ts
    │   └── ...
    │
    └── store/              # Zustand global state management
```

## 🛠️ Architecture Principles

- **Separation of Concerns:** Features are divided into UI (components), Server Actions (`app/actions/`), and Business Logic (`services/`).
- **Server Actions:** All mutations are handled strictly via Next.js Server Actions to minimize client-side javascript and keep the API surface secure.
- **Service Layer:** Business logic that communicates with the `db/` is isolated in the `services/` folder ensuring code reusability.
- **Type-Safe:** The entire stack ensures type-safety starting from database schemas in Drizzle, to request validation in Zod, down to frontend forms.

## 🏃 Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Ensure you have a `.env` file configured with the required Database and Authentication variables.

3. **Run database migrations (if required):**

   ```bash
   npx drizzle-kit push
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
