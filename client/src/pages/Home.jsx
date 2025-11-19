import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI, reviewsAPI, eventsAPI, galleryAPI, teamAPI, settingsAPI } from '../services/api';
import { Calendar, MapPin, Star, ArrowRight, Users, Camera } from 'lucide-react';

// Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Home = () => {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const parallaxRef = useRef(null);

  useEffect(() => {
    loadData();
  }, []);

  // REAL PARALLAX EFFECT
  useEffect(() => {
    const handleScroll = () => {
      if (parallaxRef.current) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5; // Parallax speed
        parallaxRef.current.style.transform = `translate3d(0, ${rate}px, 0)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const loadData = async () => {
    try {
      const [servicesRes, reviewsRes, eventsRes, galleryRes, teamRes, settingsRes] = await Promise.all([
        servicesAPI.getAll(),
        reviewsAPI.getAll(),
        eventsAPI.getAll({ upcoming: true, limit: 3 }),
        galleryAPI.getAll(),
        teamAPI.getAll(),
        settingsAPI.getAll(),
      ]);

      setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
      const reviewsData = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
      setReviews(reviewsData.filter(r => r.is_featured).slice(0, 3));
      setUpcomingEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);
      const galleryData = Array.isArray(galleryRes.data) ? galleryRes.data : [];
      setGalleryImages(galleryData.slice(0, 6));
      setTeamMembers(Array.isArray(teamRes.data) ? teamRes.data : []);

      // Load hero image from settings
      if (settingsRes.data && settingsRes.data.hero_image_url) {
        setHeroImageUrl(settingsRes.data.hero_image_url);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setServices([]);
      setReviews([]);
      setUpcomingEvents([]);
      setGalleryImages([]);
      setTeamMembers([]);
    }
  };

  return (
    <div>
      {/* PARALLAX HERO SECTION */}
      <section className="hero-section">
        {/* Parallax Background Image */}
        {heroImageUrl && (
          <div
            ref={parallaxRef}
            className="hero-parallax-bg"
            style={{
              backgroundImage: `url(${API_BASE_URL}${heroImageUrl})`,
            }}
          />
        )}

        {/* Dark Overlay */}
        <div className="hero-overlay" />

        {/* Hero Content */}
        <div className="hero-content">
          <h1 className="hero-title">
            THE QUIZ MASTER GENERAL
          </h1>
          <p className="hero-subtitle">
            North East England's Premier Quiz & Entertainment
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
            <Link to="/services" className="btn btn-primary">
              Our Services
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              Book Now
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section">
        <div className="container-custom">
          <h2 className="section-title">What We Offer</h2>
          <p className="section-subtitle">
            Professional entertainment services that bring energy and excitement to your venue
          </p>
          <div className="grid-3">
            {services.map((service) => (
              <div key={service.id} className="service-card">
                <div className="service-icon">{service.icon}</div>
                <h3 className="text-3xl font-black mb-4 uppercase">{service.title}</h3>
                <p className="text-gray-300 mb-6 text-lg">{service.description}</p>
                {service.features && service.features.length > 0 && (
                  <ul className="space-y-3 text-left">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-gray-400 flex items-start">
                        <span className="text-brit-gold mr-3 text-xl">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link to="/services" className="btn btn-primary">
              Learn More About Our Services
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      {upcomingEvents.length > 0 && (
        <section className="section">
          <div className="container-custom">
            <h2 className="section-title">Upcoming Events</h2>
            <div className="grid-3">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="card">
                  {event.image_url && (
                    <div className="w-full h-64 -mt-10 -mx-10 mb-6 overflow-hidden rounded-t-3xl">
                      <img
                        src={`${API_BASE_URL}${event.image_url}`}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h3 className="text-2xl font-black mb-4 text-brit-gold uppercase">{event.title}</h3>
                  <div className="flex items-center text-gray-400 mb-3">
                    <Calendar size={18} className="mr-3" />
                    <span className="text-lg">{new Date(event.event_date).toLocaleDateString()}</span>
                  </div>
                  {event.venue_name && (
                    <div className="flex items-center text-gray-400 mb-6">
                      <MapPin size={18} className="mr-3" />
                      <span className="text-lg">{event.venue_name}</span>
                    </div>
                  )}
                  <p className="text-gray-300 text-lg leading-relaxed">{event.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-16">
              <Link to="/events" className="btn btn-secondary">
                View All Events
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section className="section">
          <div className="container-custom">
            <h2 className="section-title">What Venues Say</h2>
            <div className="grid-3">
              {reviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-stars">
                    {[...Array(review.rating || 5)].map((_, i) => (
                      <Star key={i} size={24} fill="currentColor" />
                    ))}
                  </div>
                  <p className="review-text">"{review.review_text}"</p>
                  <div>
                    <p className="review-author">{review.author_name}</p>
                    <p className="text-gray-500 text-base">{review.venue_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photo Gallery Section */}
      {galleryImages.length > 0 && (
        <section className="section">
          <div className="container-custom">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center p-4 bg-brit-red/20 rounded-full mb-6">
                <Camera className="text-brit-red" size={40} />
              </div>
              <h2 className="section-title">See Us in Action</h2>
              <p className="section-subtitle">
                Check out photos from our quiz nights, race nights, and special events across the North East
              </p>
            </div>
            <div className="gallery-grid">
              {galleryImages.map((image) => (
                <div key={image.id} className="gallery-item">
                  <img
                    src={`${API_BASE_URL}${image.image_url}`}
                    alt={image.title || 'Event photo'}
                  />
                  {image.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-6 text-white">
                        <p className="font-black text-xl uppercase">{image.title}</p>
                        {image.category && (
                          <p className="text-brit-gold mt-1">{image.category}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-16">
              <Link to="/gallery" className="btn btn-primary inline-flex items-center">
                View Full Gallery
                <ArrowRight size={24} className="ml-3" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Meet the Team Section */}
      {teamMembers.length > 0 && (
        <section className="section">
          <div className="container-custom">
            <div className="text-center mb-16">
              <div className="inline-flex items-center justify-center p-4 bg-brit-gold/20 rounded-full mb-6">
                <Users className="text-brit-gold" size={40} />
              </div>
              <h2 className="section-title">Meet the Team</h2>
              <p className="section-subtitle">
                Our experienced quiz hosts and entertainers are here to make your event unforgettable
              </p>
            </div>
            <div className="team-grid">
              {teamMembers.slice(0, 3).map((member) => (
                <div key={member.id} className="team-card">
                  {member.image_url ? (
                    <div className="team-avatar">
                      <img
                        src={`${API_BASE_URL}${member.image_url}`}
                        alt={member.name}
                      />
                    </div>
                  ) : (
                    <div className="team-avatar flex items-center justify-center bg-gray-800">
                      <Users size={80} className="text-brit-red" />
                    </div>
                  )}
                  <h3 className="text-3xl font-black mb-2 text-white uppercase">
                    {member.name}
                  </h3>
                  <p className="text-brit-gold font-bold text-xl mb-4 uppercase tracking-wide">{member.role}</p>
                  {member.bio && (
                    <p className="text-gray-400 text-lg leading-relaxed">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
            {teamMembers.length > 3 && (
              <div className="text-center mt-16">
                <Link to="/team" className="btn btn-secondary inline-flex items-center">
                  Meet the Full Team
                  <ArrowRight size={24} className="ml-3" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section" style={{
        background: 'linear-gradient(135deg, #DC143C 0%, #003DA5 100%)'
      }}>
        <div className="container-custom text-center">
          <h2 className="text-5xl md:text-7xl font-black mb-8 text-white uppercase">Ready to Book?</h2>
          <p className="text-2xl md:text-3xl mb-12 max-w-3xl mx-auto text-brit-gold font-bold">
            Get in touch today to discuss your quiz night, race night, or special event requirements.
          </p>
          <Link to="/contact" className="btn btn-secondary text-xl">
            Contact Us Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
