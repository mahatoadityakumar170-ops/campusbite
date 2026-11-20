// Reference Security Test Suite for CampusBite Firestore Rules (Phase 0 TDD)
// Verifies the Dirty Dozen adversarial payloads against firestore.rules expectations.

export interface DirtyDozenCase {
  id: number;
  name: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  path: string;
  auth: { uid: string; email: string; email_verified: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
}

export const DIRTY_DOZEN_CASES: DirtyDozenCase[] = [
  {
    id: 1,
    name: 'Unauthenticated Order Creation',
    operation: 'create',
    path: '/orders/ord_01',
    auth: null,
    payload: { userId: 'anon', status: 'confirmed' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 2,
    name: 'Unverified Email Admin Spoof',
    operation: 'list',
    path: '/orders',
    auth: { uid: 'spoof_1', email: 'mahatoadityakumar170@gmail.com', email_verified: false },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 3,
    name: 'Identity Spoofing on Order Create',
    operation: 'create',
    path: '/orders/ord_02',
    auth: { uid: 'user_a', email: 'a@dgu.ac.in', email_verified: true },
    payload: { userId: 'user_b', status: 'confirmed' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 4,
    name: 'Status Shortcutting on Order Create',
    operation: 'create',
    path: '/orders/ord_03',
    auth: { uid: 'user_a', email: 'a@dgu.ac.in', email_verified: true },
    payload: { userId: 'user_a', status: 'delivered' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 5,
    name: 'Shadow Field Injection on User Profile',
    operation: 'create',
    path: '/users/user_a',
    auth: { uid: 'user_a', email: 'a@dgu.ac.in', email_verified: true },
    payload: { uid: 'user_a', displayName: 'A', email: 'a@dgu.ac.in', role: 'admin' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 6,
    name: 'Cross-User PII Read',
    operation: 'get',
    path: '/users/user_b',
    auth: { uid: 'user_a', email: 'a@dgu.ac.in', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 7,
    name: 'Users Collection Enumeration',
    operation: 'list',
    path: '/users',
    auth: { uid: 'user_a', email: 'a@dgu.ac.in', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 8,
    name: 'Unscoped Orders List Query',
    operation: 'list',
    path: '/orders',
    auth: { uid: 'user_a', email: 'a@dgu.ac.in', email_verified: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 9,
    name: 'Terminal State Order Mutation',
    operation: 'update',
    path: '/orders/ord_delivered',
    auth: { uid: 'user_a', email: 'a@dgu.ac.in', email_verified: true },
    payload: { status: 'cancelled' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 10,
    name: 'Immortal Field Tampering (createdAt)',
    operation: 'update',
    path: '/orders/ord_confirmed',
    auth: { uid: 'user_a', email: 'a@dgu.ac.in', email_verified: true },
    payload: { status: 'cancelled', createdAt: '1999-01-01T00:00:00Z' },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 11,
    name: 'Orphaned Feedback Creation',
    operation: 'create',
    path: '/feedback/fb_orphan',
    auth: { uid: 'user_a', email: 'a@dgu.ac.in', email_verified: true },
    payload: { userId: 'user_a', orderId: 'nonexistent_order', priceRating: 5, hygieneRating: 5, deliveryRating: 5, wouldOrderAgain: true },
    expected: 'PERMISSION_DENIED',
  },
  {
    id: 12,
    name: 'Resource Poisoning (Oversized ID / Comment)',
    operation: 'create',
    path: `/feedback/${'x'.repeat(200)}`,
    auth: { uid: 'user_a', email: 'a@dgu.ac.in', email_verified: true },
    payload: { userId: 'user_a', orderId: 'ord_01', comment: 'a'.repeat(5000) },
    expected: 'PERMISSION_DENIED',
  },
];
