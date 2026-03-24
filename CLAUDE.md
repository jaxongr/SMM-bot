# CLAUDE.md — Universal Project Standard

> Barcha loyihalarda shu qoidalarga qat'iy rioya qilinsin.
> Har qanday yangi fayl, modul, komponent shu standartda yozilsin.

---

## 🏗️ TECH STACK

### Backend
- **Framework**: NestJS (modular architecture)
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Cache**: Redis
- **Auth**: JWT (access + refresh token), RBAC
- **Docs**: Swagger (OpenAPI 3.0)
- **Logs**: Winston + Sentry
- **Queue**: BullMQ (Redis-based)
- **Real-time**: Socket.io (polling TAQIQLANGAN)

### Admin / Web Frontend
- **Framework**: Vite + React + TypeScript
- **UI**: Ant Design + Styled-components
- **State**: React Query (server) + Zustand (client)
- **HTTP**: Axios (interceptor bilan)
- **Router**: React Router v6
- **Forms**: React Hook Form + Zod

### Mobile
- **Framework**: Flutter (Riverpod, GoRouter)
- **State**: Riverpod — YAGONA state tool
- **Local DB**: Hive (offline-first)
- **HTTP**: Dio + Retrofit
- **Design**: AppTheme.* — hardcoded rang TAQIQLANGAN

---

## 📁 FOLDER STRUCTURE

### Backend
```
src/
  modules/
    {feature}/
      {feature}.controller.ts
      {feature}.service.ts
      {feature}.module.ts
      {feature}.repository.ts
      dto/
      entities/
      guards/
  common/
    decorators/
    filters/
    guards/
    interceptors/
    pipes/
  config/
  prisma/
```

### Frontend
```
src/
  features/
    {feature}/
      components/
      hooks/
      api/
      types/
      index.ts      ← barcha eksport shu yerdan
  shared/
    components/
    hooks/
    utils/
    types/
  app/
    router/
    providers/
    store/
```

### Mobile
```
lib/
  screens/
  widgets/
  providers/
  services/
  repositories/
  models/
  config/
    theme.dart
  utils/
```

---

## 🔌 API CONVENTIONS

### URL format
```
/api/v1/{resource}          GET, POST
/api/v1/{resource}/:id      GET, PATCH, DELETE
```

### Response format (HAMMA ENDPOINT bir xil)
```typescript
// Success
{ data: T, meta?: PaginationMeta }

// Error
{ error: { code: string, message: string, details?: any } }

// Pagination
{ data: T[], meta: { total, page, limit, totalPages } }
```

### HTTP Status kodlari
- `200` — OK
- `201` — Created
- `400` — Validation error
- `401` — Unauthorized
- `403` — Forbidden
- `404` — Not found
- `409` — Conflict
- `500` — Server error

---

## 🔐 SECURITY

- JWT: access (15min) + refresh (7d) — HttpOnly cookie
- RBAC: `@Roles()` decorator, `RolesGuard`
- Rate limiting: `@Throttle()` — barcha public endpoint
- Input validation: `class-validator` + Zod (frontend)
- `process.env` to'g'ridan TAQIQLANGAN — faqat `ConfigService`
- `.env` hech qachon git'ga tushmaydi, `.env.example` doim yangilanadi
- SQL injection: Prisma orqali to'liq himoyalangan
- XSS: `helmet` middleware

---

## ⚡ REAL-TIME

- WebSocket: Socket.io — faqat real-time kerak bo'lganda
- Polling: **QATTIY TAQIQLANGAN**
- Events naming: `snake_case` — `order:updated`, `driver:location`
- Auth: JWT handshake orqali

---

## 💾 DATABASE

- Indexing: `@Index()` — filter/sort qilinadigan barcha ustun
- Soft delete: `deletedAt DateTime?` — haqiqiy delete KAMDAN-KAM
- Migrations: `prisma migrate dev` — manual SQL TAQIQLANGAN
- Connection pooling: Prisma + PgBouncer (production)
- Transaction: bir necha jadval bir vaqtda o'zgarganda

---

## 🗂️ GIT STANDARD

### Branch nomlash
```
feat/{ticket}-{short-description}
fix/{ticket}-{short-description}
hotfix/{ticket}-{short-description}
chore/{ticket}-{short-description}
```

### Commit format (Conventional Commits)
```
feat(orders): add real-time tracking
fix(auth): refresh token rotation bug
chore(deps): update prisma to 5.x
docs(api): add swagger for payments
```

### Qoidalar
- `main` / `master` — to'g'ridan push **TAQIQLANGAN**
- PR: kamida 1 review, squash merge
- Feature branch `main` dan branch oladi
- Har bir PR: tests yashil, lint yashil

---

## 🧪 TESTING

- **Coverage**: minimum **70%** (Jest)
- **Unit**: service va utility funksiyalar
- **Integration**: controller → service → DB (test DB)
- **E2E**: asosiy user flow'lar
- Mock: faqat external service (email, SMS, payment)
- DB: har test o'z transaction'ida, rollback bilan

---

## ✍️ CODE STYLE

### Umumiy qoidalar
- Funksiya: **30 qatordan ko'p bo'lmasin** — ajrat, yoki xizmat chiqar
- Magic number **TAQIQLANGAN**: `const MAX_RETRY = 3`
- `any` tipi TypeScript'da **TAQIQLANGAN** — `unknown` yoki aniq tip
- `TODO` qoldirma — ya hal qil, ya GitHub issue och
- `console.log` production kodda **TAQIQLANGAN** — faqat `Logger`
- Import: absolyut path (`@/features/...`), relative (`../../../`) TAQIQLANGAN

