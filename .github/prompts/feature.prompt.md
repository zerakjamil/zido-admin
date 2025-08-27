---
mode: agent
---
You are a senior frontend developer working on a production-grade Next.js + TypeScript + TailwindCSS application.

I want you to implement a full feature using mock data **with clean architecture** that allows easy replacement with a real API later.

### Please generate the following:

1. A reusable and styled component (React functional component)
2. A custom data fetching hook (`useXYZ`)
3. A service file (with mock API logic — `Promise.resolve(...)`)
4. A separate file for mock data
5. All TypeScript types and interfaces
6. Bonus: use loading, error, and empty state handling
7. All code should be split into appropriate folders like:
   `/components`, `/hooks`, `/services`, `/mock`

---

🔹 FEATURE NAME:  
[ e.g. User Profile Card ]

🔹 FEATURE PURPOSE / BEHAVIOR:  
[ e.g. Show a logged-in user's profile: name, avatar, college, joined date. ]

🔹 MOCK API RESPONSE:
```json
{
  "name": "Zerak",
  "avatar_url": "https://cdn.aywar.in/u/zerak.png",
  "college": "Salahaddin University",
  "joined_at": "2023-02-20"
}