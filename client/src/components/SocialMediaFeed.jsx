import { useState, useEffect } from 'react';
import { Instagram, Facebook, Twitter, RefreshCw } from 'lucide-react';
import { socialMediaAPI, settingsAPI } from '../services/api';
import ScrollReveal from '../hooks/useScrollAnimation';

const SocialMediaFeed = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socialLinks, setSocialLinks] = useState({
    instagram_url: '',
    facebook_url: '',
    twitter_url: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPosts();
    loadSocialLinks();
  }, []);

  const loadSocialLinks = async () => {
    try {
      const response = await settingsAPI.getAll();
      // Response.data is an object { key: value }, not an array
      const settings = response.data;
      setSocialLinks({
        instagram_url: settings.instagram_url || 'https://instagram.com',
        facebook_url: settings.facebook_url || 'https://facebook.com',
        twitter_url: settings.twitter_url || 'https://twitter.com'
      });
    } catch (err) {
      console.error('Error loading social links:', err);
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to fetch Instagram posts first
      const instagramResponse = await socialMediaAPI.getInstagramPosts();

      if (instagramResponse.data.enabled && instagramResponse.data.posts.length > 0) {
        setPosts(instagramResponse.data.posts.map(post => ({
          id: post.id,
          image: post.image_url,
          caption: post.caption,
          platform: 'instagram',
          permalink: post.permalink
        })));
      } else {
        // If Instagram not configured, try Facebook
        const facebookResponse = await socialMediaAPI.getFacebookPosts();

        if (facebookResponse.data.enabled && facebookResponse.data.posts.length > 0) {
          setPosts(facebookResponse.data.posts.map(post => ({
            id: post.id,
            image: post.image_url || '/placeholder-post.png',
            caption: post.message,
            platform: 'facebook',
            permalink: post.permalink
          })));
        } else {
          // Show placeholder posts if no social media configured
          setPosts([
            {
              id: 1,
              image: '/placeholder-quiz.png',
              caption: 'Another fantastic quiz night! 🎯',
              platform: 'placeholder'
            },
            {
              id: 2,
              image: '/placeholder-winners.png',
              caption: 'Congratulations to our winners! 🏆',
              platform: 'placeholder'
            },
            {
              id: 3,
              image: '/placeholder-event.png',
              caption: 'Join us for the next event! 📅',
              platform: 'placeholder'
            }
          ]);
          setError('Social media not configured. Please configure in admin settings.');
        }
      }
    } catch (err) {
      console.error('Error loading social media posts:', err);
      setError('Unable to load social media posts');
      // Show placeholder on error
      setPosts([
        {
          id: 1,
          image: '/placeholder-quiz.png',
          caption: 'Another fantastic quiz night! 🎯',
          platform: 'placeholder'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Don't show loading state
  if (loading) {
    return null;
  }

  // Check if we have real posts (not placeholder)
  const hasRealPosts = posts.length > 0 && posts[0]?.platform !== 'placeholder';

  return (
    <section className="section bg-gray-900">
      <div className="container-custom">
        <ScrollReveal animation="fade-up">
          <div className="text-center mb-12">
            <h2 className="section-title text-brit-gold">Follow Our Journey</h2>
            <p className="section-subtitle">Stay updated with our latest quiz nights and events!</p>

            {/* Social Media Icons - Always show them */}
            <div className="flex justify-center gap-6 mt-8">
              {/* Instagram */}
              {socialLinks.instagram_url ? (
                <a
                  href={socialLinks.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  aria-label="Follow us on Instagram"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110" style={{
                    background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)'
                  }}>
                    <Instagram size={28} className="text-white" />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Instagram
                  </span>
                </a>
              ) : (
                <div className="group relative">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{
                    background: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #F77737 100%)'
                  }}>
                    <Instagram size={28} className="text-white" />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Instagram
                  </span>
                </div>
              )}

              {/* Facebook */}
              {socialLinks.facebook_url ? (
                <a
                  href={socialLinks.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  aria-label="Follow us on Facebook"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-600 transition-all hover:scale-110">
                    <Facebook size={28} className="text-white" />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Facebook
                  </span>
                </a>
              ) : (
                <div className="group relative">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-blue-600">
                    <Facebook size={28} className="text-white" />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Facebook
                  </span>
                </div>
              )}

              {/* Twitter */}
              {socialLinks.twitter_url ? (
                <a
                  href={socialLinks.twitter_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative"
                  aria-label="Follow us on Twitter"
                >
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-sky-500 transition-all hover:scale-110">
                    <Twitter size={28} className="text-white" />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Twitter
                  </span>
                </a>
              ) : (
                <div className="group relative">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center bg-sky-500">
                    <Twitter size={28} className="text-white" />
                  </div>
                  <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    Twitter
                  </span>
                </div>
              )}
            </div>
          </div>
        </ScrollReveal>

        {/* Social Media Feed Grid - Only show if we have real posts */}
        {hasRealPosts && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
              {posts.slice(0, 6).map((post, index) => (
                <ScrollReveal key={post.id} animation="fade-up" delay={index * 100}>
                  <div className="group relative overflow-hidden rounded-2xl border-2 border-brit-gold/20 hover:border-brit-gold/50 transition-all">
                    {post.permalink ? (
                      <a href={post.permalink} target="_blank" rel="noopener noreferrer">
                        <img
                          src={post.image}
                          alt={post.caption || 'Social media post'}
                          className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                          onError={(e) => {
                            e.target.src = '/placeholder-post.png';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                          <p className="text-white text-sm line-clamp-4">{post.caption || 'View on ' + post.platform}</p>
                        </div>
                      </a>
                    ) : (
                      <>
                        <img
                          src={post.image}
                          alt={post.caption || 'Social media post'}
                          className="w-full h-72 object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                          <p className="text-white text-sm line-clamp-4">{post.caption}</p>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollReveal>
              ))}
            </div>

            {/* View More Button */}
            {posts[0]?.platform === 'instagram' && socialLinks.instagram_url && (
              <ScrollReveal animation="scale-up">
                <div className="text-center mt-12">
                  <a
                    href={socialLinks.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary inline-flex items-center gap-2 hover:scale-105 transform transition-transform"
                  >
                    <Instagram size={20} />
                    View More on Instagram
                  </a>
                </div>
              </ScrollReveal>
            )}

            {posts[0]?.platform === 'facebook' && socialLinks.facebook_url && (
              <ScrollReveal animation="scale-up">
                <div className="text-center mt-12">
                  <a
                    href={socialLinks.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary inline-flex items-center gap-2 hover:scale-105 transform transition-transform"
                  >
                    <Facebook size={20} />
                    View More on Facebook
                  </a>
                </div>
              </ScrollReveal>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default SocialMediaFeed;
