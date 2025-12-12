# Migration Plan: Trade-Talkies (Next.js Monolith)

## 1. Folder Structure (App Router)

```
trade-talkies-next/
├── app/
│   ├── (auth)/                 # Authentication Routes
│   │   ├── sign-in/
│   │   └── sign-up/
│   ├── (dashboard)/            # Protected App Routes
│   │   ├── layout.tsx          # Dashboard Layout (Sidebar, etc.)
│   │   ├── page.tsx            # Home / Room List
│   │   ├── onboarding/         # Onboarding Flow
│   │   └── rooms/
│   │       └── [roomId]/
│   │           └── page.tsx    # Chat Interface
│   ├── api/                    # API Routes (Backend)
│   │   ├── users/
│   │   ├── rooms/
│   │   └── messages/
│   ├── layout.tsx              # Root Layout
│   └── globals.css
├── components/
│   ├── ui/                     # Shadcn UI Components
│   ├── features/               # Feature-specific components (Chat, Auth)
│   └── providers/              # Context Providers (Auth, Socket, Query)
├── lib/
│   ├── db.ts                   # Prisma Client Instance
│   ├── firebase.ts             # Firebase Client Config
│   ├── firebase-admin.ts       # Firebase Admin Config
│   ├── socket.ts               # Socket Client Logic
│   └── utils.ts                # Helpers
├── prisma/
│   └── schema.prisma           # Database Schema
├── public/                     # Static Assets
├── server.ts                   # Custom Server (Next.js + Socket.io)
├── middleware.ts               # Auth Middleware
└── ...config files
```

## 2. Code Migration Strategy

### A. Database (Mongoose -> Prisma)
- **Action**: Create `prisma/schema.prisma`.
- **Mapping**:
  - `_id` (ObjectId) -> `id` (String @id @default(auto()) @map("_id") @db.ObjectId)
  - `User` model maps directly.
  - `Room` model maps directly.
  - `Message` model maps directly.

### B. Backend (Express -> Next.js API)
- **Action**: Move logic from `backend/src/controllers` to `app/api/[route]/route.ts`.
- **Middleware**: Replace Express middleware with a reusable `verifyAuth` helper function called at the start of each API route, or use Next.js Middleware for route protection.

### C. Real-time (Socket.io)
- **Action**: Create `server.ts` using `http`, `socket.io`, and `next`.
- **Logic**:
  - Initialize Next.js app.
  - Create HTTP server.
  - Attach Socket.io to HTTP server.
  - Handle Next.js requests via `handle(req, res)`.
  - Copy socket logic from `backend/src/socket/index.js` to the `io.on('connection')` block in `server.ts`.

### D. Frontend (Vite -> Next.js)
- **Routing**:
  - `src/routes/__root.tsx` -> `app/layout.tsx`
  - `src/routes/(auth)/sign-in.tsx` -> `app/(auth)/sign-in/page.tsx`
  - `src/routes/trade-talkies.tsx` -> `app/(dashboard)/rooms/[roomId]/page.tsx`
- **Data Fetching**:
  - Replace `useQuery` with direct Prisma calls in Server Components where possible.
  - Keep `useQuery` for client-side dynamic data (like real-time chat history updates).
- **Assets**: Move `src/assets` to `components/icons` or `public/`.

## 3. Authentication
- **Middleware**: `middleware.ts` will check for a session cookie.
- **Login**: Client logs in with Firebase -> sends ID token to `/api/auth/login` -> Server verifies and sets a secure HTTP-only cookie.
- **Protection**: Middleware redirects unauthenticated users to `/sign-in`.

## 4. Deployment
- **Docker**: Create a `Dockerfile` that builds the Next.js app and runs `server.ts`.
- **Env**: Ensure all Firebase and Database environment variables are set.
