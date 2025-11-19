import { Link } from 'react-router-dom';
import { Calendar, MapPin, Star, Users, Image, Settings, Mail, Briefcase } from 'lucide-react';

const Dashboard = () => {
  const adminSections = [
    { to: '/admin/events', icon: Calendar, label: 'Events', color: 'bg-blue-500', description: 'Manage events and calendar' },
    { to: '/admin/venues', icon: MapPin, label: 'Venues', color: 'bg-green-500', description: 'Manage venue listings' },
    { to: '/admin/services', icon: Briefcase, label: 'Services', color: 'bg-purple-500', description: 'Edit service offerings' },
    { to: '/admin/reviews', icon: Star, label: 'Reviews', color: 'bg-yellow-500', description: 'Manage testimonials' },
    { to: '/admin/team', icon: Users, label: 'Team', color: 'bg-red-500', description: 'Manage team members' },
    { to: '/admin/gallery', icon: Image, label: 'Gallery', color: 'bg-pink-500', description: 'Upload & manage images' },
    { to: '/admin/contact', icon: Mail, label: 'Contact', color: 'bg-indigo-500', description: 'View contact submissions' },
    { to: '/admin/settings', icon: Settings, label: 'Settings', color: 'bg-gray-500', description: 'Site settings & content' },
  ];

  return (
    <div className="min-h-screen bg-quiz-gray py-12">
      <div className="container-custom">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-heading text-quiz-blue mb-4">
            ADMIN DASHBOARD
          </h1>
          <p className="text-gray-600 text-lg">
            Manage all aspects of The Quiz Master General website
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {adminSections.map((section) => (
            <Link
              key={section.to}
              to={section.to}
              className="card hover:shadow-xl transition-all group"
            >
              <div className={`${section.color} w-16 h-16 rounded flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <section.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-heading text-quiz-blue mb-2">{section.label}</h3>
              <p className="text-sm text-gray-600">{section.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card bg-quiz-blue text-white">
            <h3 className="text-2xl font-heading mb-2">Quick Tips</h3>
            <ul className="space-y-2 text-sm">
              <li>• Upload images for events and team members</li>
              <li>• Keep events calendar up to date</li>
              <li>• Feature your best reviews</li>
              <li>• Update contact information regularly</li>
            </ul>
          </div>

          <div className="card bg-quiz-red text-white">
            <h3 className="text-2xl font-heading mb-2">Important</h3>
            <ul className="space-y-2 text-sm">
              <li>• Change default admin password!</li>
              <li>• Back up database regularly</li>
              <li>• Test contact form submissions</li>
              <li>• Keep service descriptions current</li>
            </ul>
          </div>

          <div className="card bg-mod-blue text-white">
            <h3 className="text-2xl font-heading mb-2">Need Help?</h3>
            <p className="text-sm mb-4">
              Check the README.md file in the project root for detailed documentation
              on how to use each admin panel feature.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
