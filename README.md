# Е-Учење — Платформа за е-учење

Платформа за е-учење за студенти, наставници и администратори. Сите текстови се на македонски.

## Функции

- **Почетна страница** — преглед и линкови за најава/регистрација
- **Студенти** — регистрација со избор на година (1–4), контролна табла, предмети, домашни, поставки
- **Наставници** — преглед на предмети, додавање повратни информации на домашни
- **Администратор** — креирање на наставници, креирање предмети, доделување на одделенија

## Технологии

- Next.js 14 (App Router), TypeScript, Tailwind CSS
- Prisma + PostgreSQL (production-ready)
- NextAuth.js за најава

## Инсталација

```bash
npm install
cp .env.example .env
# внеси DATABASE_URL за PostgreSQL во .env
npm run db:push
npm run db:seed
npm run dev
```

Отворете [http://localhost:3000](http://localhost:3000).

## Тест корисници (по seed)

| Улога   | Е-пошта              | Лозинка   |
|--------|----------------------|-----------|
| Админ  | admin@elearning.mk   | SEED_ADMIN_PASSWORD (или admin123 ако не е поставено) |
| Наставник | teacher@elearning.mk | teacher123 |
| Студент | student@elearning.mk | student123 |

## Структура

- `app/` — страници и API рути
- `components/` — компоненти (sidebar, форми)
- `lib/` — база, автентификација, утилити
- `prisma/` — шема и seed

## Македонски текст

Сите кориснички интерфејси (најава, регистрација, контролна табла, предмети, домашни, поставки, админ) се на македонски. При регистрација студентите избираат **година** од 1 до 4.


## Vercel Deployment

1. Поврзи го GitHub репото со Vercel.
2. Во Vercel -> Settings -> Environment Variables внеси:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `NEXTAUTH_SECRET` (долг случаен string)
   - `NEXTAUTH_URL` (пример: `https://your-app-name.vercel.app`)
   - `SEED_ADMIN_EMAIL` (опционално, default `admin@elearning.mk`)
   - `SEED_ADMIN_PASSWORD` (препорачано, најмалку 8 карактери)
3. Build Command постави на: `npm run vercel-build`
4. Deploy.
5. По прв deploy, seed-ирај ја продукциската база од локално (со production env vars):

```bash
DATABASE_URL="<your-production-db-url>" \
NEXTAUTH_SECRET="<your-secret>" \
NEXTAUTH_URL="https://your-app-name.vercel.app" \
SEED_ADMIN_EMAIL="admin@elearning.mk" \
SEED_ADMIN_PASSWORD="StrongAdminPassword123!" \
npm run db:seed
```

> Забелешка: за uploads во production користи cloud storage (Vercel Blob / S3 / Cloudinary), бидејќи локален filesystem на Vercel не е перзистентен.
