import { useState } from 'react';
import { Utensils } from 'lucide-react';

interface FoodImageProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export function FoodImage({ src, alt, title, className = '' }: FoodImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-stone-100 to-stone-200 text-stone-600 p-6 ${className}`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-7 h-7 text-stone-500" />
        <span className="text-xs font-medium text-center text-stone-600 max-w-[18ch]">
          {title}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
