import { useMemo, useState } from 'react';
import { Minus, Plus, Search } from 'lucide-react';
import {
  DEHRADUN_CAMPUSES,
  MENU_CATEGORIES,
  MENU_ITEMS,
} from '../data/menu';
import { CartItem, MealCategory, MenuItem } from '../types/campus';
import { FoodImage } from './FoodImage';

interface MenuSectionProps {
  cart: Record<string, CartItem>;
  selectedCampus: string;
  onSelectCampus: (campus: string) => void;
  onAddItem: (meal: MenuItem) => void;
  onUpdateQty: (mealId: string, delta: number) => void;
}

export function MenuSection({
  cart,
  selectedCampus,
  onSelectCampus,
  onAddItem,
  onUpdateQty,
}: MenuSectionProps) {
  const [activeCategory, setActiveCategory] = useState<MealCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMeals = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MENU_ITEMS.filter((item) => {
      const matchesCategory =
        activeCategory === 'All' || item.category === activeCategory;
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.outlet.toLowerCase().includes(q) ||
        item.portion.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <section id="menu" className="py-14 lg:py-16 bg-white border-b border-zinc-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
              Today&apos;s Student Menu
            </h2>
            <p className="text-sm text-zinc-600">
              Freshly prepared meals from nearby Dehradun outlets. Tap any meal to add to your bag.
            </p>
          </div>

          {/* Search & Campus Quick Selector */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search meals or outlets..."
                aria-label="Search meals or outlets"
                className="w-full sm:w-60 pl-9 pr-3 py-2 text-sm bg-[#FAF9F7] border border-zinc-200 rounded-lg text-[#141413] placeholder:text-zinc-400 focus:outline-none focus:border-[#15803D]"
              />
            </div>

            <select
              value={selectedCampus}
              onChange={(e) => onSelectCampus(e.target.value)}
              aria-label="Delivering to campus"
              className="px-3 py-2 text-sm bg-[#FAF9F7] border border-zinc-200 rounded-lg text-[#141413] focus:outline-none focus:border-[#15803D]"
            >
              {DEHRADUN_CAMPUSES.map((campus) => (
                <option key={campus.name} value={campus.name}>
                  {campus.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category Segmented Tabs */}
        <div
          role="tablist"
          aria-label="Meal categories"
          className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#F2F0EC] rounded-lg mb-8"
        >
          {MENU_CATEGORIES.map((category) => {
            const active = activeCategory === category;
            return (
              <button
                key={category}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-[#141413] shadow-xs'
                    : 'text-zinc-600 hover:text-[#141413]'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        {/* Meal Grid */}
        {filteredMeals.length === 0 ? (
          <div className="border border-zinc-200 rounded-xl p-10 text-center space-y-3 bg-[#FAF9F7]">
            <p className="text-base font-medium text-[#141413]">
              No meals match &ldquo;{searchQuery}&rdquo;
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('All');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors cursor-pointer"
            >
              Show All Meals
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredMeals.map((meal) => {
              const inCart = cart[meal.id];
              return (
                <article
                  key={meal.id}
                  className="group bg-[#FAF9F7] border border-zinc-200/90 rounded-xl overflow-hidden flex flex-col justify-between transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div>
                    <div className="aspect-[4/3] w-full bg-[#F2F0EC] overflow-hidden">
                      <FoodImage
                        src={meal.image}
                        alt={`${meal.name} from ${meal.outlet}`}
                        title={meal.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    </div>

                    <div className="p-5 space-y-2">
                      {/* Clean unboxed metadata with typographic separators */}
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span className="truncate">{meal.outlet}</span>
                        <span aria-hidden="true">·</span>
                        <span className="tabular-nums shrink-0">{meal.prepTime}</span>
                        <span aria-hidden="true">·</span>
                        <span className="text-[#15803D] font-medium shrink-0">
                          {meal.dietary}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-[#141413] leading-snug">
                        {meal.name}
                      </h3>
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        {meal.portion}
                      </p>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2 flex items-center justify-between gap-4 border-t border-zinc-200/60 mt-1">
                    <span className="text-base font-semibold text-[#141413] font-[var(--font-mono)] tabular-nums">
                      ₹{meal.price}
                    </span>

                    {inCart ? (
                      <div className="inline-flex items-center gap-2 bg-white border border-zinc-300 rounded-lg p-1">
                        <button
                          type="button"
                          onClick={() => onUpdateQty(meal.id, -1)}
                          aria-label={`Decrease quantity of ${meal.name}`}
                          className="w-7 h-7 flex items-center justify-center rounded text-zinc-700 hover:bg-zinc-100 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-6 text-center text-sm font-semibold tabular-nums text-[#141413]">
                          {inCart.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQty(meal.id, 1)}
                          aria-label={`Increase quantity of ${meal.name}`}
                          className="w-7 h-7 flex items-center justify-center rounded text-white bg-[#15803D] hover:bg-[#166534] cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onAddItem(meal)}
                        className="px-4 py-2 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        Add to Bag
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
