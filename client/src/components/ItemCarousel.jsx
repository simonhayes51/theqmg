import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ItemCarousel - A reusable carousel for displaying items in a sliding view
 * Shows 1 item on mobile, 2 on tablet, 3 on desktop
 */
const ItemCarousel = ({ children, itemsPerView = 3 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsToShow, setItemsToShow] = useState(itemsPerView);
  const containerRef = useRef(null);

  const items = Array.isArray(children) ? children : [children];
  const totalItems = items.length;

  // Responsive items per view
  useEffect(() => {
    const updateItemsToShow = () => {
      if (window.innerWidth < 768) {
        setItemsToShow(1); // Mobile: 1 item
      } else if (window.innerWidth < 1024) {
        setItemsToShow(2); // Tablet: 2 items
      } else {
        setItemsToShow(Math.min(itemsPerView, totalItems)); // Desktop: 3 items or total if less
      }
    };

    updateItemsToShow();
    window.addEventListener('resize', updateItemsToShow);
    return () => window.removeEventListener('resize', updateItemsToShow);
  }, [itemsPerView, totalItems]);

  // Calculate max index
  const maxIndex = Math.max(0, totalItems - itemsToShow);

  const goToNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, maxIndex]);

  // Touch/swipe support
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (distance > minSwipeDistance) goToNext();
    if (distance < -minSwipeDistance) goToPrevious();

    setTouchStart(0);
    setTouchEnd(0);
  };

  // If only one item, show it without carousel controls
  if (totalItems === 1) {
    return <div className="max-w-md mx-auto">{children}</div>;
  }

  // Calculate transform percentage
  const itemWidth = 100 / itemsToShow;
  const transformPercent = -(currentIndex * itemWidth);

  return (
    <div className="relative" aria-roledescription="carousel">
      {/* Carousel Container */}
      <div
        className="overflow-hidden"
        ref={containerRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{
            transform: `translateX(${transformPercent}%)`,
          }}
        >
          {items.map((item, index) => (
            <div
              key={index}
              className="flex-shrink-0 px-3"
              style={{
                width: `${itemWidth}%`,
              }}
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${totalItems}`}
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
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-gray-900/90 hover:bg-brit-blue text-white p-3 rounded-full transition-all duration-300 border-2 border-brit-gold/30 hover:border-brit-gold shadow-xl hover:scale-110"
          aria-label="Previous items"
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {currentIndex < maxIndex && (
        <button
          onClick={goToNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-gray-900/90 hover:bg-brit-blue text-white p-3 rounded-full transition-all duration-300 border-2 border-brit-gold/30 hover:border-brit-gold shadow-xl hover:scale-110"
          aria-label="Next items"
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* Progress Dots */}
      {maxIndex > 0 && (
        <div className="flex justify-center gap-2 mt-8" role="tablist" aria-label="Carousel navigation">
          {Array.from({ length: maxIndex + 1 }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'w-8 bg-brit-gold'
                  : 'w-2 bg-gray-600 hover:bg-gray-400'
              }`}
              aria-label={`Go to slide ${index + 1}`}
              role="tab"
              aria-selected={index === currentIndex}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ItemCarousel;
