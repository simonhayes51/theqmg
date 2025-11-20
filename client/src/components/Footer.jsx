import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin } from 'lucide-react';
import { settingsAPI } from '../services/api';

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [settings, setSettings] = useState({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.getAll();
      setSettings(response.data || {});
    } catch (error) {
      console.error('Error loading footer settings:', error);
    }
  };

  // Get values from settings or use defaults
  const businessName = settings.business_name || 'The Quiz Master General';
  const tagline = settings.tagline || "North East England's premier quiz and entertainment provider";
  const businessEmail = settings.business_email || 'info@thequizmastergeneral.com';
  const businessPhone = settings.business_phone;
  const coverageArea = settings.business_city || 'Newcastle, Durham, Sunderland & surrounding areas';

  const footerStyle = settings.footer_bg_image
    ? {
        backgroundImage: `url(${API_BASE_URL}${settings.footer_bg_image})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {};

  return (
    <footer style={footerStyle}>
      <div className="container-custom">
        <div className="footer-grid">
          {/* About */}
          <div>
            <h3 className="text-2xl font-black mb-6 uppercase text-brit-gold">{businessName}</h3>
            <p className="text-gray-400 text-lg mb-6">
              {tagline}
            </p>

            {/* Social Media Icons */}
            {(settings.facebook_url || settings.twitter_url || settings.instagram_url || settings.linkedin_url) && (
              <div className="flex gap-4 mt-6">
                {settings.facebook_url && (
                  <a
                    href={settings.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-brit-red/20 border-2 border-brit-red flex items-center justify-center hover:bg-brit-red hover:scale-110 transition-all"
                    aria-label="Facebook"
                  >
                    <Facebook size={20} className="text-white" />
                  </a>
                )}
                {settings.twitter_url && (
                  <a
                    href={settings.twitter_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-brit-blue/20 border-2 border-brit-blue flex items-center justify-center hover:bg-brit-blue hover:scale-110 transition-all"
                    aria-label="Twitter"
                  >
                    <Twitter size={20} className="text-white" />
                  </a>
                )}
                {settings.instagram_url && (
                  <a
                    href={settings.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-brit-gold/20 border-2 border-brit-gold flex items-center justify-center hover:bg-brit-gold hover:scale-110 transition-all"
                    aria-label="Instagram"
                  >
                    <Instagram size={20} className="text-gray-900" />
                  </a>
                )}
                {settings.linkedin_url && (
                  <a
                    href={settings.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-full bg-brit-blue/20 border-2 border-brit-blue flex items-center justify-center hover:bg-brit-blue hover:scale-110 transition-all"
                    aria-label="LinkedIn"
                  >
                    <Linkedin size={20} className="text-white" />
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="footer-section h3">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link to="/events" className="footer-link">Events</Link></li>
              <li><Link to="/venues" className="footer-link">Venues</Link></li>
              <li><Link to="/services" className="footer-link">Services</Link></li>
              <li><Link to="/gallery" className="footer-link">Gallery</Link></li>
              <li><Link to="/team" className="footer-link">The Team</Link></li>
              <li><Link to="/contact" className="footer-link">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="footer-section h3">Get In Touch</h3>
            <ul className="space-y-4">
              {businessEmail && (
                <li>
                  <a
                    href={`mailto:${businessEmail}`}
                    className="footer-link flex items-center gap-2"
                  >
                    <Mail size={18} className="text-brit-red" />
                    {businessEmail}
                  </a>
                </li>
              )}
              {businessPhone && (
                <li>
                  <a
                    href={`tel:${businessPhone}`}
                    className="footer-link flex items-center gap-2"
                  >
                    <span className="text-brit-red text-xl">📞</span>
                    {businessPhone}
                  </a>
                </li>
              )}
              {coverageArea && (
                <li className="footer-link flex items-center gap-2">
                  <MapPin size={18} className="text-brit-gold" />
                  <span>Serving {coverageArea}</span>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t-2 border-brit-red/30 text-center">
          <p className="text-gray-400">&copy; {currentYear} {businessName}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
