import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  LogIn,
  Minus,
  Plus,
  ShoppingBag,
  Trash2,
  X,
} from 'lucide-react';
import {
  DEHRADUN_CAMPUSES,
  FLAT_DELIVERY_FEE,
  FREE_DELIVERY_THRESHOLD,
} from '../data/menu';
import { useFirebase } from '../context/FirebaseContext';
import { BLUEPRINT_LIMITS } from '../lib/firebase';
import { CartItem, DropPointType, PaymentMethod } from '../types/campus';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  selectedCampus: string;
  onSelectCampus: (campus: string) => void;
  onUpdateQty: (mealId: string, delta: number) => void;
  onRemoveItem: (mealId: string) => void;
  onClearCart: () => void;
  onOrderPlaced: () => void;
}

const DROP_TYPES: DropPointType[] = [
  'Hostel Gate',
  'PG / Flat',
  'Classroom / Block',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'UPI on Delivery',
  'Cash on Delivery',
];

export function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  selectedCampus,
  onSelectCampus,
  onUpdateQty,
  onRemoveItem,
  onClearCart,
  onOrderPlaced,
}: CartDrawerProps) {
  const {
    user,
    userProfile,
    authBusy,
    signInWithGoogle,
    placeOrder,
  } = useFirebase();

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [dropPointType, setDropPointType] = useState<DropPointType>('Hostel Gate');
  const [dropPointDetail, setDropPointDetail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('UPI on Delivery');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [confirmedOrderId, setConfirmedOrderId] = useState<string | null>(null);

  useEffect(() => {
    if (userProfile || user) {
      setCustomerName((prev) => prev || userProfile?.displayName || user?.displayName || '');
      if (userProfile?.phone) setPhone((prev) => prev || userProfile.phone || '');
      if (userProfile?.campus) onSelectCampus(userProfile.campus);
      if (userProfile?.dropPointType) setDropPointType(userProfile.dropPointType);
      if (userProfile?.dropPointDetail) {
        setDropPointDetail((prev) => prev || userProfile.dropPointDetail || '');
      }
    }
  }, [user, userProfile, onSelectCampus]);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.meal.price * item.quantity,
    0,
  );
  const deliveryFee =
    subtotal === 0 || subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : FLAT_DELIVERY_FEE;
  const totalAmount = subtotal + deliveryFee;
  const amountForFreeDelivery = Math.max(0, FREE_DELIVERY_THRESHOLD - subtotal);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!user) {
      setFormError('Please sign in with Google to place your campus order.');
      return;
    }

    if (!BLUEPRINT_LIMITS.phonePattern.test(phone.trim())) {
      setFormError('Enter a valid 10-digit mobile number for the delivery rider.');
      return;
    }

    if (dropPointDetail.trim().length < 2) {
      setFormError('Enter your hostel name, PG address, or classroom block.');
      return;
    }

    setSubmitting(true);
    try {
      const orderId = await placeOrder({
        customerName: customerName.trim() || user.displayName || 'DGU Student',
        phone: phone.trim(),
        campus: selectedCampus,
        dropPointType,
        dropPointDetail: dropPointDetail.trim(),
        paymentMethod,
        items: cartItems.map((c) => ({
          mealId: c.meal.id,
          name: c.meal.name,
          outlet: c.meal.outlet,
          price: c.meal.price,
          quantity: c.quantity,
        })),
        subtotal,
        deliveryFee,
        totalAmount,
        notes: notes.trim(),
      });
      setConfirmedOrderId(orderId);
      onClearCart();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : 'Unable to place order right now.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setConfirmedOrderId(null);
    setFormError(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-label="Meal Bag and Checkout"
    >
      <div className="w-full max-w-lg bg-white h-full flex flex-col border-l border-zinc-200 shadow-xl">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-4 h-4 text-[#15803D]" />
            <h2 className="text-base font-semibold text-[#141413]">Your Meal Bag</h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close bag"
            className="p-2 rounded-lg text-zinc-500 hover:text-[#141413] hover:bg-zinc-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {confirmedOrderId ? (
            <div className="py-10 space-y-5">
              <div className="w-11 h-11 rounded-full bg-[#15803D]/10 text-[#15803D] flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-[#15803D] font-[var(--font-mono)]">
                  Order #{confirmedOrderId} Confirmed
                </p>
                <h3 className="text-xl font-bold text-[#141413]">
                  Preparing at partner kitchen
                </h3>
                <p className="text-sm text-zinc-600 leading-relaxed">
                  Delivering to <span className="font-medium text-[#141413]">{dropPointDetail}</span>{' '}
                  ({selectedCampus}) via {paymentMethod}.
                </p>
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedOrderId(null);
                    onOrderPlaced();
                  }}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors cursor-pointer"
                >
                  Track Live Order
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2.5 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                >
                  Back to Menu
                </button>
              </div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="py-16 text-center space-y-3">
              <p className="text-base font-semibold text-[#141413]">Your meal bag is empty</p>
              <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                Add thalis, bowls, rolls, or chai from Today&apos;s Student Menu to start an order.
              </p>
              <button
                type="button"
                onClick={handleClose}
                className="mt-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors cursor-pointer"
              >
                Browse Menu
              </button>
            </div>
          ) : (
            <>
              {/* Itemized List */}
              <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl bg-[#FAF9F7]">
                {cartItems.map(({ meal, quantity }) => (
                  <div
                    key={meal.id}
                    className="p-4 flex items-center justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#141413] truncate">
                        {meal.name}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {meal.outlet} · ₹{meal.price} each
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="inline-flex items-center gap-1.5 bg-white border border-zinc-200 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(meal.id, -1)}
                          aria-label={`Decrease ${meal.name}`}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-semibold tabular-nums">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(meal.id, 1)}
                          aria-label={`Increase ${meal.name}`}
                          className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-100 text-zinc-700 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="w-12 text-right text-sm font-semibold tabular-nums font-[var(--font-mono)]">
                        ₹{meal.price * quantity}
                      </span>

                      <button
                        type="button"
                        onClick={() => onRemoveItem(meal.id)}
                        aria-label={`Remove ${meal.name}`}
                        className="p-1.5 text-zinc-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="border border-zinc-200 rounded-xl p-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-zinc-600">
                  <span>Meal Subtotal</span>
                  <span className="tabular-nums font-[var(--font-mono)]">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-zinc-600">
                  <span>Campus Delivery Fee</span>
                  <span className="tabular-nums font-[var(--font-mono)]">
                    {deliveryFee === 0 ? (
                      <span className="text-[#15803D] font-medium">Free</span>
                    ) : (
                      `₹${deliveryFee}`
                    )}
                  </span>
                </div>
                {amountForFreeDelivery > 0 && (
                  <p className="text-xs text-zinc-500">
                    Add ₹{amountForFreeDelivery} more for free hostel delivery.
                  </p>
                )}
                <div className="pt-2.5 border-t border-zinc-200 flex justify-between font-semibold text-[#141413]">
                  <span>Total Payable ({paymentMethod})</span>
                  <span className="tabular-nums font-[var(--font-mono)]">₹{totalAmount}</span>
                </div>
              </div>

              {/* Google Sign-In Gate or Delivery Form */}
              {!user ? (
                <div className="border border-zinc-200 rounded-xl p-5 bg-[#FAF9F7] space-y-3">
                  <h3 className="text-sm font-semibold text-[#141413]">
                    Sign in with Google to complete checkout
                  </h3>
                  <p className="text-xs text-zinc-600 leading-relaxed">
                    Your Google account saves your hostel drop point and lets you track live
                    order updates.
                  </p>
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={authBusy}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors cursor-pointer disabled:opacity-60"
                  >
                    <LogIn className="w-4 h-4" />
                    <span>{authBusy ? 'Signing in...' : 'Sign in with Google'}</span>
                  </button>
                </div>
              ) : (
                <form id="checkout-form" onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#141413]">
                      Campus Delivery Details
                    </h3>
                    <span className="text-xs text-zinc-500 truncate max-w-[200px]">
                      {user.email}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={BLUEPRINT_LIMITS.maxDisplayName}
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Aditya Kumar"
                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-[#15803D]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-700 mb-1">
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        required
                        maxLength={BLUEPRINT_LIMITS.maxPhone}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+91 98765 43210"
                        className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-[#15803D]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Campus / University
                    </label>
                    <select
                      value={selectedCampus}
                      onChange={(e) => onSelectCampus(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg bg-white focus:outline-none focus:border-[#15803D]"
                    >
                      {DEHRADUN_CAMPUSES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Drop Point Type
                    </span>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#F2F0EC] rounded-lg">
                      {DROP_TYPES.map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setDropPointType(type)}
                          className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                            dropPointType === type
                              ? 'bg-white text-[#141413] shadow-xs'
                              : 'text-zinc-600 hover:text-[#141413]'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Hostel Block / Gate / Room Detail
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={BLUEPRINT_LIMITS.maxDropPointDetail}
                      value={dropPointDetail}
                      onChange={(e) => setDropPointDetail(e.target.value)}
                      placeholder="e.g. Boys Hostel B, Main Gate"
                      className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-[#15803D]"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-medium text-zinc-700 mb-1.5">
                      Payment Method
                    </span>
                    <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#F2F0EC] rounded-lg">
                      {PAYMENT_METHODS.map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setPaymentMethod(method)}
                          className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                            paymentMethod === method
                              ? 'bg-white text-[#141413] shadow-xs'
                              : 'text-zinc-600 hover:text-[#141413]'
                          }`}
                        >
                          {method}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-zinc-700 mb-1">
                      Kitchen or Gate Note (Optional)
                    </label>
                    <input
                      type="text"
                      maxLength={BLUEPRINT_LIMITS.maxNotes}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Less spicy, call at main gate"
                      className="w-full px-3 py-2 text-sm border border-zinc-300 rounded-lg focus:outline-none focus:border-[#15803D]"
                    />
                  </div>

                  {formError && (
                    <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                      {formError}
                    </p>
                  )}
                </form>
              )}
            </>
          )}
        </div>

        {/* Sticky Checkout Footer */}
        {!confirmedOrderId && cartItems.length > 0 && user && (
          <div className="px-6 py-4 border-t border-zinc-200 bg-white">
            <button
              type="submit"
              form="checkout-form"
              disabled={submitting}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors cursor-pointer disabled:opacity-60 tabular-nums"
            >
              {submitting ? 'Placing Order...' : `Place Order · ₹${totalAmount}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
