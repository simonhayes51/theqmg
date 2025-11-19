import { useEffect, useState } from 'react';
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

  useEffect(() => {
    loadData();
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

      // Safely handle services data
      setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);

      // Safely handle reviews data
      const reviewsData = Array.isArray(reviewsRes.data) ? reviewsRes.data : [];
      setReviews(reviewsData.filter(r => r.is_featured).slice(0, 3));

      // Safely handle events data
      setUpcomingEvents(Array.isArray(eventsRes.data) ? eventsRes.data : []);

      // Safely handle gallery data - get first 6 images
      const galleryData = Array.isArray(galleryRes.data) ? galleryRes.data : [];
      setGalleryImages(galleryData.slice(0, 6));

      // Safely handle team data
      setTeamMembers(Array.isArray(teamRes.data) ? teamRes.data : []);

      // Load hero image from settings
      if (settingsRes.data && settingsRes.data.hero_image_url) {
        setHeroImageUrl(settingsRes.data.hero_image_url);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set empty arrays on error to prevent crashes
      setServices([]);
      setReviews([]);
      setUpcomingEvents([]);
      setGalleryImages([]);
      setTeamMembers([]);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section
        className="hero-pattern text-white py-24 md:py-32 relative"
        style={heroImageUrl ? {
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(${API_BASE_URL}${heroImageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        } : {}}
      >
        <div className="container-custom relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-heading mb-6 text-shadow">
              THE QUIZ MASTER GENERAL
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-shadow">
              North East England's Premier Quiz & Entertainment Provider
            </p>
            <p className="text-lg mb-8">
              Bringing Fun, Laughter, and Competition to Venues Across the Region
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/services" className="btn btn-secondary text-lg">
                Our Services
              </Link>
              <Link to="/contact" className="btn btn-outline text-lg bg-white/10">
                Book Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section bg-quiz-gray">
        <div className="container-custom">
          <h2 className="section-title">What We Offer</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service) => (
              <div key={service.id} className="card">
                <div className="text-5xl mb-4">{service.icon}</div>
                <h3 className="text-2xl font-heading mb-4 text-quiz-blue">{service.title}</h3>
                <p className="text-gray-700 mb-4">{service.description}</p>
                {service.features && service.features.length > 0 && (
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-start">
                        <span className="text-quiz-red mr-2">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {upcomingEvents.map((event) => (
                <div key={event.id} className="card">
                  {event.image_url && (
                    <img
                      src={`${API_BASE_URL}${event.image_url}`}
                      alt={event.title}
                      className="w-full h-48 object-cover mb-4 -mt-6 -mx-6"
                    />
                  )}
                  <h3 className="text-xl font-heading mb-2 text-quiz-blue">{event.title}</h3>
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Calendar size={16} className="mr-2" />
                    {new Date(event.event_date).toLocaleDateString()}
                  </div>
                  {event.venue_name && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <MapPin size={16} className="mr-2" />
                      {event.venue_name}
                    </div>
                  )}
                  <p className="text-gray-700">{event.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/events" className="btn btn-primary">
                View All Events
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Testimonials */}
      {reviews.length > 0 && (
        <section className="section bg-quiz-blue text-white">
          <div className="container-custom">
            <h2 className="section-title text-white">What Venues Say About Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {reviews.map((review) => (
                <div key={review.id} className="glass p-6 rounded">
                  <div className="flex mb-4">
                    {[...Array(review.rating || 5)].map((_, i) => (
                      <Star key={i} size={20} fill="currentColor" className="text-quiz-red" />
                    ))}
                  </div>
                  <p className="mb-4 italic">"{review.review_text}"</p>
                  <div>
                    <p className="font-heading text-quiz-red">{review.author_name}</p>
                    <p className="text-sm text-gray-200">{review.venue_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photo Gallery Section */}
      {galleryImages.length > 0 && (
        <section className="section bg-quiz-gray">
          <div className="container-custom">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-3 bg-quiz-blue/10 rounded-full mb-4">
                <Camera className="text-quiz-blue" size={32} />
              </div>
              <h2 className="section-title">See Us in Action</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Check out photos from our quiz nights, race nights, and special events across the North East
              </p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {galleryImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative aspect-square overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={`${API_BASE_URL}${image.image_url}`}
                    alt={image.title || 'Event photo'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {image.title && (
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                      <div className="p-4 text-white">
                        <p className="font-heading text-lg">{image.title}</p>
                        {image.category && (
                          <p className="text-sm text-gray-300">{image.category}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/gallery" className="btn btn-primary inline-flex items-center">
                View Full Gallery
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Meet the Team Section */}
      {teamMembers.length > 0 && (
        <section className="section">
          <div className="container-custom">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center p-3 bg-quiz-red/10 rounded-full mb-4">
                <Users className="text-quiz-red" size={32} />
              </div>
              <h2 className="section-title">Meet the Team</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                Our experienced quiz hosts and entertainers are here to make your event unforgettable
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {teamMembers.slice(0, 3).map((member) => (
                <div key={member.id} className="card text-center group hover:shadow-xl transition-shadow">
                  {member.image_url ? (
                    <div className="w-48 h-48 mx-auto mb-4 rounded-full overflow-hidden border-4 border-quiz-blue group-hover:border-quiz-red transition-colors">
                      <img
                        src={`${API_BASE_URL}${member.image_url}`}
                        alt={member.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                  ) : (
                    <div className="w-48 h-48 mx-auto mb-4 rounded-full bg-quiz-gray border-4 border-quiz-blue group-hover:border-quiz-red transition-colors flex items-center justify-center">
                      <Users size={64} className="text-quiz-blue" />
                    </div>
                  )}
                  <h3 className="text-2xl font-heading mb-2 text-quiz-blue group-hover:text-quiz-red transition-colors">
                    {member.name}
                  </h3>
                  <p className="text-quiz-red font-semibold mb-3">{member.role}</p>
                  {member.bio && (
                    <p className="text-gray-700 text-sm">{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
            {teamMembers.length > 3 && (
              <div className="text-center mt-12">
                <Link to="/team" className="btn btn-outline inline-flex items-center">
                  Meet the Full Team
                  <ArrowRight size={20} className="ml-2" />
                </Link>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="section bg-gradient-red text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-heading mb-6">Ready to Book?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get in touch today to discuss your quiz night, race night, or special event requirements.
          </p>
          <Link to="/contact" className="btn btn-outline bg-white/10 text-lg">
            Contact Us Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
