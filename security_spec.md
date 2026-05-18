# Security Specification for Sérénité AI

## 1. Data Invariants
- A user can only access their own profile, gratitudes, step progress, and chat messages.
- `points` can only be incremented, not decremented by the user (theoretically, but rules will just allow the user to update their own points for now since it's a client-side friendly app, or ideally we'd validate the increment).
- `isPremium` can only be set to `true` by a server-side process (webhook), not by the user.
- Chat messages can only be deleted or listed by the owner.

## 2. The Dirty Dozen Payloads (Target: Rejection)
1. User A tries to read User B's profile.
2. User A tries to update User B's sobriety date.
3. User A tries to set `isPremium: true` via client SDK.
4. User A tries to inject a 1MB string into a gratitude field.
5. User A tries to create a chat message for User B.
6. User A tries to list all gratitudes in the system.
7. User A tries to change their `uid` field in their profile.
8. User A tries to decrement their points.
9. User A tries to create a message with a future timestamp.
10. User A tries to create a step progress for step 13.
11. User A tries to read PII (email) of another user.
12. User A tries to bypass `isValidId` by using a non-standard document path.

## 3. Test Runner (Drafted separately in firestore.rules.test.ts)
(Implementation of rules will focus on preventing these).
