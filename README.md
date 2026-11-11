# ATELIER — Salon Experience & Operations

Premium salon platform built with Next.js 16, React 19, TypeScript, React Bits, GSAP, and Supabase.

## What has been implemented

- Responsive luxury salon website: editorial home, image-led services, manifesto, team, space, booking CTA, footer.
- React Bits official `AnimatedContent` and `GlareHover`, plus editorial masked-text motion and interactive light on service cards.
- Public booking: service → professional → available time → contact details → database confirmation.
- Automatic availability from staff shifts, staff-service assignments, existing bookings, and staff time-off.
- Transactional PostgreSQL booking creation with advisory lock and exclusion constraint to prevent concurrent double bookings.
- Supabase Auth sign-in for management; owner/manager authorization is enforced **server-side** before accessing client data.
- Management dashboard: next appointments, today's appointments, completed services, illustrative revenue from completed appointments, status changes.
- Operations page: add/deactivate services, add professionals, assign services, configure weekly shifts.
- Basic privacy placeholder; not yet suitable as a final LGPD policy.

## Visual identity and Taste Skill

Concept identity **ATELIER** — an original demonstrative name, not a registered salon. This is not a real salon's portfolio or verified inventory.

Taste Skill `design-taste-frontend`: https://github.com/Leonxlnx/taste-skill

Study: photograph-first place website, editorial serif headlines, single visual language, real photography, large whitespace, quiet motion, and legible high-contrast forms. The full automated Taste Skill checker/gate has **not yet been run** for this repository. React Bits source components retain upstream attribution in `src/components/react-bits`.

Photography is remote illustrative Unsplash content; before commercial delivery obtain licenses/attribution where applicable, validate each image URL and replace with actual licensed salon imagery.

## Run

Prerequisites: Node.js 22+ and an isolated Supabase project.

```bash
npm install
cp .env.example .env.local
npm run dev
npm run build
```

Define `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `NEXT_PUBLIC_SITE_URL` **only through environment settings**. Never commit actual keys. The server-side role key is forbidden in browser code.

Run `supabase/schema.sql` **against a dedicated project only**, then:

1. Create an Auth user in the Supabase dashboard.
2. Insert a row in `public.staff` with `auth_user_id` equal to the new user's UUID, `role='owner'`, `active=true`. Do not allow arbitrary self-registration into owner roles.
3. Sign in at `/admin`.
4. Configure real services, professionals and their assigned services at `/admin/configuracao`.
5. Configure hours for each professional and verify available appointments from `/agendar`.
6. Confirm bookings are stored in `clients` and `bookings`, and that the dashboard updates.
7. Change the default salon timezone in `salon_settings` to the real business timezone. The public site's date and admin display currently assume `America/Boa_Vista`; update them together when changing the timezone.

`/api/catalog` returns illustrative content when no Supabase is configured. **No booking can be completed in demo mode**; the application never claims that a simulated reservation was confirmed.

## Production work still required

This is an advanced first implementation, **not a finished R$20,000-ready product**. Close all of the following before paid launch:

- Configure and test dedicated database and production authentication.
- Bot protection and per-IP/account rate limits for booking endpoints; CAPTCHA or equivalent abuse checks.
- SMS/WhatsApp/email confirmations with consent, queueing, idempotency, retries, delivery logs and provider configuration.
- Customer-facing secure reschedule/cancellation, booking policies and no-show rules.
- Payment integration (deposits, reconciliation, receipts, webhook signature verification) if included in client's scope.
- Real CRM/consent management, retention/deletion policy and lawful basis under LGPD.
- Working holidays, service-specific buffers, multiple resources/chairs, overlapping shifts and exceptional opening days.
- Financial cash reconciliation, inventory, commission computation, staff-specific access, reports and export.
- Operational telemetry/audit log, backup/recovery, test data, end-to-end Playwright and accessibility audit.
- Real photo assets, SEO once the demonstration noindex is removed, contact details and legal pages.
- Run Taste Skill browser gate at desktop/tablet/mobile widths, and resolve every failure.

## API security notes

Public `POST /api/bookings` is database-backed and validated server-side. SQL functions are only executable by `service_role`; RLS is enabled for all tables. No public endpoint returns personal booking data. Do not enable traffic until anti-abuse protections are in place.

Client-side Auth stores browser sessions by Supabase default; production deployment should evaluate HttpOnly session cookies for stricter security. Server endpoints use `auth.getUser(access_token)` and check the associated staff role in the database. Roles are not derived from user-editable metadata.

## Deployment

A GitHub Actions CI checks TypeScript and Next build on PRs. Create a Vercel project linked to this repository after tests are green, and use preview deployments before promoting to production.
