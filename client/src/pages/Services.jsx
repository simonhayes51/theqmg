import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI, settingsAPI } from '../services/api';
import { Sparkles, Check } from 'lucide-react';

const Services = () => {
  const [services, setServices] = useState([]);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      setLoading(true);
      setError(null);
      const [servicesRes, settingsRes] = await Promise.all([
        servicesAPI.getAll(),
        settingsAPI.getAll()
      ]);
      setServices(Array.isArray(servicesRes.data) ? servicesRes.data : []);
      setSettings(settingsRes.data || {});
    } catch (error) {
      console.error('Error loading services:', error);
      setError('Failed to load services. Please try again later.');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-quiz-gray">
        <div className="bg-gradient-britpop text-white py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-6xl font-heading mb-4">Our Services</h1>
            <p className="text-xl">Loading our amazing services...</p>
          </div>
        </div>
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-16 w-16 bg-gray-300 rounded-full mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-quiz-gray flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-heading mb-4 text-quiz-red">Oops!</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button onClick={loadServices} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-quiz-gray">
      {/* Hero Section */}
      <section className="bg-gradient-britpop text-white py-16">
        <div className="container-custom">
          <h1 className="text-4xl md:text-6xl font-heading mb-4">{settings.services_page_title || 'Our Services'}</h1>
          <p className="text-xl">{settings.services_page_subtitle || 'Professional entertainment for your venue'}</p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section">
        <div className="container-custom">
          {services.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🎯</div>
              <h3 className="text-2xl font-heading mb-2 text-quiz-blue">No Services Available</h3>
              <p className="text-gray-600 mb-6">Check back soon for our service offerings!</p>
              <Link to="/contact" className="btn btn-primary">
                Contact Us for Custom Services
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <div
                  key={service.id}
                  className="card hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Icon */}
                  <div className="text-6xl mb-6 text-center">
                    {service.icon || '🎯'}
                  </div>

                  {/* Title */}
                  <h3 className="text-2xl font-heading mb-4 text-quiz-blue text-center">
                    {service.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-700 mb-6 text-center">
                    {service.description}
                  </p>

                  {/* Features */}
                  {service.features && service.features.length > 0 && (
                    <div className="space-y-3 mb-6">
                      {service.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start">
                          <Check size={20} className="text-quiz-red mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA Button */}
                  <div className="mt-auto pt-4">
                    <Link
                      to="/contact"
                      className="btn btn-primary w-full text-center"
                    >
                      Book This Service
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="section bg-white">
        <div className="container-custom">
          <h2 className="section-title">Why Choose The Quiz Master General?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl mb-4">🎤</div>
              <h3 className="text-xl font-heading mb-2 text-quiz-blue">Professional Hosts</h3>
              <p className="text-gray-600">Experienced quizmasters who engage and entertain</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">🎵</div>
              <h3 className="text-xl font-heading mb-2 text-quiz-blue">Quality Equipment</h3>
              <p className="text-gray-600">Professional sound and lighting equipment included</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-heading mb-2 text-quiz-blue">Flexible Scheduling</h3>
              <p className="text-gray-600">Weekly, monthly, or one-off events available</p>
            </div>
            <div className="text-center">
              <div className="text-5xl mb-4">💰</div>
              <h3 className="text-xl font-heading mb-2 text-quiz-blue">Increase Revenue</h3>
              <p className="text-gray-600">Boost midweek footfall and bar sales</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-red text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-heading mb-4">Ready to Book a Service?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Get in touch today to discuss how we can bring entertainment to your venue.
          </p>
          <Link to="/contact" className="btn btn-outline bg-white/10 text-lg">
            Contact Us Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Services;
