# Specification

## Summary
**Goal:** Fix the OTP login flow so that mobile number `9422018674` is correctly redirected to the admin panel after OTP verification, and enforce access control on the `/admin` route.

**Planned changes:**
- After successful OTP verification, check if the logged-in mobile number is `9422018674`; if so, redirect to `/admin`, otherwise redirect to `/dashboard`
- Protect the `/admin` route so only the user authenticated as `9422018674` can access it; non-admin authenticated users are redirected to `/dashboard`, and unauthenticated users are redirected to `/login`
- In the backend, auto-create or pre-seed the admin account for mobile `9422018674` on first OTP request so admin login always succeeds without a separate registration step

**User-visible outcome:** The admin user (`9422018674`) can log in via OTP and land directly on the admin panel, while all other users land on their dashboard. Attempting to access `/admin` as a non-admin redirects appropriately.
