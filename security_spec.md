# CampusBite Security Specification (Phase 0 TDD)

## 1. Data Invariants
1. **User Profile PII Isolation**: A document at `/users/{userId}` can only be read (`get`), created, or updated by the authenticated, email-verified user whose `request.auth.uid == userId`. Collection `list` queries on `/users` are strictly denied to prevent PII enumeration (`email`, `phone`, `dropPointDetail`).
2. **Order Ownership & State Integrity**: An order at `/orders/{orderId}` must be created by an email-verified user with `userId == request.auth.uid`, initial `status == 'confirmed'`, and server timestamps (`createdAt == request.time && updatedAt == request.time`). Students may only read/list their own orders and may only transition a `'confirmed'` order to `'cancelled'`. Orders in terminal states (`'delivered'`, `'cancelled'`) cannot be modified by students.
3. **Feedback Relational Integrity**: A feedback document at `/feedback/{feedbackId}` cannot exist without a valid parent order at `/orders/{orderId}` owned by `request.auth.uid`, validated via `exists()` and `get()`. Ratings must be integers between 1 and 5.
4. **Privilege Escalation Prevention**: Users cannot assign themselves admin privileges or modify immutable fields (`uid`, `userId`, `createdAt`, `orderId`). Admin privileges are verified strictly via `/admins/{uid}` or verified runtime founder email (`mahatoadityakumar170@gmail.com` with `email_verified == true`).

## 2. The "Dirty Dozen" Adversarial Payloads
1. **Unauthenticated Order Creation**: `request.auth == null` creating `/orders/ord_01` -> `PERMISSION_DENIED`.
2. **Unverified Email Spoof**: `request.auth.token.email == 'mahatoadityakumar170@gmail.com'` with `email_verified: false` listing `/orders` -> `PERMISSION_DENIED`.
3. **Identity Spoofing on Order Create**: Student A (`uid: 'user_a'`) submits `userId: 'user_b'` -> `PERMISSION_DENIED`.
4. **Status Shortcutting on Order Create**: Student submits `status: 'delivered'` instead of `'confirmed'` on create -> `PERMISSION_DENIED`.
5. **Shadow / Ghost Field Injection**: User submits `isVerified: true` or `role: 'admin'` in `/users/{uid}` or `/orders/{orderId}` -> `PERMISSION_DENIED` (`hasOnly` check rejects extra keys).
6. **PII Cross-User Read**: Student A (`uid: 'user_a'`) attempts `get(/users/user_b)` -> `PERMISSION_DENIED`.
7. **PII Collection Enumeration**: Any non-admin attempts `list(/users)` -> `PERMISSION_DENIED`.
8. **Order Query Scraping**: Student A executes `list(/orders)` without `where('userId', '==', 'user_a')` -> `PERMISSION_DENIED`.
9. **Terminal State Mutation**: Student attempts to update an order whose `status == 'delivered'` back to `'confirmed'` or `'cancelled'` -> `PERMISSION_DENIED`.
10. **Immortal Field Tampering**: Student attempts to change `createdAt` or `userId` during an update -> `PERMISSION_DENIED`.
11. **Orphaned Feedback Injection**: Student submits `/feedback/fb_01` referencing non-existent or another student's `orderId` -> `PERMISSION_DENIED`.
12. **Denial-of-Wallet Resource Poisoning**: Attacker supplies a 500-char `orderId` or 10KB `comment` or 20-item `items` array -> `PERMISSION_DENIED` (`isValidId`, `.size()`, and array length guards reject).
