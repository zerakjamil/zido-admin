---
applyTo: '**'
---
Coding standards, domain knowledge, and preferences that AI should follow.
This is a Next.js project scaffolded with TypeScript and Tailwind CSS. Use best practices for Next.js and React development.
# Next.js Project AI Instructions

## 🔒 File & Code Organization Discipline

- **Single-File Focus:** Always prefer editing or extending existing files over creating new ones. Only create a new file if it is absolutely necessary and after confirming that no suitable file already exists.
- **No Unnecessary Files:** Do not generate new files for models, components, hooks, or utilities if a relevant file already exists. Search the project for existing files before creating anything new.
- **File Reuse:** If a file with the intended purpose exists (even with a similar name), update or extend that file instead of duplicating logic or structure.
- **Avoid Project Bloat:** Unnecessary files and duplication make the project harder to maintain. Keep the codebase lean and organized.
- **Explicit Justification:** If a new file must be created, clearly justify why it is needed and ensure it does not duplicate existing functionality.
---

## 1. 🧠 Project Overview
- **Framework:** Next.js (with TypeScript)
- **Styling:** Tailwind CSS + Ant Design (antd)
- **Backend API:** Laravel Sanctum (https://api.aywar.in/api/v1)
- **API Integration:** Direct backend calls (no Next.js API proxy)
- **Authentication:** Bearer token stored in localStorage
- **Goal:** Build a maintainable, scalable, and secure admin dashboard for Aywar transport management.

### Current Architecture
- **Frontend**: Next.js 15 with App Router
- **Backend**: Laravel API at `https://api.aywar.in/api/v1`
- **API Calls**: Direct from frontend to backend (bypassing Next.js API routes)
- **Data Flow**: Frontend → Laravel API → Database

---

## 2. 📁 Folder & Architecture Structure
- **`/app` or `/pages`:** Route-based pages (use `/app` for Next.js 13+ with App Router)
- **`/components`:** Reusable UI components (forms, tables, modals, etc.)
- **`/lib` or `/utils`:** Utility functions, API clients, helpers
- **`/hooks`:** Custom React hooks (e.g., useAuth, useFetch)
- **`/styles`:** Global and custom CSS (if needed)
- **`/context`:** React context providers (auth, theme, etc.)
- **`/types`:** TypeScript types and interfaces
- **`/public`:** Static assets (images, icons)

---

## 3. 🏗️ Best Practices
- **TypeScript Everywhere:** Type all components, props, and API responses.
- **Component Reusability:** Build atomic, composable components. Avoid duplication.
- **State Management:** Use React context or libraries (Zustand, Redux) for global state only when necessary.
- **API Layer:** Centralize API calls in `/lib/api.ts` or similar. Always handle errors and loading states.
- **Environment Variables:** Store secrets and API URLs in `.env.local`. Never commit secrets.
- **Styling:** Use Tailwind utility classes. Extract common styles as needed.
- **Accessibility:** Use semantic HTML, ARIA labels, and keyboard navigation.
- **Testing:** Write unit and integration tests (Jest, React Testing Library, Cypress for e2e).
- **Linting & Formatting:** Use ESLint and Prettier. Enforce with CI if possible.
- **Code Splitting:** Use dynamic imports for large or rarely-used components.
- **Performance:** Optimize images, use Next.js Image component, and avoid unnecessary re-renders.
- **Security:** Sanitize user input, protect admin routes, and handle tokens securely (e.g., HttpOnly cookies).

---

## 3.1. 🔗 Backend API Integration Guidelines

### Environment Configuration
- **Backend API URL**: Set `NEXT_PUBLIC_API_URL=https://api.aywar.in` in `.env.local`
- **Never include `/api/v1` in the environment variable** - this is added programmatically

### API Base URL Configuration (`/lib/api.ts`)
```typescript
// ✅ CORRECT: Direct backend API calls
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : '/api'
```

### Backend API Endpoints
- **Base URL**: `https://api.aywar.in/api/v1`
- **Students**: `GET /admin/students`
- **Drivers**: `GET /admin/drivers`
- **Authentication**: All requests require `Authorization: Bearer {token}` header

### Common URL Mistakes to Avoid
1. **❌ Double API Path**: Never use `/api/v1/api/v1` (caused by incorrect Next.js rewrites)
2. **❌ Missing Environment Variable**: Always check `NEXT_PUBLIC_API_URL` is set
3. **❌ Wrong API Route Structure**: Avoid unnecessary Next.js API proxy routes when direct backend calls work
4. **❌ Hardcoded URLs**: Never hardcode `https://api.aywar.in` in components

### Testing API Configuration
```bash
# Test backend API directly
curl -H "Authorization: Bearer {token}" https://api.aywar.in/api/v1/admin/students

# Expected URL in browser network tab
https://api.aywar.in/api/v1/admin/students
```

### Debugging API Issues
1. Check browser Network tab for actual URLs being called
2. Verify environment variables are loaded (`console.log(process.env.NEXT_PUBLIC_API_URL)`)
3. Check for double paths like `/api/v1/api/v1`
4. Ensure authorization token is being sent correctly

---

## 4. 🧩 UI/UX Guidelines
- **Consistent Layout:** Use a layout component for navigation, header, and footer.
- **Responsive Design:** Mobile-friendly and desktop-optimized.
- **Feedback:** Show loading, success, and error states for all async actions.
- **Forms:** Validate on both client and server. Show clear error messages.
- **Dark Mode:** Optional, but recommended for admin panels.

---

## 4.1. 🎨 Design System & UI Library
- **Ant Design (antd):** Use Ant Design as the primary UI component library. Leverage its built-in components for forms, tables, modals, notifications, and more.
- **Customization:** Override Ant Design theme variables to match Aywar's branding and color palette.
- **Consistency:** Ensure UI elements are consistent with industry-standard admin dashboards (e.g., clear navigation, data tables, filter/search, user management).
- **Responsiveness:** Use Ant Design's grid and responsive utilities for layouts that work seamlessly across devices.
- **Accessibility:** Use Ant Design's accessibility features and enhance where needed.
- **Best Practices:** Follow Ant Design's recommended usage patterns and avoid custom implementations unless necessary.
- **Industry Standards:** Reference leading admin dashboards (e.g., Vercel, Stripe, Shopify) for layout, spacing, and interaction patterns.

---

## 5. 🚀 Deployment
- **Environment Config:** Use environment variables for all secrets and endpoints.
- **Build:** Use `next build` for production. Test locally before deploying.
- **Hosting:** Vercel, Netlify, or your preferred platform.

---

## 6. 🛠️ Troubleshooting Common Issues

### API URL Configuration Problems

#### Problem: 404 Not Found on API calls
**Symptoms**: Console shows `GET /api/admin/students 404`
**Cause**: Next.js API routes not found or misconfigured
**Solution**: Use direct backend API calls instead of Next.js proxy

#### Problem: Double API path (`/api/v1/api/v1`)
**Symptoms**: Backend error "route api/v1/api/v1/admin/students could not be found"
**Cause**: Next.js rewrite adding `/api/v1` + API route also adding `/api/v1`
**Solution**: Configure API base URL correctly:
```typescript
// In /lib/api.ts
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1`
  : '/api'
```

#### Problem: CORS errors
**Symptoms**: Browser blocks API requests due to CORS policy
**Cause**: Frontend and backend on different domains
**Solution**: Ensure backend has proper CORS configuration for frontend domain

#### Problem: 401 Unauthorized
**Symptoms**: API returns authentication errors
**Cause**: Missing or invalid authorization token
**Solution**: Check localStorage for `auth_token` and verify it's being sent in headers

### Search/Filter Not Working
**Symptoms**: Search returns all results instead of filtered ones
**Common Causes**:
1. Backend API not processing search parameters
2. Frontend not sending search parameters correctly
3. Caching issues with React Query
**Solution**: Add client-side fallback filtering and verify API parameters

---

## 7. 🛡️ Preventing Build & Type Errors

To minimize build failures and runtime errors, follow these strict guidelines when making changes:

### 7.1. Type-First Development
- **Update Types First**: Before modifying any component or logic, first update the relevant TypeScript interfaces in `/src/types/index.ts`. Ensure all new or changed properties are correctly typed.
- **Check for `any`**: Aggressively avoid the `any` type. If an external library has poor typing, create a local type definition. Do not use `@ts-ignore` or `as any` to suppress errors; fix the underlying type issue.

### 7.2. Synchronize Mock Data
- **Mocks Must Match Types**: Immediately after changing a type in `/src/types/index.ts`, you **must** update all related mock data generation functions (e.g., in `/src/lib/mock-route-service.ts`).
- **Build with Mocks**: Mock data is used in development and testing. If it doesn't match the types, the build will fail. This is a common source of errors. Ensure all properties of the mock objects conform to the latest type definitions.

### 7.3. Holistic Code Changes
- **Consider the Full Impact**: When you change a component (e.g., `RouteForm`), consider all its dependencies:
    1.  **Types (`/types/index.ts`)**: Do the interfaces need updating?
    2.  **API Layer (`/lib/api.ts`)**: Does the API call need to send new data?
    3.  **Mock Services (`/lib/mock-route-service.ts`)**: Does the mock data need to be updated?
    4.  **Parent Components/Pages**: Do the props being passed in need to change?
- **Don't Leave Loose Ends**: A change is not complete until all related parts of the codebase are updated and consistent.

### 7.4. Validate Before Finishing
- **Self-Correction**: After making changes, mentally run a type check and lint across the modified files.
- **Review Your Changes**: Before concluding, review the changes to ensure they are consistent, type-safe, and do not introduce obvious errors. For example, if you add an optional property `name?: string` to a type, ensure that any code using that property checks for its existence (`user.name?.toLowerCase()`).

---

*Follow these instructions to ensure your Next.js project is robust, maintainable, and a joy to work with.*
