import { useEffect, useState } from 'react';
import { teamAPI } from '../services/api';
import { Mail } from 'lucide-react';

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
      <div className="min-h-screen bg-quiz-gray">
        <div className="bg-gradient-britpop text-white py-16">
          <div className="container-custom">
            <h1 className="text-4xl md:text-6xl font-heading mb-4">Meet The Team</h1>
            <p className="text-xl">Loading our amazing team...</p>
          </div>
        </div>
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="w-32 h-32 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3 mx-auto"></div>
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
          <button onClick={loadTeam} className="btn btn-primary">
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
          <h1 className="text-4xl md:text-6xl font-heading mb-4">Meet The Team</h1>
          <p className="text-xl">The professionals who bring the fun to your venue</p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="section">
        <div className="container-custom">
          {team.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">👥</div>
              <h3 className="text-2xl font-heading mb-2 text-quiz-blue">Team Info Coming Soon</h3>
              <p className="text-gray-600 mb-6">Check back soon to meet our amazing quizmasters!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {team.map((member, index) => (
                <div
                  key={member.id}
                  className="card text-center hover:shadow-xl transition-all duration-300"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Profile Image */}
                  {member.image_url ? (
                    <img
                      src={`${API_BASE_URL}${member.image_url}`}
                      alt={member.name}
                      className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-quiz-blue"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full mx-auto mb-4 bg-gradient-britpop flex items-center justify-center text-white text-4xl font-heading border-4 border-quiz-blue">
                      {member.name?.charAt(0) || '?'}
                    </div>
                  )}

                  {/* Name */}
                  <h3 className="text-2xl font-heading mb-2 text-quiz-blue">
                    {member.name}
                  </h3>

                  {/* Role */}
                  {member.role && (
                    <p className="text-quiz-red font-semibold mb-3 uppercase tracking-wide text-sm">
                      {member.role}
                    </p>
                  )}

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-gray-700 text-sm mb-4 px-2">
                      {member.bio}
                    </p>
                  )}

                  {/* Specialties */}
                  {member.specialties && member.specialties.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex flex-wrap gap-2 justify-center">
                        {member.specialties.map((specialty, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-quiz-gray text-quiz-blue text-xs font-semibold rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Contact */}
                  {member.email && (
                    <div className="mt-4">
                      <a
                        href={`mailto:${member.email}`}
                        className="inline-flex items-center text-quiz-blue hover:text-quiz-navy text-sm"
                      >
                        <Mail size={16} className="mr-1" />
                        Contact
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Join the Team CTA */}
      <section className="section bg-white">
        <div className="container-custom text-center">
          <h2 className="text-3xl font-heading mb-4 text-quiz-blue">Want to Join Our Team?</h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            We're always looking for talented quizmasters and entertainers to join our team.
          </p>
          <a href="/contact" className="btn btn-primary">
            Get In Touch
          </a>
        </div>
      </section>
    </div>
  );
};

export default Team;