### Naming
```typescript
// Variables, functions: camelCase
const orderCount = 0;
function getActiveOrders() {}

// Classes, interfaces, types: PascalCase
class OrderService {}
interface CreateOrderDto {}
type OrderStatus = 'PENDING' | 'DONE';

// Constants: SCREAMING_SNAKE_CASE
const MAX_UPLOAD_SIZE = 5 * 1024 * 1024;

// Files: kebab-case
order-service.ts
create-order.dto.ts
```

### Flutter naming
```dart
// Files: snake_case
order_card.dart
home_screen.dart

// Classes: PascalCase
class OrderCard extends StatelessWidget {}

// Variables: camelCase
final orderCount = 0;
```

---

## 🎨 FRONTEND EXCELLENCE

### Performance
- Code splitting: `React.lazy()` + `Suspense` — har bir route
- Memoization: `useMemo`, `useCallback` — render bottleneck'larda
- Image: lazy loading, WebP format, `next/image` yoki analog
- Bundle: tree shaking, dynamic import, analyze script

### UX Standart
- Loading state: **HAMMA** async operatsiyada
- Error boundary: **HAMMA** page/feature'da
- Empty state: icon + matn + action (agar bo'lsa)
- Toast notification: muvaffaqiyat va xato uchun
- Form: real-time validation, submit paytida disable

### Accessibility (WCAG AA)
- Barcha `<img>`: `alt` majburiy
- Forma: `<label>` + `htmlFor` majburiy
- Rang: 4.5:1 kontrast ratio minimum
- Keyboard: Tab navigatsiya ishlashi kerak
- ARIA: semantic HTML yetarli bo'lmagan joylarda

---

## 📦 FLUTTER STATE STANDARD

```dart
// BARCHA provider AsyncValue ishlatsin
final ordersProvider = FutureProvider.autoDispose<List<Order>>((ref) async {
  return ref.read(orderRepositoryProvider).getOrders();
});

// UI da
ref.watch(ordersProvider).when(
  data: (orders) => OrderList(orders: orders),
  loading: () => const AppLoader(),
  error: (e, _) => AppError(onRetry: () => ref.invalidate(ordersProvider)),
);
```

### Provider nomlash standarti
- `{resource}Provider` → ma'lumot
- `{resource}NotifierProvider` → o'zgaruvchan state
- `{resource}RepositoryProvider` → repository instance

---

## 🌍 ENVIRONMENT

```env
# .env.example — DOIM yangilansin
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
JWT_REFRESH_SECRET=
SENTRY_DSN=
```

- `.env` — local
- `.env.staging` — staging
- `.env.production` — production (CI/CD secrets)

---

## 🚀 CI/CD

- **Lint** → **Tests** → **Build** → **Deploy** (tartib buzilmasin)
- Failed test: deploy **bloklanadi**
- Staging: `develop` branch'ga push'da avtomatik
- Production: `main` tag release'da avtomatik
- Rollback: 1 buyruq bilan

---

## 📊 MONITORING

- **Errors**: Sentry (backend + frontend)
- **Logs**: Winston → JSON format → log aggregator
- **Health**: `/api/health` endpoint — DB, Redis, Queue
- **Metrics**: response time, error rate, queue length
- **Alerts**: error rate > 1% → notification

---

## 🌐 SCALABILITY (50K+ users)

- Stateless design: session TAQIQLANGAN, JWT + Redis
- Caching: multi-level (Redis → DB)
- DB: connection pooling, read replica (heavy query'lar uchun)
- Queue: CPU-intensive vazifalar BullMQ'ga
- Microservice-ready: modul chegaralari aniq, DI orqali bog'liq

---

## 📝 DOCUMENTATION

- **Swagger**: barcha endpoint documented
- **README**: har modul uchun (`src/modules/{feature}/README.md`)
- **ADR**: muhim arxitektura qarori (docs/adr/)
- **CHANGELOG**: har release uchun

---

## ❌ GLOBAL TAQIQLAR

| Nima | Nima o'rniga |
|------|-------------|
| `any` TypeScript | `unknown` yoki aniq tip |
| `console.log` | `Logger` service |
| Hardcoded secret | `ConfigService` |
| `process.env` to'g'ridan | `ConfigService` |
| Polling | WebSocket |
| Raw SQL | Prisma |
| Magic numbers | Named constant |
| `TODO` qoldirish | Issue och |
| `main`'ga to'g'ri push | PR orqali |
| Hardcoded rang Flutter | `AppTheme.*` |
| Mock data prod'da | Real API |

---

> **Eslatma**: Ushbu qoidalar barcha loyihalarga tegishli.
> Loyiha-specific qoidalar `docs/PROJECT.md` da yozilsin.

# AUTONOMY — MUHIM
- Hech qachon "Do you want to proceed?" deb so'rама — TO'G'RIDAN BAJАР
- Bash brace expansion ishlatma — har bir mkdir/command alohida yoz
- Tasdiqlash so'raмa, o'zing qaror qil va bажар
- Faqat hal qilib bo'lmaydigan bloker muammoda to'xta

# BASH COMMANDS
- mkdir brace expansion TAQIQLANGAN: mkdir a && mkdir b — alohida yoz
- Har bir command ishonchli, oddiy sintaksisda bo'lsin
- PowerShell uchun: New-Item -ItemType Directory -Force