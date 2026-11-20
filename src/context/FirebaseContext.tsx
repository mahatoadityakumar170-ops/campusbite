import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  ADMIN_EMAIL,
  auth,
  BLUEPRINT_LIMITS,
  db,
  googleProvider,
  handleFirestoreError,
  OperationType,
  sanitizeText,
} from '../lib/firebase';
import {
  DropPointType,
  OrderFeedback,
  OrderLineItem,
  OrderRecord,
  OrderStatus,
  PaymentMethod,
  UserProfile,
} from '../types/campus';

interface PlaceOrderInput {
  customerName: string;
  phone: string;
  campus: string;
  dropPointType: DropPointType;
  dropPointDetail: string;
  paymentMethod: PaymentMethod;
  items: OrderLineItem[];
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  notes?: string;
}

interface SubmitFeedbackInput {
  orderId: string;
  priceRating: number;
  hygieneRating: number;
  deliveryRating: number;
  wouldOrderAgain: boolean;
  comment?: string;
}

interface FirebaseContextValue {
  user: User | null;
  authReady: boolean;
  authBusy: boolean;
  authError: string | null;
  clearAuthError: () => void;
  isAdmin: boolean;
  userProfile: UserProfile | null;
  orders: OrderRecord[];
  ordersLoading: boolean;
  feedbackByOrderId: Record<string, OrderFeedback>;
  signInWithGoogle: () => Promise<User | null>;
  signOutUser: () => Promise<void>;
  placeOrder: (input: PlaceOrderInput) => Promise<string>;
  cancelOrder: (orderId: string) => Promise<void>;
  updateOrderStatusAdmin: (orderId: string, nextStatus: OrderStatus) => Promise<void>;
  submitFeedback: (input: SubmitFeedbackInput) => Promise<void>;
}

const FirebaseContext = createContext<FirebaseContextValue | null>(null);

