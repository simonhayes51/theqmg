import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { venuesAPI } from '../services/api';
import { MapPin, Phone, Mail, Users, Search, Zap } from 'lucide-react';
import VenueMap from '../components/VenueMap';
import ScrollReveal from '../hooks/useScrollAnimation';

const Venues = () => {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadVenues();
  }, []);

  const loadVenues = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await venuesAPI.getAll();
      setVenues(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading venues:', error);
      setError('Failed to load venues. Please try again later.');
      setVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredVenues = venues.filter(venue =>
    !searchTerm ||
    venue.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    venue.postcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="bg-gradient-to-r from-brit-navy to-brit-blue text-white py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-6xl font-heading mb-4">Our Venues</h1>
            <p className="text-xl text-gray-200">Loading our partner venues...</p>
          </div>
        </div>
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card bg-gray-900 animate-pulse">
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
        <div className="card max-w-md text-center bg-gray-900">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-heading mb-4 text-brit-red">Oops!</h2>
          <p className="text-gray-200 mb-6">{error}</p>
          <button onClick={loadVenues} className="btn btn-primary">
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
            <h1 className="hero-title">Our Partner Venues</h1>
            <p className="hero-subtitle">Bringing entertainment to venues across the North East</p>
          </div>
        </section>
      </ScrollReveal>

      {/* Search */}
      {venues.length > 0 && (
        <section className="bg-gray-900 border-b-2 border-brit-gold/30 py-6">
          <div className="container-custom">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search venues by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full bg-gray-800 border-gray-700 text-gray-200 placeholder-gray-500"
              />
            </div>
          </div>
        </section>
      )}

      {/* Map Section */}
      {venues.length > 0 && (
        <ScrollReveal animation="fade-up">
          <section className="section bg-gray-900">
            <div className="container-custom">
              <h2 className="text-3xl font-heading text-brit-gold mb-6 text-center">Venue Locations</h2>
              <VenueMap venues={filteredVenues} height="600px" />
            </div>
          </section>
        </ScrollReveal>
      )}

      {/* Venues Grid */}
      <section className="section bg-gray-950">
        <div className="container-custom">
          {filteredVenues.length === 0 ? (
            <ScrollReveal animation="fade-up">
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-2xl font-heading mb-2 text-brit-gold">
                  {searchTerm ? 'No Matching Venues' : 'No Venues Listed Yet'}
                </h3>
                <p className="text-gray-300 mb-6 text-lg">
                  {searchTerm ? 'Try adjusting your search term' : 'Check back soon for our partner venues!'}
                </p>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="btn btn-outline"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            </ScrollReveal>
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-gray-300 text-lg">
                  Showing {filteredVenues.length} {filteredVenues.length === 1 ? 'venue' : 'venues'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVenues.map((venue, index) => (
                  <ScrollReveal key={venue.id} animation="fade-up" delay={index * 100}>
                    <div className="service-card h-full flex flex-col">
                      {/* Venue Name */}
                      <h3 className="text-2xl font-black mb-4 text-center uppercase" style={{color: '#f0f0f0'}}>
                        {venue.name}
                      </h3>

                      {/* Address */}
                      {(venue.address || venue.city || venue.postcode) && (
                        <div className="flex items-start mb-3" style={{color: '#f0f0f0'}}>
                          <MapPin size={18} className="mr-2 mt-0.5 flex-shrink-0 text-brit-red" />
                          <div className="text-sm">
                            {venue.address && <div>{venue.address}</div>}
                            {venue.city && <div>{venue.city}</div>}
                            {venue.postcode && <div>{venue.postcode}</div>}
                          </div>
                        </div>
                      )}

                      {/* Contact Info */}
                      <div className="space-y-2 mb-4">
                        {venue.phone && (
                          <div className="flex items-center text-gray-300 text-sm">
                            <Phone size={16} className="mr-2 text-brit-gold" />
                            <a href={`tel:${venue.phone}`} className="hover:text-brit-gold transition-colors">
                              {venue.phone}
                            </a>
                          </div>
                        )}
                        {venue.email && (
                          <div className="flex items-center text-gray-300 text-sm">
                            <Mail size={16} className="mr-2 text-brit-gold" />
                            <a href={`mailto:${venue.email}`} className="hover:text-brit-gold break-all transition-colors">
                              {venue.email}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      {venue.description && (
                        <p className="text-gray-300 text-base mb-4">
                          {venue.description}
                        </p>
                      )}

                      {/* View Events Button */}
                      <div className="mt-auto pt-6 border-t border-gray-700">
                        <Link
                          to="/events"
                          className="text-brit-gold hover:text-brit-red font-semibold text-sm transition-colors flex items-center"
                        >
                          View Events at This Venue →
                        </Link>
                      </div>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <ScrollReveal animation="scale-up">
        <section className="section" style={{
          background: 'linear-gradient(135deg, #DC143C 0%, #003DA5 100%)'
        }}>
          <div className="container-custom text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-6">
              <Zap className="text-white" size={48} />
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white uppercase">Want Your Venue Featured?</h2>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-white">
              Partner with us to bring professional quiz nights and entertainment to your venue.
            </p>
            <Link to="/contact" className="btn btn-secondary text-lg hover:scale-105 transform transition-transform">
              Become a Partner Venue
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
};

export default Venues;
