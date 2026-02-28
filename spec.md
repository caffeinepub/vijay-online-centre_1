# Specification

## Summary
**Goal:** Fix four bugs in the Vijay Online Centre admin panel: the Refresh button not fetching fresh data, the active submission count staying at "00", the Set Price action returning "Unauthorized", and ensuring both admin login credentials continue to work.

**Planned changes:**
- Rewrite the Refresh button handler in AdminPage.tsx to forcefully invalidate and re-fetch all application data from the backend, bypassing any cache, using React Query with staleTime=0, compatible with mobile browsers (Android/Chrome/OnePlus)
- Fix the active submission count so it is computed from the freshly fetched application list and updates immediately after Refresh completes instead of showing "00"
- Fix the Set Price mutation in useQueries.ts and AdminPage.tsx so the admin actor is properly authenticated before calling setFee, eliminating the "Unauthorized" error and making the updated fee visible to customers on DashboardPage immediately
- Preserve both hardcoded admin credentials (vijay/123 and vijay/2026) in useAdminAuth.ts with the 24-hour localStorage session unchanged

**User-visible outcome:** The admin can click Refresh on any mobile browser and see the latest application list with the correct submission count, set a price without errors that instantly reflects for customers, and log in with either vijay@123 or vijay@2026 credentials.
