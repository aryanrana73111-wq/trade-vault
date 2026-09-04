# Security Spec

## 1. Data Invariants
- A User document can only be accessed and modified by the user with the matching `uid`.
- Dashboards, Trades, and Strategies are subcollections of the User document. They can ONLY be accessed and modified by the user whose `uid` matches the `userId` in the path.
- Document IDs must be valid strings.

## 2. The "Dirty Dozen" Payloads
1. Unauthenticated read of a user profile.
2. Unauthenticated write to a user profile.
3. Authenticated user A reading user B's profile.
4. Authenticated user A writing to user B's profile.
5. Authenticated user A creating a dashboard in user B's path.
6. Authenticated user A reading user B's dashboards.
7. Authenticated user A modifying user B's trades.
8. Authenticated user creating a trade with an invalid ID type (e.g., extremely long string).
9. Shadow Update: Updating a trade with forbidden ghost fields.
10. Email Spoof: Attempting to create a profile for another email.
11. PII Blanket: Reading a user's profile without being the owner.
12. Value Poisoning: Updating a number field with a string.

## 3. Test Runner
We will generate tests to verify these constraints.
