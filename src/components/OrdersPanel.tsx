import React, { useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  LogIn,
  Star,
  X,
} from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';
import { BLUEPRINT_LIMITS } from '../lib/firebase';
import { OrderRecord, OrderStatus } from '../types/campus';

interface OrdersPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const STATUS_LABELS: Record<OrderStatus, string> = {
  confirmed: 'Confirmed',
  preparing: 'Preparing at Outlet',
  out_for_delivery: 'Out for Campus Drop',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const NEXT_ADMIN_STATUS: OrderStatus[] = [
  'confirmed',
  'preparing',
  'out_for_delivery',
  'delivered',
  'cancelled',
];

function RatingSelector({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-medium text-zinc-700">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${label} ${n} stars`}
            className={`p-1 rounded cursor-pointer ${
              n <= value ? 'text-amber-500' : 'text-zinc-300 hover:text-zinc-400'
            }`}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );
}

function OrderFeedbackForm({
  order,
  onSubmit,
}: {
  order: OrderRecord;
  onSubmit: (data: {
    orderId: string;
    priceRating: number;
    hygieneRating: number;
    deliveryRating: number;
    wouldOrderAgain: boolean;
    comment: string;
  }) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [priceRating, setPriceRating] = useState(5);
  const [hygieneRating, setHygieneRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [wouldOrderAgain, setWouldOrderAgain] = useState(true);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-[#15803D] hover:underline cursor-pointer"
      >
        Rate price, hygiene &amp; delivery
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit({
        orderId: order.id,
        priceRating,
        hygieneRating,
        deliveryRating,
        wouldOrderAgain,
        comment,
      });
      setOpen(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-3 pt-3 border-t border-zinc-200 space-y-3 bg-white p-3.5 rounded-lg border"
    >
      <RatingSelector
        label="Student Price Fairness"
        value={priceRating}
        onChange={setPriceRating}
      />
      <RatingSelector
        label="Hygiene & Food Quality"
        value={hygieneRating}
        onChange={setHygieneRating}
      />
      <RatingSelector
        label="Campus Drop Convenience"
        value={deliveryRating}
        onChange={setDeliveryRating}
      />

      <div className="flex items-center justify-between gap-3 pt-1">
        <span className="text-xs font-medium text-zinc-700">
          Would you order again?
        </span>
        <div className="inline-flex gap-1 p-0.5 bg-[#F2F0EC] rounded-md">
          <button
            type="button"
            onClick={() => setWouldOrderAgain(true)}
            className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
              wouldOrderAgain ? 'bg-white text-[#141413]' : 'text-zinc-600'
            }`}
          >
            Yes
          </button>
          <button
            type="button"
            onClick={() => setWouldOrderAgain(false)}
            className={`px-2.5 py-1 text-xs font-medium rounded cursor-pointer ${
              !wouldOrderAgain ? 'bg-white text-[#141413]' : 'text-zinc-600'
            }`}
          >
            No
          </button>
        </div>
      </div>

      <input
        type="text"
        maxLength={BLUEPRINT_LIMITS.maxComment}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Optional note on meal or hostel delivery..."
        className="w-full px-3 py-1.5 text-xs border border-zinc-300 rounded-md focus:outline-none focus:border-[#15803D]"
      />

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-md cursor-pointer disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Submit Feedback'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-3 py-1.5 text-xs font-medium text-zinc-600 hover:text-[#141413] cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export function OrdersPanel({ isOpen, onClose }: OrdersPanelProps) {
  const {
    user,
    authBusy,
    isAdmin,
    orders,
    ordersLoading,
    feedbackByOrderId,
    signInWithGoogle,
    cancelOrder,
    updateOrderStatusAdmin,
    submitFeedback,
  } = useFirebase();

  const [tab, setTab] = useState<'my-orders' | 'pilot-ops'>('my-orders');

  if (!isOpen) return null;

  const displayedOrders =
    tab === 'pilot-ops' && isAdmin
      ? orders
      : orders.filter((o) => o.userId === user?.uid);

  const feedbackItems = Object.values(feedbackByOrderId);
  const avgSatisfaction =
    feedbackItems.length > 0
      ? (
          feedbackItems.reduce(
            (acc, f) =>
              acc + (f.priceRating + f.hygieneRating + f.deliveryRating) / 3,
            0,
          ) / feedbackItems.length
        ).toFixed(1)
      : '—';

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="CampusBite Orders"
    >
      <div className="w-full max-w-xl bg-white h-full flex flex-col border-l border-zinc-200 shadow-xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ClipboardList className="w-4 h-4 text-[#15803D]" />
            <h2 className="text-base font-semibold text-[#141413]">
              CampusBite Orders
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close orders"
            className="p-2 rounded-lg text-zinc-500 hover:text-[#141413] hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Admin Mode Switch (only visible to verified admin) */}
        {user && isAdmin && (
          <div className="px-6 py-3 border-b border-zinc-200 bg-[#FAF9F7] flex items-center justify-between gap-4">
            <div className="inline-flex gap-1 p-1 bg-[#F2F0EC] rounded-lg">
              <button
                type="button"
                onClick={() => setTab('my-orders')}
                className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                  tab === 'my-orders'
                    ? 'bg-white text-[#141413] shadow-xs'
                    : 'text-zinc-600'
                }`}
              >
                My Orders
              </button>
              <button
                type="button"
                onClick={() => setTab('pilot-ops')}
                className={`px-3 py-1 text-xs font-medium rounded-md cursor-pointer ${
                  tab === 'pilot-ops'
                    ? 'bg-white text-[#141413] shadow-xs'
                    : 'text-zinc-600'
                }`}
              >
                Pilot Operations ({orders.length})
              </button>
            </div>

            <div className="text-xs text-zinc-600 tabular-nums">
              Avg rating: <span className="font-semibold text-[#141413]">{avgSatisfaction}/5</span>
            </div>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {!user ? (
            <div className="py-16 text-center space-y-4">
              <h3 className="text-base font-semibold text-[#141413]">
                Sign in with Google to view your orders
              </h3>
              <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                Track active campus deliveries, review receipts, and rate your meal
                experience.
              </p>
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={authBusy}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
              >
                <LogIn className="w-4 h-4" />
                <span>{authBusy ? 'Signing in...' : 'Sign in with Google'}</span>
              </button>
            </div>
          ) : ordersLoading ? (
            <p className="text-sm text-zinc-500 py-8 text-center">
              Loading your orders...
            </p>
          ) : displayedOrders.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <p className="text-base font-semibold text-[#141413]">No orders placed yet</p>
              <p className="text-sm text-zinc-500">
                Choose a meal from the menu to place your first campus order.
              </p>
            </div>
          ) : (
            displayedOrders.map((order) => {
              const fb = feedbackByOrderId[order.id];
              return (
                <article
                  key={order.id}
                  className="border border-zinc-200 rounded-xl p-4 bg-[#FAF9F7] space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-zinc-500 font-[var(--font-mono)] truncate">
                        Order #{order.id}
                      </p>
                      <p className="text-sm font-semibold text-[#141413] mt-0.5">
                        {STATUS_LABELS[order.status]}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-[#141413] font-[var(--font-mono)] tabular-nums shrink-0">
                      ₹{order.totalAmount}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-600 space-y-1">
                    <p>
                      {order.campus} · {order.dropPointType}:{' '}
                      <span className="font-medium text-[#141413]">
                        {order.dropPointDetail}
                      </span>
                    </p>
                    <p>
                      {order.paymentMethod} · {order.customerName} ({order.phone})
                    </p>
                  </div>

                  <ul className="pt-2 border-t border-zinc-200/80 space-y-1 text-xs text-zinc-700">
                    {order.items.map((item, idx) => (
                      <li
                        key={`${order.id}-${idx}`}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>
                          {item.quantity} × {item.name}
                        </span>
                        <span className="tabular-nums font-[var(--font-mono)]">
                          ₹{item.price * item.quantity}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* Actions: Cancel / Admin Status / Feedback */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                    {order.userId === user.uid && order.status === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => cancelOrder(order.id)}
                        className="text-xs font-medium text-red-700 hover:underline cursor-pointer"
                      >
                        Cancel Order
                      </button>
                    )}

                    {tab === 'pilot-ops' && isAdmin && (
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor={`status-${order.id}`}
                          className="text-xs text-zinc-500"
                        >
                          Update status:
                        </label>
                        <select
                          id={`status-${order.id}`}
                          value={order.status}
                          onChange={(e) =>
                            updateOrderStatusAdmin(
                              order.id,
                              e.target.value as OrderStatus,
                            )
                          }
                          className="px-2 py-1 text-xs bg-white border border-zinc-300 rounded-md focus:outline-none focus:border-[#15803D]"
                        >
                          {NEXT_ADMIN_STATUS.map((s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {order.userId === user.uid && order.status !== 'cancelled' && (
                    <div>
                      {fb ? (
                        <div className="pt-2 border-t border-zinc-200/80 flex items-center gap-2 text-xs text-[#15803D]">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                          <span>
                            Feedback recorded — Price {fb.priceRating}/5 · Hygiene{' '}
                            {fb.hygieneRating}/5 · Delivery {fb.deliveryRating}/5
                          </span>
                        </div>
                      ) : (
                        <OrderFeedbackForm order={order} onSubmit={submitFeedback} />
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
