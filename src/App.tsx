/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useMemo, useState } from 'react';
import { CampusPromiseSection } from './components/CampusPromiseSection';
import { CartDrawer } from './components/CartDrawer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { MenuSection } from './components/MenuSection';
import { OrdersPanel } from './components/OrdersPanel';
import { FirebaseProvider } from './context/FirebaseContext';
import { DEHRADUN_CAMPUSES } from './data/menu';
import { CartItem, MenuItem } from './types/campus';

function CampusBiteStorefront() {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [selectedCampus, setSelectedCampus] = useState(DEHRADUN_CAMPUSES[0].name);
  const [cartOpen, setCartOpen] = useState(false);
  const [ordersOpen, setOrdersOpen] = useState(false);

  const cartItems = useMemo(() => Object.values(cart), [cart]);
  const cartCount = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.quantity, 0),
    [cartItems],
  );

  const handleAddItem = useCallback((meal: MenuItem) => {
    setCart((prev) => {
      const existing = prev[meal.id];
      return {
        ...prev,
        [meal.id]: {
          meal,
          quantity: existing ? Math.min(15, existing.quantity + 1) : 1,
        },
      };
    });
  }, []);

  const handleUpdateQty = useCallback((mealId: string, delta: number) => {
    setCart((prev) => {
      const existing = prev[mealId];
      if (!existing) return prev;
      const nextQty = existing.quantity + delta;
      if (nextQty <= 0) {
        const next = { ...prev };
        delete next[mealId];
        return next;
      }
      return {
        ...prev,
        [mealId]: {
          ...existing,
          quantity: Math.min(15, nextQty),
        },
      };
    });
  }, []);

  const handleRemoveItem = useCallback((mealId: string) => {
    setCart((prev) => {
      const next = { ...prev };
      delete next[mealId];
      return next;
    });
  }, []);

  const handleClearCart = useCallback(() => {
    setCart({});
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF9F7] text-[#141413]">
      <Header
        cartCount={cartCount}
        onOpenCart={() => setCartOpen(true)}
        onOpenOrders={() => setOrdersOpen(true)}
      />

      <main className="flex-1">
        <HeroSection onOpenOrders={() => setOrdersOpen(true)} />
        <MenuSection
          cart={cart}
          selectedCampus={selectedCampus}
          onSelectCampus={setSelectedCampus}
          onAddItem={handleAddItem}
          onUpdateQty={handleUpdateQty}
        />
        <CampusPromiseSection
          selectedCampus={selectedCampus}
          onSelectCampus={setSelectedCampus}
        />
      </main>

      <Footer onOpenOrders={() => setOrdersOpen(true)} />

      <CartDrawer
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
        cartItems={cartItems}
        selectedCampus={selectedCampus}
        onSelectCampus={setSelectedCampus}
        onUpdateQty={handleUpdateQty}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
        onOrderPlaced={() => {
          setCartOpen(false);
          setOrdersOpen(true);
        }}
      />

      <OrdersPanel isOpen={ordersOpen} onClose={() => setOrdersOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <CampusBiteStorefront />
      </FirebaseProvider>
    </ErrorBoundary>
  );
}
