import { ShoppingBag, LogIn, LogOut } from 'lucide-react';
import { useFirebase } from '../context/FirebaseContext';

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenOrders: () => void;
}

export function Header({ cartCount, onOpenCart, onOpenOrders }: HeaderProps) {
  const { user, authReady, authBusy, signInWithGoogle, signOutUser } = useFirebase();
  const firstName = user?.displayName?.split(' ')[0] || 'Account';

  return (
    <header className="sticky top-0 z-30 bg-[#FAF9F7]/95 backdrop-blur-sm border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          className="text-xl font-bold tracking-tight text-[#141413] whitespace-nowrap shrink-0 font-[var(--font-display)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#15803D] rounded"
        >
          CampusBite
        </a>

        {/* Zone 2: Clean single-line text nav links */}
        <nav
          aria-label="Primary navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-600"
        >
          <a
            href="#menu"
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Menu
          </a>
          <a
            href="#campuses"
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Campus Hubs
          </a>
          <a
            href="#promise"
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Our Promise
          </a>
          <button
            type="button"
            onClick={onOpenOrders}
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            My Orders
          </button>
        </nav>

        {/* Zone 3: Primary actions */}
        <div className="flex items-center gap-3 shrink-0">
          {authReady && user ? (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onOpenOrders}
                className="hidden sm:inline-flex items-center gap-2 text-sm font-medium text-zinc-700 hover:text-[#141413] whitespace-nowrap shrink-0 cursor-pointer"
              >
                {user.photoURL && (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Student profile'}
                    referrerPolicy="no-referrer"
                    className="w-6 h-6 rounded-full object-cover border border-zinc-200"
                  />
                )}
                <span className="max-w-[110px] truncate">{firstName}</span>
              </button>
              <button
                type="button"
                onClick={signOutUser}
                disabled={authBusy}
                aria-label="Sign out"
                title="Sign out"
                className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-medium text-zinc-600 hover:text-[#141413] hover:bg-zinc-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              disabled={!authReady || authBusy}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#141413] bg-white border border-zinc-300 hover:border-zinc-400 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{authBusy ? 'Signing in...' : 'Google Sign in'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#15803D]"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Bag</span>
            <span className="tabular-nums">({cartCount})</span>
          </button>
        </div>
      </div>
    </header>
  );
}
