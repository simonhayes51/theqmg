import { useState, useEffect } from 'react';
import { Instagram, Facebook, Twitter } from 'lucide-react';

const SocialMediaFeed = () => {
  const [socialLinks, setSocialLinks] = useState({
    instagram_url: '',
    facebook_url: '',
    twitter_url: ''
  });

  // For now, this is a placeholder component
  // Full Instagram API integration would require:
  // 1. Instagram Basic Display API credentials
  // 2. Backend route to fetch posts
  // 3. OAuth authentication flow

  const instagramPosts = [
    {
      id: 1,
      image: 'https://via.placeholder.com/300x300/DC143C/FFFFFF?text=Quiz+Night',
      caption: 'Another fantastic quiz night! 🎯',
      likes: 45
    },
    {
      id: 2,
      image: 'https://via.placeholder.com/300x300/003DA5/FFFFFF?text=Winners',
      caption: 'Congratulations to our winners! 🏆',
      likes: 62
    },
    {
      id: 3,
      image: 'https://via.placeholder.com/300x300/DC143C/FFFFFF?text=Event',
      caption: 'Join us for the next event! 📅',
      likes: 38
    }
  ];

  return (
    <section className="section bg-white">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="section-title">Follow Us</h2>
          <p className="text-gray-600 mb-6">Stay updated with our latest quiz nights and events!</p>

          {/* Social Media Icons */}
          <div className="flex justify-center gap-4 mb-8">
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-full hover:scale-110 transition-transform"
              aria-label="Follow us on Instagram"
            >
              <Instagram size={24} />
            </a>
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white p-4 rounded-full hover:scale-110 transition-transform"
              aria-label="Follow us on Facebook"
            >
              <Facebook size={24} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-sky-500 text-white p-4 rounded-full hover:scale-110 transition-transform"
              aria-label="Follow us on Twitter"
            >
              <Twitter size={24} />
            </a>
          </div>
        </div>

        {/* Instagram-style Feed Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {instagramPosts.map((post) => (
            <div key={post.id} className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-shadow">
              <img
                src={post.image}
                alt={post.caption}
                className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="text-white text-center p-4">
                  <p className="mb-2">{post.caption}</p>
                  <p className="text-sm">❤️ {post.likes} likes</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary inline-flex items-center gap-2"
          >
            <Instagram size={20} />
            View More on Instagram
          </a>
        </div>

        {/* Admin Note */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg text-sm text-gray-600">
          <p className="font-semibold mb-2">📝 Note for Admin:</p>
          <p>
            To display real Instagram posts, configure your Instagram API credentials in the admin settings.
            This requires setting up Instagram Basic Display API and adding your access token.
          </p>
        </div>
      </div>
    </section>
  );
};

export default SocialMediaFeed;
