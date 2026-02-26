# Next.js Migration Guide — ThanaCity

## 1. Route Mapping (react-router-dom → app/ directory)

| Current Route | Current File | Next.js Path |
|---|---|---|
| `/` | Redirects to `/dashboard` | `app/page.js` → redirect |
| `/login` | `src/pages/Login.tsx` | `app/login/page.js` |
| `/dashboard` | `src/pages/Dashboard.tsx` | `app/dashboard/page.js` |
| `/insights` | `src/pages/Insights.tsx` | `app/insights/page.js` |
| `/watchlist` | `src/pages/Watchlist.tsx` | `app/watchlist/page.js` |
| `*` (404) | `src/pages/NotFound.tsx` | `app/not-found.js` |

## 2. Target Folder Structure

```
├── app/
│   ├── layout.js          ← Root layout (replaces App.tsx)
│   ├── page.js            ← Redirect to /dashboard
│   ├── not-found.js       ← 404 page
│   ├── globals.css        ← Copy from src/index.css
│   ├── login/
│   │   └── page.js
│   ├── dashboard/
│   │   └── page.js
│   ├── insights/
│   │   └── page.js
│   └── watchlist/
│       └── page.js
├── components/
│   ├── Layout.jsx
│   ├── KPIStrip.jsx
│   ├── DashboardCharts.jsx
│   ├── SessionsTable.jsx
│   ├── FlowMap.jsx
│   ├── AlertsPanel.jsx
│   ├── LiveEventStream.jsx
│   ├── InvestigationDrawer.jsx
│   ├── TimeRangeSelector.jsx
│   └── ui/               ← Copy all shadcn components, rename .tsx → .jsx
├── hooks/
│   ├── useEvents.js
│   ├── useInsights.js
│   ├── useSessions.js
│   ├── useLiveMode.js
│   ├── use-mobile.js
│   └── use-toast.js
├── lib/
│   ├── analytics.js
│   ├── mockData.js
│   ├── sessionize.js
│   ├── storage.js
│   └── utils.js
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── jsconfig.json
├── tailwind.config.js
├── postcss.config.js
└── package.json
```

## 3. Key Replacements

### Routing
```js
// BEFORE (react-router-dom)
import { Link, useNavigate, useLocation } from "react-router-dom";
const navigate = useNavigate();
navigate("/dashboard");
<Link to="/dashboard">Dashboard</Link>

// AFTER (next/navigation + next/link)
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
const router = useRouter();
router.push("/dashboard");
<Link href="/dashboard">Dashboard</Link>
```

### Protected Routes
```js
// BEFORE: ProtectedRoute wrapper component in App.tsx
// AFTER: Use middleware.js or check auth in layout/page:

// middleware.js (root)
import { NextResponse } from "next/server";
export function middleware(request) {
  // Check auth cookie/token
  // Redirect to /login if not authenticated
}
export const config = { matcher: ["/dashboard/:path*", "/insights/:path*", "/watchlist/:path*"] };
```

### "use client" Directive
Add `"use client"` to the top of these files (they use hooks/browser APIs):
- All page components (Dashboard, Insights, Watchlist, Login)
- Layout.jsx (uses useState, usePathname)
- All interactive components (KPIStrip, SessionsTable, FlowMap, etc.)
- All hooks files

### Environment Variables
```
// BEFORE: import.meta.env.VITE_API_URL
// AFTER:  process.env.NEXT_PUBLIC_API_URL
```

## 4. jsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

## 5. tailwind.config.js
```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
    "./lib/**/*.{js,jsx}",
    "./hooks/**/*.{js,jsx}",
  ],
  // ... copy theme from current tailwind.config.ts (remove `satisfies Config`)
  plugins: [require("tailwindcss-animate")],
};
```

## 6. app/layout.js (Root Layout)
```js
"use client";
import "./globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

const queryClient = new QueryClient();

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
```

## 7. Dependencies

### Keep (install in Next.js project)
```
@tanstack/react-query, recharts, framer-motion, date-fns,
lucide-react, tailwind-merge, clsx, class-variance-authority,
tailwindcss-animate, sonner, vaul, cmdk,
@radix-ui/* (all current radix packages),
@hookform/resolvers, react-hook-form, zod
```

### Remove
```
react-router-dom, vite, @vitejs/plugin-react-swc, lovable-tagger
```

### Add
```
next, eslint-config-next
```

## 8. Run Instructions

```bash
# 1. Create Next.js project
npx create-next-app@latest thanacity --js --app --tailwind --eslint --no-src-dir

# 2. Install dependencies
cd thanacity
npm install @tanstack/react-query recharts framer-motion date-fns lucide-react tailwind-merge clsx class-variance-authority tailwindcss-animate sonner vaul cmdk @radix-ui/react-dialog @radix-ui/react-select @radix-ui/react-tabs @radix-ui/react-tooltip @radix-ui/react-switch @radix-ui/react-collapsible @radix-ui/react-popover @radix-ui/react-slot @radix-ui/react-label @radix-ui/react-accordion @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-checkbox @radix-ui/react-dropdown-menu @radix-ui/react-toast @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-avatar @radix-ui/react-progress @radix-ui/react-slider @radix-ui/react-radio-group react-day-picker react-resizable-panels embla-carousel-react input-otp @hookform/resolvers react-hook-form zod

# 3. Copy files per the folder structure above
# 4. Rename .tsx → .jsx, .ts → .js
# 5. Replace routing imports (see section 3)
# 6. Remove all remaining TypeScript syntax (`: any` etc.)
# 7. Run
npm run dev
```

## 9. Notes
- The current code already has TypeScript stripped to minimal `any` annotations — just remove those when converting to .js
- shadcn/ui components need their .tsx → .jsx rename and TS removal too
- `localStorage` auth works as-is since all pages are client components
- For production, replace localStorage auth with Next.js middleware + cookies
