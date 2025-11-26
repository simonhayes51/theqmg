import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI, reviewsAPI, eventsAPI, galleryAPI, teamAPI, settingsAPI } from '../services/api';
import { Calendar, MapPin, Star, ArrowRight, Users, Camera, Award, TrendingUp, Zap, User } from 'lucide-react';
import QuestionOfTheDay from '../components/QuestionOfTheDay';
import SocialMediaFeed from '../components/SocialMediaFeed';
import ItemCarousel from '../components/ItemCarousel';
import FloatingCTA from '../components/FloatingCTA';
import LoadingSkeleton from '../components/LoadingSkeleton';
import ScrollReveal from '../hooks/useScrollAnimation';

// Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Home = () => {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [galleryImages, setGalleryImages] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [heroImageUrl, setHeroImageUrl] = useState('');
  const [settings, setSettings] = useState({
    social_proof_bg_color: '#003DA5',
    services_bg_color: '#DC143C',
    events_bg_color: '#003DA5',
    reviews_bg_color: '#DC143C',
    gallery_bg_color: '#003DA5',
    team_bg_color: '#DC143C'
  });
  const [sectionOrder, setSectionOrder] = useState(['social_proof', 'about', 'services', 'events', 'reviews', 'gallery', 'team', 'social_media', 'question_of_day']);
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

      // Load settings and merge with defaults
      const settingsData = settingsRes.data || {};
      setSettings(prev => ({ ...prev, ...settingsData }));

      // Load section order
      if (settingsData.section_order) {
        try {
          const parsedOrder = JSON.parse(settingsData.section_order);
          if (Array.isArray(parsedOrder)) {
            setSectionOrder(parsedOrder);
          }
        } catch (e) {
          console.error('Error parsing section order:', e);
        }
      }

      // Load hero image from settings
      if (settingsData.hero_image_url) {
        setHeroImageUrl(settingsData.hero_image_url);
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

  // Render section based on key
  const renderSection = (sectionKey) => {
    const sections = {
      'social_proof': (
        <ScrollReveal animation="fade-up" key="social_proof">
          <section className="section" style={{
            backgroundColor: settings.social_proof_bg_color || '#003DA5',
            backgroundImage: settings.social_proof_bg_image ? `url(${API_BASE_URL}${settings.social_proof_bg_image})` : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundBlendMode: 'overlay'
          }}>
            <div className="container-custom">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
                <div className="p-8">
                  <div className="inline-flex items-center justify-center p-4 bg-brit-gold/20 rounded-full mb-4">
                    <Award className="text-brit-gold" size={48} />
                  </div>
                  <h3 className="text-5xl font-black text-brit-gold mb-2">700+</h3>
                  <p className="text-xl text-gray-300">Events Hosted Annually</p>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center justify-center p-4 bg-brit-red/20 rounded-full mb-4">
                    <Users className="text-brit-red" size={48} />
                  </div>
                  <h3 className="text-5xl font-black text-brit-red mb-2">50+</h3>
                  <p className="text-xl text-gray-300">Hospitality Partner Venues</p>
                </div>
                <div className="p-8">
                  <div className="inline-flex items-center justify-center p-4 bg-brit-blue/20 rounded-full mb-4">
                    <TrendingUp className="text-brit-blue" size={48} />
                  </div>
                  <h3 className="text-5xl font-black text-brit-blue mb-2">20+</h3>
                  <p className="text-xl text-gray-300">Years Event Management Experience</p>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      ),
      'about': settings.about_text && (
        <ScrollReveal animation="fade-up" key="about">
          <section className="section bg-white">
            <div className="container-custom">
              <div className="max-w-6xl mx-auto">
                <div className="text-center mb-12">
                  <div className="inline-flex items-center justify-center p-4 bg-brit-navy/10 rounded-full mb-6">
                    <User className="text-brit-navy" size={40} />
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black text-brit-navy uppercase">About Me</h2>
                </div>

                <div className={`flex flex-col ${settings.about_image ? 'md:flex-row' : ''} gap-8 md:gap-12 items-center`}>
                  {settings.about_image && (
                    <div className="w-full md:w-1/2 lg:w-2/5">
                      <img
                        src={`${API_BASE_URL}${settings.about_image}`}
                        alt="About Me"
                        className="rounded-2xl shadow-2xl w-full h-auto object-cover"
                      />
                    </div>
                  )}
                  <div className={`${settings.about_image ? 'w-full md:w-1/2 lg:w-3/5' : 'max-w-4xl mx-auto text-center'}`}>
                    <div className="prose prose-lg max-w-none">
                      <p className="text-lg md:text-xl text-gray-700 leading-relaxed whitespace-pre-line">
                        {settings.about_text}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ScrollReveal>
      ),
      'services': (
        <ScrollReveal animation="fade-up" key="services">
          <section
            className="section"
            style={{
              backgroundColor: settings.services_bg_color || '#DC143C',
              backgroundImage: settings.services_bg_image ? `url(${API_BASE_URL}${settings.services_bg_image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay'
            }}
          >
            <div className="container-custom">
              <h2 className="section-title">{settings.home_services_title || 'What We Offer'}</h2>
              <p className="section-subtitle">
                {settings.home_services_subtitle || 'Professional entertainment services that bring energy and excitement to your venue!'}
              </p>
              {services.length === 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <LoadingSkeleton key={i} type="service" />
                  ))}
                </div>
              ) : (
                <ItemCarousel>
                  {services.map((service, idx) => (
                    <ScrollReveal key={service.id} animation="fade-up" delay={idx * 100}>
                      <div className="service-card h-full">
                        <div className="service-icon">{service.icon}</div>
                        <h3 className="text-3xl font-black mb-4 uppercase">{service.title}</h3>
                        <p className="mb-6 text-lg">{service.description}</p>
                        {service.features && service.features.length > 0 && (
                          <ul className="space-y-3 text-left">
                            {service.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start">
                                <span className="text-brit-gold mr-3 text-xl">✓</span>
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </ScrollReveal>
                  ))}
                </ItemCarousel>
              )}
              <div className="text-center mt-16">
                <Link to="/services" className="btn btn-primary">
                  Learn More About Our Services
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      ),
      'events': upcomingEvents.length > 0 && (
        <ScrollReveal animation="fade-up" key="events">
          <section
            className="section"
            style={{
              backgroundColor: settings.events_bg_color || '#003DA5',
              backgroundImage: settings.events_bg_image ? `url(${API_BASE_URL}${settings.events_bg_image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay'
            }}
          >
            <div className="container-custom">
              <h2 className="section-title">{settings.home_events_title || 'Upcoming Events'}</h2>
              <ItemCarousel>
                {upcomingEvents.map((event, idx) => (
                  <ScrollReveal key={event.id} animation="fade-up" delay={idx * 100}>
                    <div className="card h-full">
                      {event.image_url && (
                        <div className="w-full h-64 -mt-8 -mx-8 mb-6 overflow-hidden rounded-t-3xl">
                          <img
                            src={`${API_BASE_URL}${event.image_url}`}
                            alt={event.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      )}
                      <h3 className="text-2xl font-black mb-4 text-brit-gold uppercase">{event.title}</h3>
                      <div className="flex items-center text-gray-300 mb-3">
                        <Calendar size={18} className="mr-3 text-brit-gold" />
                        <span className="text-lg">{new Date(event.event_date).toLocaleDateString()}</span>
                      </div>
                      {event.venue_name && (
                        <div className="flex items-center text-gray-300 mb-6">
                          <MapPin size={18} className="mr-3 text-brit-gold" />
                          <span className="text-lg">{event.venue_name}</span>
                        </div>
                      )}
                      <p className="text-lg leading-relaxed">{event.description}</p>
                    </div>
                  </ScrollReveal>
                ))}
              </ItemCarousel>
              <div className="text-center mt-16">
                <Link to="/events" className="btn btn-secondary">
                  View All Events
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      ),
      'reviews': reviews.length > 0 && (
        <ScrollReveal animation="fade-up" key="reviews">
          <section
            className="section"
            style={{
              backgroundColor: settings.reviews_bg_color || 'rgba(220, 20, 60, 0.9)',
              backgroundImage: settings.reviews_bg_image ? `url(${API_BASE_URL}${settings.reviews_bg_image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay'
            }}
          >
            <div className="container-custom">
              <h2 className="section-title">{settings.home_reviews_title || 'What Venues Say'}</h2>
              <ItemCarousel>
                {reviews.map((review, idx) => (
                  <ScrollReveal key={review.id} animation="fade-up" delay={idx * 100}>
                    <div className="review-card h-full">
                      <div className="review-stars">
                        {[...Array(review.rating || 5)].map((_, i) => (
                          <Star key={i} size={24} fill="currentColor" />
                        ))}
                      </div>
                      <p className="review-text">"{review.review_text}"</p>
                      <div>
                        <p className="review-author">{review.author_name}</p>
                        <p className="text-gray-300 text-base">{review.venue_name}</p>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </ItemCarousel>
            </div>
          </section>
        </ScrollReveal>
      ),
      'gallery': galleryImages.length > 0 && (
        <ScrollReveal animation="fade-up" key="gallery">
          <section
            className="section"
            style={{
              backgroundColor: settings.gallery_bg_color || '#003DA5',
              backgroundImage: settings.gallery_bg_image ? `url(${API_BASE_URL}${settings.gallery_bg_image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay'
            }}
          >
            <div className="container-custom">
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center p-4 bg-brit-red/20 rounded-full mb-6">
                  <Camera className="text-brit-red" size={40} />
                </div>
                <h2 className="section-title">{settings.home_gallery_title || 'See Us in Action'}</h2>
              </div>
              <ItemCarousel>
                {galleryImages.map((image, idx) => (
                  <ScrollReveal key={image.id} animation="scale-up" delay={idx * 100}>
                    <div className="gallery-item">
                      <img
                        src={`${API_BASE_URL}${image.image_url}`}
                        alt={image.title || 'Event photo'}
                        loading="lazy"
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
                  </ScrollReveal>
                ))}
              </ItemCarousel>
              <div className="text-center mt-16">
                <Link to="/gallery" className="btn btn-primary inline-flex items-center">
                  View Full Gallery
                  <ArrowRight size={24} className="ml-3" />
                </Link>
              </div>
            </div>
          </section>
        </ScrollReveal>
      ),
      'team': teamMembers.length > 0 && (
        <ScrollReveal animation="fade-up" key="team">
          <section
            className="section"
            style={{
              backgroundColor: settings.team_bg_color || '#DC143C',
              backgroundImage: settings.team_bg_image ? `url(${API_BASE_URL}${settings.team_bg_image})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundBlendMode: 'overlay'
            }}
          >
            <div className="container-custom">
              <div className="text-center mb-16">
                <div className="inline-flex items-center justify-center p-4 bg-brit-gold/20 rounded-full mb-6">
                  <Users className="text-brit-gold" size={40} />
                </div>
                <h2 className="section-title">{settings.home_team_title || 'Meet the Team'}</h2>
              </div>
              <ItemCarousel>
                {teamMembers.map((member, idx) => (
                  <ScrollReveal key={member.id} animation="fade-up" delay={idx * 100}>
                    <div className="team-card">
                      {member.image_url ? (
                        <div className="team-avatar">
                          <img
                            src={`${API_BASE_URL}${member.image_url}`}
                            alt={member.name}
                            loading="lazy"
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
                        <p className="text-gray-300 text-lg leading-relaxed">{member.bio}</p>
                      )}
                    </div>
                  </ScrollReveal>
                ))}
              </ItemCarousel>
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
        </ScrollReveal>
      ),
      'question_of_day': <QuestionOfTheDay key="question_of_day" />,
      'social_media': <SocialMediaFeed key="social_media" />
    };

    return sections[sectionKey] || null;
  };

  return (
    <div>
      {/* Skip to Content Link for Accessibility */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>

      {/* Floating CTA Button */}
      <FloatingCTA />
    <div id="main-content">
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
            {settings.hero_title || 'THE QUIZ MASTER GENERAL'}
          </h1>
          <p className="hero-subtitle">
            {settings.hero_subtitle || "North East England's Premier Quiz & Entertainment"}
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center mt-8">
            <Link to="/services" className="btn btn-primary">
              {settings.hero_button_1_text || 'Our Services'}
            </Link>
            <Link to="/contact" className="btn btn-secondary">
              {settings.hero_button_2_text || 'Book Now'}
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Sections Based on Section Order */}
      {sectionOrder.map(key => renderSection(key))}

      {/* CTA Section */}
      <ScrollReveal animation="scale-up">
        <section className="section" style={{
          background: 'linear-gradient(135deg, #DC143C 0%, #003DA5 100%)'
        }}>
          <div className="container-custom text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-6">
              <Zap className="text-white" size={48} />
            </div>
            <h2 className="text-5xl md:text-7xl font-black mb-8 text-white uppercase">Get In Touch Today To Book Your Event</h2>
            <p className="text-2xl md:text-3xl mb-12 max-w-3xl mx-auto text-brit-gold font-bold">
              Ready to book? Contact us to discuss your quiz night, race night, or special event requirements.
            </p>
            <Link to="/contact" className="btn btn-secondary text-xl hover:scale-105 transform transition-transform">
              Contact Us Now
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
    </div>
  );
};

export default Home;
