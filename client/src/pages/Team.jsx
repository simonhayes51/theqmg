import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { teamAPI } from '../services/api';
import { Mail, Zap } from 'lucide-react';
import ScrollReveal from '../hooks/useScrollAnimation';

// Get API URL from environment
const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const Team = () => {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadTeam();
  }, []);

  const loadTeam = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await teamAPI.getAll();
      setTeam(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading team:', error);
      setError('Failed to load team members. Please try again later.');
      setTeam([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <div className="bg-gradient-to-r from-brit-navy to-brit-blue text-white py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-6xl font-heading mb-4">Meet The Team</h1>
            <p className="text-xl text-gray-200">Loading our amazing team...</p>
          </div>
        </div>
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card bg-gray-900 animate-pulse">
                <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-2/3 mx-auto"></div>
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
          <button onClick={loadTeam} className="btn btn-primary">
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
            <h1 className="hero-title">Meet The Team</h1>
            <p className="hero-subtitle">The professionals who bring the fun to your venue</p>
          </div>
        </section>
      </ScrollReveal>

      {/* Team Grid */}
      <section className="section bg-gray-950">
        <div className="container-custom">
          {team.length === 0 ? (
            <ScrollReveal animation="fade-up">
              <div className="text-center py-16">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-2xl font-heading mb-2 text-brit-gold">Team Info Coming Soon</h3>
                <p className="text-gray-300 mb-6 text-lg">Check back soon to meet our amazing quizmasters!</p>
              </div>
            </ScrollReveal>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <ScrollReveal key={member.id} animation="fade-up" delay={index * 100}>
                  <div className="service-card text-center h-full flex flex-col">
                    {/* Profile Image */}
                    {member.image_url ? (
                      <img
                        src={`${API_BASE_URL}${member.image_url}`}
                        alt={member.name}
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-brit-gold"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl font-heading border-4 border-brit-gold" style={{
                        background: 'linear-gradient(135deg, #003DA5 0%, #DC143C 100%)'
                      }}>
                        {member.name?.charAt(0) || '?'}
                      </div>
                    )}

                    {/* Name */}
                    <h3 className="text-3xl font-black mb-2 uppercase" style={{color: '#f0f0f0'}}>
                      {member.name}
                    </h3>

                    {/* Role */}
                    {member.role && (
                      <p className="text-brit-gold font-semibold mb-3 uppercase tracking-wide text-sm">
                        {member.role}
                      </p>
                    )}

                    {/* Bio */}
                    {member.bio && (
                      <p className="text-gray-300 text-base mb-4 px-2">
                        {member.bio}
                      </p>
                    )}

                    {/* Specialties */}
                    {member.specialties && member.specialties.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <div className="flex flex-wrap gap-2 justify-center">
                          {member.specialties.map((specialty, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-gray-800 text-brit-gold text-xs font-semibold rounded-full border border-brit-gold/30"
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Contact */}
                    {member.email && (
                      <div className="mt-auto pt-4">
                        <a
                          href={`mailto:${member.email}`}
                          className="inline-flex items-center text-brit-gold hover:text-brit-red text-sm transition-colors"
                        >
                          <Mail size={16} className="mr-1" />
                          Contact
                        </a>
                      </div>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Join the Team CTA */}
      <ScrollReveal animation="scale-up">
        <section className="section" style={{
          background: 'linear-gradient(135deg, #DC143C 0%, #003DA5 100%)'
        }}>
          <div className="container-custom text-center">
            <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-6">
              <Zap className="text-white" size={48} />
            </div>
            <h2 className="text-5xl md:text-6xl font-black mb-6 text-white uppercase">Want to Join Our Team?</h2>
            <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-white">
              We're always looking for talented quizmasters and entertainers to join our team.
            </p>
            <Link to="/contact" className="btn btn-secondary text-lg hover:scale-105 transform transition-transform">
              Get In Touch Today
            </Link>
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
};

export default Team;
