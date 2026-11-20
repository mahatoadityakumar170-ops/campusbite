import { ArrowRight, LogIn, ClipboardList } from 'lucide-react';
import { HERO_IMAGE } from '../data/menu';
import { useFirebase } from '../context/FirebaseContext';
import { FoodImage } from './FoodImage';

interface HeroSectionProps {
  onOpenOrders: () => void;
}

export function HeroSection({ onOpenOrders }: HeroSectionProps) {
  const { user, authReady, authBusy, authError, clearAuthError, signInWithGoogle } =
    useFirebase();

  return (
    <section id="top" className="border-b border-zinc-200/80 bg-[#FAF9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-12 lg:pt-14 lg:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          {/* Left Column: Core Value Proposition & Actions */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-8 py-2">
            <div className="space-y-5">
              <p className="text-sm font-medium text-[#15803D]">
                Dehradun Campus & Hostel Food Delivery
              </p>
              <h1
                className="text-4xl sm:text-5xl font-bold tracking-tight text-[#141413] leading-[1.1]"
                style={{ textWrap: 'balance' }}
              >
                Fresh student meals, delivered to your hostel gate.
              </h1>
              <p className="text-base sm:text-lg text-zinc-600 leading-relaxed max-w-xl">
                Hygienic thalis, bowls, rolls, and chai from verified Dehradun kitchens at
                honest ₹50–₹120 student prices—without steep delivery app fees.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="#menu"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#15803D]"
                >
                  <span>Browse Today&apos;s Menu</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                {authReady && user ? (
                  <button
                    type="button"
                    onClick={onOpenOrders}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#141413] bg-white border border-zinc-300 hover:border-zinc-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <ClipboardList className="w-4 h-4 text-[#15803D]" />
                    <span>My Orders</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    disabled={!authReady || authBusy}
                    className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#141413] bg-white border border-zinc-300 hover:border-zinc-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
                  >
                    <LogIn className="w-4 h-4 text-[#15803D]" />
                    <span>{authBusy ? 'Connecting...' : 'Continue with Google'}</span>
                  </button>
                )}
              </div>

              {authError && (
                <div className="flex items-center justify-between gap-3 bg-amber-50 border border-amber-200 text-amber-900 px-3.5 py-2.5 rounded-lg text-xs">
                  <span>{authError}</span>
                  <button
                    type="button"
                    onClick={clearAuthError}
                    className="font-semibold underline shrink-0 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              <p className="text-xs text-zinc-500">
                Serving DBS Global · Graphic Era · Doon University · DAV College · UTU
              </p>
            </div>
          </div>

          {/* Right Column: Hero Culinary Frame */}
          <div className="lg:col-span-6">
            <div className="h-64 sm:h-80 lg:h-full min-h-[300px] rounded-xl overflow-hidden border border-zinc-200 bg-[#F2F0EC]">
              <FoodImage
                src={HERO_IMAGE}
                alt="Fresh student paneer thali, kathi roll, and kulhad masala chai ready for campus delivery"
                title="CampusBite Fresh Student Meals"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Trust Strip below Hero Split */}
        <div className="mt-10 pt-8 border-t border-zinc-200/80 grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm font-semibold text-[#141413] tabular-nums">₹50 – ₹120 Meals</p>
            <p className="text-xs text-zinc-500 mt-1">
              Transparent kitchen pricing for students
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#141413] tabular-nums">
              Flat ₹12 Delivery
            </p>
            <p className="text-xs text-zinc-500 mt-1">
              Free hostel delivery on orders ₹149+
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#141413]">Hygiene Checked</p>
            <p className="text-xs text-zinc-500 mt-1">
              Curated Dehradun canteens &amp; kitchens
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-[#141413]">UPI or Cash on Delivery</p>
            <p className="text-xs text-zinc-500 mt-1">
              Pay when food reaches your gate or block
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