function toMillis(ts: unknown): number {
  if (ts instanceof Timestamp) return ts.toMillis();
  if (ts && typeof ts === 'object' && 'seconds' in ts) {
    return Number((ts as { seconds: number }).seconds) * 1000;
  }
  return 0;
}

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [feedbackList, setFeedbackList] = useState<OrderFeedback[]>([]);

  const isAdmin = useMemo(
    () => Boolean(user?.email && user.email === ADMIN_EMAIL && user.emailVerified),
    [user],
  );

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setAuthReady(true);
      if (!nextUser) {
        setUserProfile(null);
        setOrders([]);
        setFeedbackList([]);
      }
    });
    return () => unsubscribe();
  }, []);

  // Ensure user profile doc exists once signed in, and listen to it + orders + feedback
  useEffect(() => {
    if (!authReady || !user) return;

    let cancelled = false;
    const profilePath = `users/${user.uid}`;
    const profileRef = doc(db, 'users', user.uid);

    const ensureUserProfile = async () => {
      try {
        const snap = await getDoc(profileRef);
        if (!snap.exists() && !cancelled && user.email) {
          const payload: Record<string, unknown> = {
            uid: user.uid,
            displayName: sanitizeText(user.displayName || 'DGU Student', BLUEPRINT_LIMITS.maxDisplayName),
            email: sanitizeText(user.email, BLUEPRINT_LIMITS.maxEmail),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          };
          if (user.photoURL) {
            payload.photoURL = sanitizeText(user.photoURL, BLUEPRINT_LIMITS.maxPhotoURL);
          }
          await setDoc(profileRef, payload);
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, profilePath);
      }
    };

    ensureUserProfile();

    const unsubProfile = onSnapshot(
      profileRef,
      (snap) => {
        if (snap.exists()) {
          setUserProfile(snap.data() as UserProfile);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, profilePath);
      },
    );

    setOrdersLoading(true);
    const ordersPath = 'orders';
    const ordersQuery = isAdmin
      ? collection(db, ordersPath)
      : query(collection(db, ordersPath), where('userId', '==', user.uid));

    const unsubOrders = onSnapshot(
      ordersQuery,
      (snap) => {
        const nextOrders = snap.docs
          .map((d) => ({
            id: d.id,
            ...(d.data() as Omit<OrderRecord, 'id'>),
          }))
          .sort((a, b) => toMillis(b.createdAt) - toMillis(a.createdAt));
        setOrders(nextOrders);
        setOrdersLoading(false);
      },
      (error) => {
        setOrdersLoading(false);
        handleFirestoreError(error, OperationType.LIST, ordersPath);
      },
    );

    const feedbackPath = 'feedback';
    const feedbackQuery = isAdmin
      ? collection(db, feedbackPath)
      : query(collection(db, feedbackPath), where('userId', '==', user.uid));

    const unsubFeedback = onSnapshot(
      feedbackQuery,
      (snap) => {
        const items = snap.docs.map((d) => ({
          id: d.id,
          ...(d.data() as Omit<OrderFeedback, 'id'>),
        }));
        setFeedbackList(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, feedbackPath);
      },
    );

    return () => {
      cancelled = true;
      unsubProfile();
      unsubOrders();
      unsubFeedback();
    };
  }, [authReady, user, isAdmin]);

  const feedbackByOrderId = useMemo(() => {
    const map: Record<string, OrderFeedback> = {};
    for (const item of feedbackList) {
      map[item.orderId] = item;
    }
    return map;
  }, [feedbackList]);

  const signInWithGoogle = useCallback(async () => {
    setAuthBusy(true);
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error: unknown) {
      const code = (error as { code?: string })?.code;
      if (code === 'auth/popup-closed-by-user' || code === 'auth/cancelled-popup-request') {
        setAuthError('Google sign-in was cancelled. Click Sign in with Google when ready.');
      } else if (code === 'auth/popup-blocked') {
        setAuthError('Your browser blocked the Google sign-in popup. Please allow popups and try again.');
      } else {
        setAuthError(error instanceof Error ? error.message : 'Unable to sign in with Google.');
      }
      return null;
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthBusy(true);
    try {
      await signOut(auth);
    } finally {
      setAuthBusy(false);
    }
  }, []);

  const placeOrder = useCallback(
    async (input: PlaceOrderInput): Promise<string> => {
      if (!user || !user.email) {
        throw new Error('Please sign in with Google before placing an order.');
      }
      const trimmedPhone = sanitizeText(input.phone, BLUEPRINT_LIMITS.maxPhone);
      if (!BLUEPRINT_LIMITS.phonePattern.test(trimmedPhone)) {
        throw new Error('Please enter a valid 7–20 digit phone number.');
      }
      const trimmedDetail = sanitizeText(input.dropPointDetail, BLUEPRINT_LIMITS.maxDropPointDetail);
      if (trimmedDetail.length < 2) {
        throw new Error('Please enter your hostel block, PG name, or classroom.');
      }
      if (input.items.length < 1 || input.items.length > BLUEPRINT_LIMITS.maxOrderItems) {
        throw new Error('Orders must contain between 1 and 15 meal items.');
      }

      const orderId = `CB_${Date.now()}_${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      const orderPath = `orders/${orderId}`;
      const cleanName = sanitizeText(
        input.customerName || user.displayName || 'DGU Student',
        BLUEPRINT_LIMITS.maxDisplayName,
      );
      const cleanCampus = sanitizeText(input.campus, BLUEPRINT_LIMITS.maxCampus);
      const cleanNotes = input.notes ? sanitizeText(input.notes, BLUEPRINT_LIMITS.maxNotes) : '';

      const orderPayload: Record<string, unknown> = {
        userId: user.uid,
        customerName: cleanName,
        customerEmail: sanitizeText(user.email, BLUEPRINT_LIMITS.maxEmail),
        phone: trimmedPhone,
        campus: cleanCampus,
        dropPointType: input.dropPointType,
        dropPointDetail: trimmedDetail,
        paymentMethod: input.paymentMethod,
        items: input.items.slice(0, BLUEPRINT_LIMITS.maxOrderItems).map((item) => ({
          mealId: sanitizeText(item.mealId, 64),
          name: sanitizeText(item.name, 100),
          outlet: sanitizeText(item.outlet, 80),
          price: Number(item.price),
          quantity: Number(item.quantity),
        })),
        subtotal: Number(input.subtotal),
        deliveryFee: Number(input.deliveryFee),
        totalAmount: Number(input.totalAmount),
        status: 'confirmed',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      if (cleanNotes) {
        orderPayload.notes = cleanNotes;
      }

      try {
        await setDoc(doc(db, 'orders', orderId), orderPayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, orderPath);
      }

      // Persist student delivery defaults on their profile
      const profilePath = `users/${user.uid}`;
      try {
        const profilePayload: Record<string, unknown> = {
          displayName: cleanName,
          phone: trimmedPhone,
          campus: cleanCampus,
          dropPointType: input.dropPointType,
          dropPointDetail: trimmedDetail,
          updatedAt: serverTimestamp(),
        };
        if (user.photoURL) {
          profilePayload.photoURL = sanitizeText(user.photoURL, BLUEPRINT_LIMITS.maxPhotoURL);
        }
        await updateDoc(doc(db, 'users', user.uid), profilePayload);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, profilePath);
      }

      return orderId;
    },
    [user],
  );

  const cancelOrder = useCallback(
    async (orderId: string) => {
      if (!user) return;
      const orderPath = `orders/${orderId}`;
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status: 'cancelled',
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, orderPath);
      }
    },
    [user],
  );

  const updateOrderStatusAdmin = useCallback(
    async (orderId: string, nextStatus: OrderStatus) => {
      if (!user || !isAdmin) return;
      const orderPath = `orders/${orderId}`;
      try {
        await updateDoc(doc(db, 'orders', orderId), {
          status: nextStatus,
          updatedAt: serverTimestamp(),
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, orderPath);
      }
    },
    [user, isAdmin],
  );

  const submitFeedback = useCallback(
    async (input: SubmitFeedbackInput) => {
      if (!user) {
        throw new Error('Please sign in with Google to submit feedback.');
      }
      const feedbackId = `FB_${input.orderId}`;
      const feedbackPath = `feedback/${feedbackId}`;
      const cleanComment = input.comment
        ? sanitizeText(input.comment, BLUEPRINT_LIMITS.maxComment)
        : '';

      const payload: Record<string, unknown> = {
        userId: user.uid,
        orderId: sanitizeText(input.orderId, BLUEPRINT_LIMITS.maxIdLength),
        priceRating: Math.min(5, Math.max(1, Math.round(input.priceRating))),
        hygieneRating: Math.min(5, Math.max(1, Math.round(input.hygieneRating))),
        deliveryRating: Math.min(5, Math.max(1, Math.round(input.deliveryRating))),
        wouldOrderAgain: Boolean(input.wouldOrderAgain),
        createdAt: serverTimestamp(),
      };

      if (cleanComment) {
        payload.comment = cleanComment;
      }

      try {
        await setDoc(doc(db, 'feedback', feedbackId), payload);
      } catch (error) {
        handleFirestoreError(error, OperationType.CREATE, feedbackPath);
      }
    },
    [user],
  );

  const value = useMemo<FirebaseContextValue>(
    () => ({
      user,
      authReady,
      authBusy,
      authError,
      clearAuthError: () => setAuthError(null),
      isAdmin,
      userProfile,
      orders,
      ordersLoading,
      feedbackByOrderId,
      signInWithGoogle,
      signOutUser,
      placeOrder,
      cancelOrder,
      updateOrderStatusAdmin,
      submitFeedback,
    }),
    [
      user,
      authReady,
      authBusy,
      authError,
      isAdmin,
      userProfile,
      orders,
      ordersLoading,
      feedbackByOrderId,
      signInWithGoogle,
      signOutUser,
      placeOrder,
      cancelOrder,
      updateOrderStatusAdmin,
      submitFeedback,
    ],
  );

  return (
    <FirebaseContext.Provider value={value}>{children}</FirebaseContext.Provider>
  );
}

export function useFirebase() {
  const ctx = useContext(FirebaseContext);
  if (!ctx) {
    throw new Error('useFirebase must be used inside FirebaseProvider');
  }
  return ctx;
}
