import { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { socialMediaAPI } from '../services/api';

const WhatsAppWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState({
    enabled: false,
    number: '',
    defaultMessage: 'Hi! I\'d like to know more about your quiz nights.'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await socialMediaAPI.getWhatsAppSettings();
      setSettings(response.data);
    } catch (error) {
      console.error('Error loading WhatsApp settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const openWhatsApp = () => {
    // Clean phone number - remove spaces, dashes, parentheses, plus signs
    const cleanNumber = settings.number.replace(/[\s\-\(\)\+]/g, '');
    const message = encodeURIComponent(settings.defaultMessage);
    const whatsappUrl = `https://wa.me/${cleanNumber}?text=${message}`;
    console.log('Opening WhatsApp with URL:', whatsappUrl); // Debug log
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  // Don't show if not enabled or still loading
  if (loading || !settings.enabled || !settings.number) {
    return null;
  }

  return (
    <>
      {/* Floating WhatsApp Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 left-6 bg-green-500 text-white p-4 rounded-full shadow-2xl hover:bg-green-600 transition-all hover:scale-110 z-50 animate-bounce"
          aria-label="Chat on WhatsApp"
        >
          <MessageCircle size={28} />
        </button>
      )}

      {/* WhatsApp Chat Popup */}
      {isOpen && (
        <div className="fixed bottom-6 left-6 w-80 bg-white rounded-2xl shadow-2xl z-50 overflow-hidden border border-gray-200">
          {/* Header */}
          <div className="bg-green-500 text-white p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white rounded-full p-2">
                <MessageCircle className="text-green-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold">Quiz Master General</h3>
                <p className="text-xs text-green-100">Typically replies instantly</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-green-600 rounded-full p-1 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 bg-gray-50">
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <p className="text-gray-700 text-sm mb-2">
                <strong>Hi there! 👋</strong>
              </p>
              <p className="text-gray-600 text-sm">
                Have questions about our quiz nights, venues, or booking?
                Click below to chat with us on WhatsApp!
              </p>
            </div>

            <button
              onClick={openWhatsApp}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <MessageCircle size={20} />
              Start Chat on WhatsApp
            </button>

            <p className="text-xs text-gray-500 text-center mt-3">
              We'll respond as soon as possible
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default WhatsAppWidget;
