import { Check } from 'lucide-react';
import { DEHRADUN_CAMPUSES } from '../data/menu';

interface CampusPromiseSectionProps {
  selectedCampus: string;
  onSelectCampus: (campus: string) => void;
}

export function CampusPromiseSection({
  selectedCampus,
  onSelectCampus,
}: CampusPromiseSectionProps) {
  return (
    <section id="promise" className="py-14 lg:py-16 bg-[#FAF9F7]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
        {/* Left: Transparent Student Pricing & Kitchen Promise */}
        <div className="lg:col-span-5 space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#141413]">
            Built for hostel &amp; campus routines in Dehradun
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 leading-relaxed">
            Standard delivery apps add ₹45–₹75 in platform fees, surge charges, and
            restaurant markups. CampusBite partners directly with local Dehradun kitchens
            to batch hostel and classroom drops at flat student-friendly rates.
          </p>

          <dl className="pt-4 border-t border-zinc-200 space-y-4">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm font-medium text-zinc-700">Average student meal</dt>
              <dd className="text-sm font-semibold text-[#141413] font-[var(--font-mono)] tabular-nums">
                ₹50 – ₹120
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm font-medium text-zinc-700">Campus delivery fee</dt>
              <dd className="text-sm font-semibold text-[#141413] font-[var(--font-mono)] tabular-nums">
                ₹12 flat (Free ₹149+)
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-sm font-medium text-zinc-700">Packaging &amp; surge</dt>
              <dd className="text-sm font-semibold text-[#15803D] font-[var(--font-mono)] tabular-nums">
                ₹0 hidden fees
              </dd>
            </div>
          </dl>
        </div>

        {/* Right: Dehradun Campus Hubs */}
        <div id="campuses" className="lg:col-span-7 space-y-4">
          <div className="flex items-baseline justify-between gap-4">
            <h3 className="text-lg font-semibold text-[#141413]">
              Active Dehradun Campus Drop Points
            </h3>
            <span className="text-xs text-zinc-500">Click to set delivery campus</span>
          </div>

          <div className="divide-y divide-zinc-200 border border-zinc-200 rounded-xl bg-white overflow-hidden">
            {DEHRADUN_CAMPUSES.map((campus) => {
              const isSelected = selectedCampus === campus.name;
              return (
                <button
                  key={campus.name}
                  type="button"
                  onClick={() => onSelectCampus(campus.name)}
                  className={`w-full text-left px-5 py-4 flex items-center justify-between gap-4 transition-colors cursor-pointer ${
                    isSelected ? 'bg-[#15803D]/5' : 'hover:bg-zinc-50'
                  }`}
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm font-semibold text-[#141413]">
                      <span className="truncate">{campus.name}</span>
                      <span aria-hidden="true" className="text-zinc-300">
                        ·
                      </span>
                      <span className="text-xs font-normal text-zinc-500 shrink-0">
                        {campus.area}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 truncate">{campus.dropPoints}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs font-medium text-zinc-600 tabular-nums">
                      {campus.eta}
                    </span>
                    {isSelected && (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#15803D]">
                        <Check className="w-3.5 h-3.5" />
                        Selected
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
