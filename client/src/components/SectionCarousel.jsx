import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SectionCarousel = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const carouselRef = useRef(null);

  // Convert children to array
  const slides = Array.isArray(children) ? children : [children];
  const totalSlides = slides.length;

  // Auto-advance carousel (optional - commented out by default)
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     goToNext();
  //   }, 8000); // Change slide every 8 seconds
  //   return () => clearInterval(interval);
  // }, [currentIndex]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % totalSlides);
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  // Touch handlers for mobile swipe
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

    if (distance > minSwipeDistance) {
      // Swiped left
      goToNext();
    } else if (distance < -minSwipeDistance) {
      // Swiped right
      goToPrevious();
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Carousel Container */}
      <div
        ref={carouselRef}
        className="relative"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Slides */}
        <div className="relative w-full" style={{ minHeight: '400px' }}>
          {slides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                index === currentIndex
                  ? 'opacity-100 translate-x-0 z-10'
                  : index < currentIndex
                  ? 'opacity-0 -translate-x-full z-0'
                  : 'opacity-0 translate-x-full z-0'
              }`}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      {totalSlides > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-gray-900/80 hover:bg-brit-blue text-white p-4 rounded-full transition-all duration-300 backdrop-blur-sm border-2 border-brit-gold/30 hover:border-brit-gold shadow-lg hover:shadow-glow-blue"
            aria-label="Previous section"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-gray-900/80 hover:bg-brit-blue text-white p-4 rounded-full transition-all duration-300 backdrop-blur-sm border-2 border-brit-gold/30 hover:border-brit-gold shadow-lg hover:shadow-glow-blue"
            aria-label="Next section"
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      {/* Dots Navigation */}
      {totalSlides > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3 bg-gray-900/60 backdrop-blur-md px-6 py-3 rounded-full border border-brit-gold/20">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentIndex
                  ? 'w-12 h-3 bg-brit-gold shadow-glow-gold'
                  : 'w-3 h-3 bg-gray-500 hover:bg-gray-300'
              }`}
              aria-label={`Go to section ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Section Counter */}
      {totalSlides > 1 && (
        <div className="absolute top-8 right-8 z-20 bg-gray-900/80 backdrop-blur-md px-6 py-3 rounded-full border border-brit-gold/30 text-white font-bold text-lg">
          <span className="text-brit-gold">{currentIndex + 1}</span>
          <span className="text-gray-400 mx-2">/</span>
          <span>{totalSlides}</span>
        </div>
      )}
    </div>
  );
};

export default SectionCarousel;
