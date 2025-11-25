import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, Users, Image, Settings, Mail, Briefcase, RefreshCw, Shield, Activity, Trophy } from 'lucide-react';
import ScrollReveal from '../../hooks/useScrollAnimation';

const Dashboard = () => {
  const adminSections = [
    { to: '/admin/events', icon: Calendar, label: 'Events', description: 'Manage events and calendar' },
    { to: '/admin/recurring-events', icon: RefreshCw, label: 'Recurring Events', description: 'Auto-generate recurring events' },
    { to: '/admin/venues', icon: MapPin, label: 'Venues', description: 'Manage venue listings' },
    { to: '/admin/services', icon: Briefcase, label: 'Services', description: 'Edit service offerings' },
    { to: '/admin/reviews', icon: Star, label: 'Reviews', description: 'Manage testimonials' },
    { to: '/admin/team', icon: Users, label: 'Team', description: 'Manage team members' },
    { to: '/admin/gallery', icon: Image, label: 'Gallery', description: 'Upload & manage images' },
    { to: '/admin/questions', icon: Trophy, label: 'Quiz Questions', description: 'Manage daily quiz questions' },
    { to: '/admin/contact', icon: Mail, label: 'Contact', description: 'View contact submissions' },
    { to: '/admin/settings', icon: Settings, label: 'Settings', description: 'Site settings & content' },
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Hero Section */}
      <ScrollReveal animation="fade-down">
        <section className="hero-section" style={{
          background: 'linear-gradient(135deg, #003DA5 0%, #DC143C 100%)',
          minHeight: '40vh'
        }}>
          <div className="hero-overlay" />
          <div className="hero-content">
            <div className="inline-flex items-center justify-center p-4 bg-white/20 rounded-full mb-4">
              <Shield className="text-white" size={48} />
            </div>
            <h1 className="hero-title">Admin Dashboard</h1>
            <p className="hero-subtitle">Manage all aspects of The Quiz Master General website</p>
          </div>
        </section>
      </ScrollReveal>

      <div className="section bg-gray-950">
        <div className="container-custom">

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {adminSections.map((section, index) => (
              <ScrollReveal key={section.to} animation="fade-up" delay={index * 50}>
                <Link
                  to={section.to}
                  className="service-card text-center hover:scale-105 transform transition-all hover:border-brit-gold/50 block"
                >
                  <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #003DA5 0%, #DC143C 100%)'
                  }}>
                    <section.icon className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-black mb-2 uppercase text-brit-gold">{section.label}</h3>
                  <p className="text-base text-gray-300">{section.description}</p>
                </Link>
              </ScrollReveal>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScrollReveal animation="scale-up" delay={0}>
              <div className="service-card" style={{
                background: 'linear-gradient(135deg, rgba(0, 61, 165, 0.3) 0%, rgba(0, 61, 165, 0.1) 100%)',
                borderColor: 'rgba(0, 61, 165, 0.5)'
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <Activity className="text-brit-gold" size={32} />
                  <h3 className="text-2xl font-black uppercase text-brit-gold">Quick Tips</h3>
                </div>
                <ul className="space-y-3 text-base text-gray-200">
                  <li className="flex items-start">
                    <span className="text-brit-gold mr-2">•</span>
                    <span>Upload images for events and team members</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brit-gold mr-2">•</span>
                    <span>Keep events calendar up to date</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brit-gold mr-2">•</span>
                    <span>Feature your best reviews</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brit-gold mr-2">•</span>
                    <span>Update contact information regularly</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="scale-up" delay={100}>
              <div className="service-card" style={{
                background: 'linear-gradient(135deg, rgba(220, 20, 60, 0.3) 0%, rgba(220, 20, 60, 0.1) 100%)',
                borderColor: 'rgba(220, 20, 60, 0.5)'
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="text-brit-red" size={32} />
                  <h3 className="text-2xl font-black uppercase text-brit-red">Important</h3>
                </div>
                <ul className="space-y-3 text-base text-gray-200">
                  <li className="flex items-start">
                    <span className="text-brit-red mr-2">•</span>
                    <span>Change default admin password!</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brit-red mr-2">•</span>
                    <span>Back up database regularly</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brit-red mr-2">•</span>
                    <span>Test contact form submissions</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-brit-red mr-2">•</span>
                    <span>Keep service descriptions current</span>
                  </li>
                </ul>
              </div>
            </ScrollReveal>

            <ScrollReveal animation="scale-up" delay={200}>
              <div className="service-card" style={{
                background: 'linear-gradient(135deg, rgba(255, 183, 0, 0.3) 0%, rgba(255, 183, 0, 0.1) 100%)',
                borderColor: 'rgba(255, 183, 0, 0.5)'
              }}>
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="text-brit-gold" size={32} />
                  <h3 className="text-2xl font-black uppercase text-brit-gold">Need Help?</h3>
                </div>
                <p className="text-base text-gray-200">
                  Check the README.md file in the project root for detailed documentation
                  on how to use each admin panel feature.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
