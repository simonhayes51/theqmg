import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI, reviewsAPI, eventsAPI } from '../services/api';
import { Calendar, MapPin, Star } from 'lucide-react';

const Home = () => {
  const [services, setServices] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [servicesRes, reviewsRes, eventsRes] = await Promise.all([
        servicesAPI.getAll(),
        reviewsAPI.getAll(),
        eventsAPI.getAll({ upcoming: true, limit: 3 }),
      ]);
      setServices(servicesRes.data);
      setReviews(reviewsRes.data.filter(r => r.is_featured).slice(0, 3));
      setUpcomingEvents(eventsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-pattern text-white py-24 md:py-32 relative">
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
                      src={`http://localhost:5000${event.image_url}`}
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
