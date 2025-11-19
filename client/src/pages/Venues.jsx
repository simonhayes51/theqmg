import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { venuesAPI } from '../services/api';
import { MapPin, Phone, Mail, Users, Search } from 'lucide-react';

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
      <div className="min-h-screen bg-quiz-gray">
        <div className="bg-gradient-britpop text-white py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-6xl font-heading mb-4">Our Venues</h1>
            <p className="text-xl">Loading our partner venues...</p>
          </div>
        </div>
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card animate-pulse">
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
          <button onClick={loadVenues} className="btn btn-primary">
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
          <h1 className="text-4xl md:text-6xl font-heading mb-4">Our Partner Venues</h1>
          <p className="text-xl">Bringing entertainment to venues across the North East</p>
        </div>
      </section>

      {/* Search */}
      {venues.length > 0 && (
        <section className="bg-white border-b-2 border-quiz-blue py-6">
          <div className="container-custom">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search venues by name or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
          </div>
        </section>
      )}

      {/* Venues Grid */}
      <section className="section">
        <div className="container-custom">
          {filteredVenues.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-2xl font-heading mb-2 text-quiz-blue">
                {searchTerm ? 'No Matching Venues' : 'No Venues Listed Yet'}
              </h3>
              <p className="text-gray-600 mb-6">
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
          ) : (
            <>
              <div className="text-center mb-8">
                <p className="text-gray-600">
                  Showing {filteredVenues.length} {filteredVenues.length === 1 ? 'venue' : 'venues'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredVenues.map((venue) => (
                  <div
                    key={venue.id}
                    className="card hover:shadow-xl transition-all duration-300"
                  >
                    {/* Venue Name */}
                    <h3 className="text-2xl font-heading mb-4 text-quiz-blue">
                      {venue.name}
                    </h3>

                    {/* Address */}
                    {(venue.address || venue.city || venue.postcode) && (
                      <div className="flex items-start mb-3 text-gray-700">
                        <MapPin size={18} className="mr-2 mt-0.5 flex-shrink-0 text-quiz-red" />
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
                        <div className="flex items-center text-gray-700 text-sm">
                          <Phone size={16} className="mr-2 text-quiz-blue" />
                          <a href={`tel:${venue.phone}`} className="hover:text-quiz-blue">
                            {venue.phone}
                          </a>
                        </div>
                      )}
                      {venue.email && (
                        <div className="flex items-center text-gray-700 text-sm">
                          <Mail size={16} className="mr-2 text-quiz-blue" />
                          <a href={`mailto:${venue.email}`} className="hover:text-quiz-blue break-all">
                            {venue.email}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {venue.description && (
                      <p className="text-gray-600 text-sm mb-4">
                        {venue.description}
                      </p>
                    )}

                    {/* View Events Button */}
                    <div className="mt-auto pt-4 border-t border-gray-200">
                      <Link
                        to="/events"
                        className="text-quiz-blue hover:text-quiz-navy font-semibold text-sm"
                      >
                        View Events at This Venue →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-gradient-red text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-heading mb-4">Want Your Venue Featured?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Partner with us to bring professional quiz nights and entertainment to your venue.
          </p>
          <Link to="/contact" className="btn btn-outline bg-white/10 text-lg">
            Become a Partner Venue
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Venues;
