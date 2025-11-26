import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { servicesAPI, settingsAPI } from '../services/api';
import { Sparkles, Check, Zap } from 'lucide-react';
import ScrollReveal from '../hooks/useScrollAnimation';
import LoadingSkeleton from '../components/LoadingSkeleton';

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
      <div className="min-h-screen bg-gray-950">
        <div className="bg-gradient-to-r from-brit-navy to-brit-blue text-white py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-6xl font-heading mb-4">Our Services</h1>
            <p className="text-xl">Loading our amazing services...</p>
          </div>
        </div>
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-16 w-16 bg-gray-700 rounded-full mb-4"></div>
                <div className="h-6 bg-gray-700 rounded mb-4"></div>
                <div className="h-4 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-heading mb-4 text-brit-red">Oops!</h2>
          <p className="text-gray-200 mb-6">{error}</p>
          <button onClick={loadServices} className="btn btn-primary">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <ScrollReveal animation="fade-down">
        <section className="hero-section" style={{
          background: 'linear-gradient(135deg, #003DA5 0%, #DC143C 100%)',
          minHeight: '50vh'
        }}>
          <div className="hero-overlay" />
          <div className="hero-content">
            <h1 className="hero-title">{settings.services_page_title || 'Our Services'}</h1>
            <p className="hero-subtitle">{settings.services_page_subtitle || 'Professional entertainment for your venue'}</p>
          </div>
        </section>
      </ScrollReveal>

      {/* Services Grid */}
      <section className="section bg-gray-950">
        <div className="container-custom">
          {services.length === 0 ? (
            <ScrollReveal animation="fade-up">
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="text-2xl font-heading mb-2 text-brit-gold">No Services Available</h3>
                <p className="text-gray-300 mb-6 text-lg">Check back soon for our service offerings!</p>
                <Link to="/contact" className="btn btn-primary">
                  Contact Us for Custom Services
                </Link>
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service, index) => (
                <ScrollReveal key={service.id} animation="fade-up" delay={index * 100}>
                  <div className="service-card h-full flex flex-col">
                    {/* Icon */}
                    <div className="service-icon">
                      {service.icon || '🎯'}
                    </div>

                    {/* Title */}
                    <h3 className="text-3xl font-black mb-4 text-center uppercase">
                      {service.title}
                    </h3>

                    {/* Description */}
                    <p className="mb-6 text-center text-lg">
                      {service.description}
                    </p>

                    {/* Features */}
                    {service.features && service.features.length > 0 && (
                      <div className="space-y-3 mb-6 flex-grow">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start">
                            <Check size={20} className="text-brit-gold mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-base">{feature}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA Button */}
                    <div className="mt-auto pt-6">
                      <Link
                        to="/contact"
                        className="btn btn-primary w-full text-center hover:scale-105 transform transition-transform"
                      >
                        Book This Service
                      </Link>
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <ScrollReveal animation="fade-up">
        <section className="section bg-gradient-to-b from-gray-900 to-gray-950">
          <div className="container-custom">
            <h2 className="section-title">Why Choose The Quiz Master General?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <ScrollReveal animation="scale-up" delay={0}>
                <div className="text-center p-6 rounded-2xl bg-gray-900/50 border-2 border-brit-gold/20 hover:border-brit-gold/50 transition-all">
                  <div className="text-5xl mb-4">🎤</div>
                  <h3 className="text-xl font-heading mb-2 text-brit-gold">Professional Hosts</h3>
                  <p className="text-gray-300 text-base">Experienced quizmasters who engage and entertain</p>
                </div>
              </ScrollReveal>
              <ScrollReveal animation="scale-up" delay={100}>
                <div className="text-center p-6 rounded-2xl bg-gray-900/50 border-2 border-brit-gold/20 hover:border-brit-gold/50 transition-all">
                  <div className="text-5xl mb-4">🎵</div>
                  <h3 className="text-xl font-heading mb-2 text-brit-gold">Quality Equipment</h3>
                  <p className="text-gray-300 text-base">Professional sound and lighting equipment included</p>
                </div>
              </ScrollReveal>
              <ScrollReveal animation="scale-up" delay={200}>
                <div className="text-center p-6 rounded-2xl bg-gray-900/50 border-2 border-brit-gold/20 hover:border-brit-gold/50 transition-all">
                  <div className="text-5xl mb-4">📅</div>
                  <h3 className="text-xl font-heading mb-2 text-brit-gold">Flexible Scheduling</h3>
                  <p className="text-gray-300 text-base">Weekly, monthly, or one-off events available</p>
                </div>
              </ScrollReveal>
              <ScrollReveal animation="scale-up" delay={300}>
                <div className="text-center p-6 rounded-2xl bg-gray-900/50 border-2 border-brit-gold/20 hover:border-brit-gold/50 transition-all">
                  <div className="text-5xl mb-4">💰</div>
                  <h3 className="text-xl font-heading mb-2 text-brit-gold">Increase Revenue</h3>
                  <p className="text-gray-300 text-base">Boost midweek footfall and bar sales</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* CTA Section */}
      <ScrollReveal animation="scale-up">
        <section className="section" style={{
          background: 'linear-gradient(135deg, #DC143C 0%, #003DA5 100%)'
        }}>
          <div className="container-custom text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-6">
              <Zap className="text-white" size={48} />
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white uppercase">Ready to Book?</h2>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-white">
              Get in touch today to discuss how we can bring entertainment to your venue!
            </p>
            <Link to="/contact" className="btn btn-secondary text-lg hover:scale-105 transform transition-transform">
              Contact Us Today
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
};

export default Services;
