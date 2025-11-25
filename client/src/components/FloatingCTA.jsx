import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, MessageCircle, X } from 'lucide-react';

const FloatingCTA = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      // Show button after scrolling down 300px
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsExpanded(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-8 right-8 z-50">
      {isExpanded ? (
        // Expanded menu
        <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border-2 border-brit-gold animate-scale-in">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>

          <div className="space-y-3 mt-4">
            <Link
              to="/contact"
              className="flex items-center gap-3 px-6 py-3 bg-brit-blue hover:bg-brit-blue/80 text-white rounded-xl transition-all font-bold hover:scale-105"
            >
              <MessageCircle size={20} />
              <span>Contact Us</span>
            </Link>

            <a
              href="tel:+441234567890"
              className="flex items-center gap-3 px-6 py-3 bg-brit-red hover:bg-brit-red/80 text-white rounded-xl transition-all font-bold hover:scale-105"
            >
              <Phone size={20} />
              <span>Call Now</span>
            </a>
          </div>
        </div>
      ) : (
        // Collapsed button
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-brit-gold hover:bg-brit-gold/90 text-gray-900 font-black px-8 py-4 rounded-full shadow-2xl transition-all duration-300 flex items-center gap-2 hover:scale-110 animate-bounce-slow"
          aria-label="Open booking menu"
        >
          <Phone size={24} />
          <span className="text-lg uppercase tracking-wide">Book Now</span>
        </button>
      )}
    </div>
  );
};

export default FloatingCTA;
