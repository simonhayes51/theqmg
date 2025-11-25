import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { teamAPI } from '../services/api';
import { Mail, ArrowLeft, MapPin, Calendar, Award, Zap } from 'lucide-react';
import ScrollReveal from '../hooks/useScrollAnimation';

// Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const TeamMember = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadMember();
  }, [id]);

  const loadMember = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teamAPI.getOne(id);
      setMember(response.data);
    } catch (error) {
      console.error('Error loading team member:', error);
      setError('Failed to load team member details. Please try again later.');
      setMember(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="bg-gradient-to-r from-brit-navy to-brit-blue text-white py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-6xl font-heading mb-4">Loading...</h1>
          </div>
        </div>
        <div className="container-custom py-12">
          <div className="service-card animate-pulse">
            <div className="w-48 h-48 bg-gray-700 rounded-full mx-auto mb-6"></div>
            <div className="h-8 bg-gray-700 rounded mb-4 max-w-md mx-auto"></div>
            <div className="h-6 bg-gray-700 rounded mb-4 max-w-sm mx-auto"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="card max-w-md text-center bg-gray-900">
          <div className="text-6xl mb-4">😞</div>
          <h2 className="text-2xl font-heading mb-4 text-brit-red">Oops!</h2>
          <p className="text-gray-200 mb-6">{error || 'Team member not found'}</p>
          <div className="flex gap-4 justify-center">
            <button onClick={loadMember} className="btn btn-primary">
              Try Again
            </button>
            <Link to="/team" className="btn btn-outline">
              Back to Team
            </Link>
          </div>
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
            <Link
              to="/team"
              className="inline-flex items-center text-white hover:text-brit-gold transition-colors mb-6 text-lg"
            >
              <ArrowLeft size={24} className="mr-2" />
              Back to Team
            </Link>
            <h1 className="hero-title">{member.name}</h1>
            {member.role && (
              <p className="hero-subtitle text-brit-gold">{member.role}</p>
            )}
          </div>
        </section>
      </ScrollReveal>

      {/* Member Details */}
      <section className="section bg-gray-950">
        <div className="container-custom">
          <div className="max-w-5xl mx-auto">
            <ScrollReveal animation="fade-up">
              <div className="service-card">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                  {/* Profile Section */}
                  <div className="lg:col-span-1 text-center">
                    {/* Profile Image */}
                    {member.image_url ? (
                      <img
                        src={`${API_BASE_URL}${member.image_url}`}
                        alt={member.name}
                        className="w-48 h-48 rounded-full mx-auto mb-6 object-cover border-4 border-brit-gold shadow-2xl"
                      />
                    ) : (
                      <div
                        className="w-48 h-48 rounded-full mx-auto mb-6 flex items-center justify-center text-white text-6xl font-heading border-4 border-brit-gold shadow-2xl"
                        style={{
                          background: 'linear-gradient(135deg, #003DA5 0%, #DC143C 100%)'
                        }}
                      >
                        {member.name?.charAt(0) || '?'}
                      </div>
                    )}

                    {/* Quick Info */}
                    <div className="space-y-4">
                      {member.years_experience && (
                        <div className="flex items-center justify-center text-gray-300">
                          <Calendar size={20} className="mr-2 text-brit-gold" />
                          <span>{member.years_experience} {member.years_experience === 1 ? 'Year' : 'Years'} Experience</span>
                        </div>
                      )}

                      {member.email && (
                        <div>
                          <a
                            href={`mailto:${member.email}`}
                            className="btn btn-primary w-full flex items-center justify-center"
                          >
                            <Mail size={20} className="mr-2" />
                            Contact {member.name.split(' ')[0]}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Section */}
                  <div className="lg:col-span-2">
                    {/* Role Badge */}
                    {member.role && (
                      <div className="mb-6">
                        <span className="inline-block px-6 py-2 bg-gradient-to-r from-brit-navy to-brit-blue text-white rounded-full text-sm font-bold uppercase tracking-wide">
                          {member.role}
                        </span>
                      </div>
                    )}

                    {/* Full Bio */}
                    {member.bio && (
                      <div className="mb-8">
                        <h2 className="text-2xl font-black mb-4 text-brit-gold uppercase">About</h2>
                        <p className="text-gray-300 text-lg leading-relaxed whitespace-pre-wrap">
                          {member.bio}
                        </p>
                      </div>
                    )}

                    {/* Specialties */}
                    {member.specialties && member.specialties.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-2xl font-black mb-4 text-brit-gold uppercase flex items-center">
                          <Award size={24} className="mr-2" />
                          Specialties
                        </h2>
                        <div className="flex flex-wrap gap-3">
                          {member.specialties.map((specialty, idx) => (
                            <span
                              key={idx}
                              className="px-4 py-2 bg-gray-800 text-brit-gold text-sm font-semibold rounded-lg border-2 border-brit-gold/30 hover:border-brit-gold transition-colors"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Venues Hosted */}
                    {member.venues_hosted && member.venues_hosted.length > 0 && (
                      <div className="mb-8">
                        <h2 className="text-2xl font-black mb-4 text-brit-gold uppercase flex items-center">
                          <MapPin size={24} className="mr-2" />
                          Venues Hosted
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {member.venues_hosted.map((venue, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-gray-800/50 rounded-lg border border-gray-700 hover:border-brit-gold/50 transition-colors"
                            >
                              <p className="text-gray-200 font-semibold">{venue}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>

            {/* Stats Cards */}
            {(member.specialties?.length > 0 || member.venues_hosted?.length > 0 || member.years_experience) && (
              <ScrollReveal animation="fade-up" delay={100}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                  {member.years_experience && (
                    <div className="service-card text-center">
                      <div className="text-5xl font-black text-brit-gold mb-2">
                        {member.years_experience}+
                      </div>
                      <p className="text-gray-300 uppercase tracking-wide text-sm">
                        Years Experience
                      </p>
                    </div>
                  )}
                  {member.venues_hosted && member.venues_hosted.length > 0 && (
                    <div className="service-card text-center">
                      <div className="text-5xl font-black text-brit-gold mb-2">
                        {member.venues_hosted.length}+
                      </div>
                      <p className="text-gray-300 uppercase tracking-wide text-sm">
                        Venues Hosted
                      </p>
                    </div>
                  )}
                  {member.specialties && member.specialties.length > 0 && (
                    <div className="service-card text-center">
                      <div className="text-5xl font-black text-brit-gold mb-2">
                        {member.specialties.length}
                      </div>
                      <p className="text-gray-300 uppercase tracking-wide text-sm">
                        Specialties
                      </p>
                    </div>
                  )}
                </div>
              </ScrollReveal>
            )}
          </div>
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
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white uppercase">
              Work With {member.name.split(' ')[0]}
            </h2>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-white">
              Interested in booking {member.name.split(' ')[0]} for your next event? Get in touch with us today!
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/contact" className="btn btn-secondary text-lg hover:scale-105 transform transition-transform">
                Book an Event
              </Link>
              <Link to="/team" className="btn btn-primary text-lg hover:scale-105 transform transition-transform">
                View Full Team
              </Link>
            </div>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
};

export default TeamMember;
