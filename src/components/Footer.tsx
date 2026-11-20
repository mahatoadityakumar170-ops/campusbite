interface FooterProps {
  onOpenOrders: () => void;
}

export function Footer({ onOpenOrders }: FooterProps) {
  return (
    <footer className="border-t border-zinc-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-[#141413]">CampusBite</p>
          <p className="text-xs text-zinc-500">
            Student meal delivery across Dehradun campuses &amp; hostels.
          </p>
        </div>

        <div className="flex items-center gap-6 text-xs font-medium text-zinc-600">
          <a href="#menu" className="hover:text-[#141413] whitespace-nowrap">
            Menu
          </a>
          <a href="#campuses" className="hover:text-[#141413] whitespace-nowrap">
            Campus Hubs
          </a>
          <a href="#promise" className="hover:text-[#141413] whitespace-nowrap">
            Our Promise
          </a>
          <button
            type="button"
            onClick={onOpenOrders}
            className="hover:text-[#141413] whitespace-nowrap cursor-pointer"
          >
            My Orders
          </button>
        </div>
      </div>
    </footer>
  );
}
