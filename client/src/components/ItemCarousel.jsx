import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ItemCarousel - A reusable carousel for displaying items in a sliding view
 * Shows 1 item on mobile, 2 on tablet, 3 on desktop
 */
const ItemCarousel = ({ children, itemsPerView = { mobile: 1, tablet: 2, desktop: 3 } }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const items = Array.isArray(children) ? children : [children];
  const totalItems = items.length;

  // Calculate max index based on items per view (desktop default)
  const maxIndex = Math.max(0, totalItems - itemsPerView.desktop);

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // Don't show carousel if not enough items
  if (totalItems <= itemsPerView.desktop) {
    return <div className="grid-3">{children}</div>;
  }

  return (
    <div className="relative">
      {/* Carousel Container */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-out gap-6"
          style={{
            transform: `translateX(-${currentIndex * (100 / itemsPerView.desktop + 2)}%)`,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0"
              style={{
                width: `calc(${100 / itemsPerView.desktop}% - ${(itemsPerView.desktop - 1) * 1.5 / itemsPerView.desktop}rem)`,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {currentIndex > 0 && (
        <button
          onClick={goToPrevious}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-gray-900/90 hover:bg-brit-blue text-white p-3 rounded-full transition-all duration-300 border-2 border-brit-gold/30 hover:border-brit-gold shadow-xl"
          aria-label="Previous items"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {currentIndex < maxIndex && (
        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-gray-900/90 hover:bg-brit-blue text-white p-3 rounded-full transition-all duration-300 border-2 border-brit-gold/30 hover:border-brit-gold shadow-xl"
          aria-label="Next items"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Progress Dots */}
      <div className="flex justify-center gap-2 mt-8">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'w-8 bg-brit-gold'
                : 'w-2 bg-gray-600 hover:bg-gray-400'
            }`}
            aria-label={`Go to page ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ItemCarousel;
