import { useEffect, useRef, useState } from 'react';

/**
 * Hook to detect when an element enters the viewport
 * Returns [ref, isVisible] - attach ref to element you want to observe
 */
export const useScrollAnimation = (options = {}) => {
  const { threshold = 0.1, triggerOnce = true } = options;
  const elementRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (triggerOnce && elementRef.current) {
            observer.unobserve(elementRef.current);
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold, triggerOnce]);

  return [elementRef, isVisible];
};

/**
 * Component wrapper for scroll animations
 */
export const ScrollReveal = ({
  children,
  animation = 'fade-up',
  delay = 0,
  className = ''
}) => {
  const [ref, isVisible] = useScrollAnimation();

  const animationClasses = {
    'fade-up': 'translate-y-10 opacity-0',
    'fade-down': '-translate-y-10 opacity-0',
    'fade-left': 'translate-x-10 opacity-0',
    'fade-right': '-translate-x-10 opacity-0',
    'fade-in': 'opacity-0',
    'scale-up': 'scale-90 opacity-0',
  };

  const activeClass = 'translate-y-0 translate-x-0 opacity-100 scale-100';

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        isVisible ? activeClass : animationClasses[animation]
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
