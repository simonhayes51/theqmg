import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gradient-britpop text-white mod-border">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-xl font-heading mb-4">The Quiz Master General</h3>
            <p className="text-sm text-gray-200">
              North East England's premier quiz and entertainment provider.
              Bringing fun, laughter, and competition to venues across the region.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-heading mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/events" className="hover:text-quiz-red transition-colors">Events</Link></li>
              <li><Link to="/venues" className="hover:text-quiz-red transition-colors">Venues</Link></li>
              <li><Link to="/services" className="hover:text-quiz-red transition-colors">Services</Link></li>
              <li><Link to="/team" className="hover:text-quiz-red transition-colors">The Team</Link></li>
              <li><Link to="/contact" className="hover:text-quiz-red transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-heading mb-4">Get In Touch</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="mailto:info@thequizmastergeneral.com" className="hover:text-quiz-red transition-colors">
                  info@thequizmastergeneral.com
                </a>
              </li>
              <li className="text-gray-200">
                Serving Newcastle, Durham, Sunderland & surrounding areas
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm">
          <p>&copy; {currentYear} The Quiz Master General. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
